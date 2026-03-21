import { NextResponse } from "next/server";
import OpenAI from "openai";
import { z } from "zod";
import { getServerEnv } from "@/lib/env";
import { createSupabaseServerClient } from "@/lib/supabase/server";

const bodySchema = z.object({
  leadId: z.string().uuid(),
});

/**
 * Generates an AI message SUGGESTION for a lead.
 * Does NOT auto-save — the user decides to send, edit, or skip.
 */
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

  const [{ data: lead }, { data: recentMessages }] = await Promise.all([
    supabase
      .from("leads")
      .select("id, full_name, phone, status, intent, budget_min, budget_max, property_type, urgency")
      .eq("id", leadId)
      .single(),
    supabase
      .from("lead_messages")
      .select("direction, body, created_at")
      .eq("lead_id", leadId)
      .order("created_at", { ascending: false })
      .limit(12),
  ]);

  if (!lead) return new NextResponse("Lead not found.", { status: 404 });

  const systemPrompt = [
    "You are an assistant helping a real estate agent communicate with leads.",
    "Write a concise, friendly, professional follow-up message in plain text.",
    "Tailor the message to the lead's intent and conversation history.",
    "Ask at most one gentle clarifying question if useful, and suggest one next step (call, viewing, or availability).",
    "Do not mention you are an AI. Do not invent facts.",
  ].join("\n");

  const conversationForModel = (recentMessages ?? [])
    .slice()
    .reverse()
    .map((m) => `${m.direction === "inbound" ? "Lead" : "Agent"}: ${m.body}`)
    .join("\n");

  const userPrompt = [
    "Lead context:",
    `- Name: ${lead.full_name ?? "Unknown"}`,
    `- Phone: ${lead.phone ?? "Unknown"}`,
    `- Status: ${String(lead.status)}`,
    `- Intent: ${String(lead.intent ?? "unknown")}`,
    lead.budget_min || lead.budget_max
      ? `- Budget: ${lead.budget_min ?? "?"} – ${lead.budget_max ?? "?"}`
      : "",
    lead.property_type ? `- Property type: ${lead.property_type}` : "",
    lead.urgency ? `- Urgency: ${lead.urgency}/10` : "",
    "",
    "Recent conversation:",
    conversationForModel || "(none)",
    "",
    "Write the agent's follow-up message now.",
  ]
    .filter(Boolean)
    .join("\n");

  const openai = new OpenAI({ apiKey: env.OPENAI_API_KEY });
  const model = env.OPENAI_REPLY_MODEL ?? "gpt-4.1-mini";

  const completion = await openai.chat.completions.create({
    model,
    messages: [
      { role: "system", content: systemPrompt },
      { role: "user", content: userPrompt },
    ],
    temperature: 0.5,
  });

  const suggestion = completion.choices[0]?.message?.content?.trim();
  if (!suggestion)
    return new NextResponse("No suggestion generated.", { status: 502 });

  // Return suggestion only — DO NOT save to DB
  return NextResponse.json({ suggestion });
}
