import { NextResponse } from "next/server";
import OpenAI from "openai";
import { z } from "zod";
import { getServerEnv } from "@/lib/env";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { scoreLead, type ScoreInput } from "@/lib/scoring";

const bodySchema = z.object({
  leadId: z.string().uuid(),
});

export async function POST(req: Request) {
  const env = getServerEnv();

  if (!env.OPENAI_API_KEY) {
    return new NextResponse("Missing OPENAI_API_KEY.", { status: 500 });
  }

  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return new NextResponse("Unauthorized.", { status: 401 });

  const parsed = bodySchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid request body.", issues: parsed.error.issues },
      { status: 400 },
    );
  }

  const { leadId } = parsed.data;

  const [{ data: lead }, { data: messages }] = await Promise.all([
    supabase
      .from("leads")
      .select("id, full_name, phone, status")
      .eq("id", leadId)
      .single(),
    supabase
      .from("lead_messages")
      .select("direction, body, created_at")
      .eq("lead_id", leadId)
      .order("created_at", { ascending: true }),
  ]);

  if (!lead) return new NextResponse("Lead not found.", { status: 404 });

  const conversation = (messages ?? [])
    .map((m) => `${m.direction === "inbound" ? "Lead" : "Agent"}: ${m.body}`)
    .join("\n");

  const openai = new OpenAI({ apiKey: env.OPENAI_API_KEY });
  const model = env.OPENAI_REPLY_MODEL ?? "gpt-4.1-mini";

  const systemPrompt = [
    "You are analyzing a real estate lead's conversation to extract structured data.",
    "Return a JSON object with EXACTLY these fields:",
    '  intent: "buy" | "sell" | "rent" | "unknown"',
    "  budget_min: number or null (in the local currency, no symbols)",
    "  budget_max: number or null",
    '  property_type: string or null (e.g. "apartment", "house", "villa", "office")',
    "  urgency: number 1-10 (10 = extremely urgent, 1 = no urgency)",
    '  interest_signals: string (brief comma-separated signals like "asked about viewings, requested floor plans")',
    "Do NOT include any text outside the JSON object.",
  ].join("\n");

  const userPrompt = [
    `Lead name: ${lead.full_name ?? "Unknown"}`,
    `Phone: ${lead.phone ?? "Unknown"}`,
    "",
    "Conversation:",
    conversation || "(no messages)",
    "",
    "Analyze and return JSON.",
  ].join("\n");

  const completion = await openai.chat.completions.create({
    model,
    messages: [
      { role: "system", content: systemPrompt },
      { role: "user", content: userPrompt },
    ],
    temperature: 0.2,
  });

  const raw = completion.choices[0]?.message?.content?.trim();
  if (!raw) return new NextResponse("No analysis generated.", { status: 502 });

  let analysis;
  try {
    analysis = JSON.parse(raw);
  } catch {
    return NextResponse.json(
      { error: "AI returned invalid JSON.", raw },
      { status: 502 },
    );
  }

  // Determine last interaction date from messages
  const lastMsg = (messages ?? []).at(-1);
  const lastInteraction = lastMsg?.created_at ?? null;

  // Compute score
  const scoreInput: ScoreInput = {
    lastInteraction,
    messageCount: (messages ?? []).length,
    intent: analysis.intent ?? "unknown",
    urgency: Number(analysis.urgency) || 0,
    budgetMin: analysis.budget_min ?? null,
    budgetMax: analysis.budget_max ?? null,
  };

  const { score, status } = scoreLead(scoreInput);

  // Save analysis + score to leads table
  const { error: updateError } = await supabase
    .from("leads")
    .update({
      intent: analysis.intent ?? "unknown",
      budget_min: analysis.budget_min ?? null,
      budget_max: analysis.budget_max ?? null,
      property_type: analysis.property_type ?? null,
      urgency: Number(analysis.urgency) || 0,
      interest_signals: analysis.interest_signals ?? null,
      last_interaction: lastInteraction,
      score,
      status,
    })
    .eq("id", leadId);

  if (updateError) {
    return NextResponse.json(
      { error: "Failed to save analysis.", details: updateError.message },
      { status: 500 },
    );
  }

  return NextResponse.json({
    analysis: {
      intent: analysis.intent,
      budget_min: analysis.budget_min,
      budget_max: analysis.budget_max,
      property_type: analysis.property_type,
      urgency: analysis.urgency,
      interest_signals: analysis.interest_signals,
    },
    score,
    status,
  });
}
