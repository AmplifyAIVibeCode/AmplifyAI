import { NextResponse } from "next/server";
import OpenAI from "openai";
import { z } from "zod";
import { getServerEnv } from "@/lib/env";
import { createSupabaseServerClient } from "@/lib/supabase/server";

const bodySchema = z.object({
  leadId: z.string().uuid(),
  inboundMessageId: z.string().uuid(),
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

  const { leadId, inboundMessageId } = parsed.data;

  const [{ data: lead }, { data: inbound }, { data: recentMessages }, { data: template }] =
    await Promise.all([
      supabase
        .from("leads")
        .select("id, full_name, email, phone, status")
        .eq("id", leadId)
        .single(),
      supabase
        .from("lead_messages")
        .select("id, lead_id, direction, body, created_at")
        .eq("id", inboundMessageId)
        .eq("lead_id", leadId)
        .single(),
      supabase
        .from("lead_messages")
        .select("direction, body, created_at")
        .eq("lead_id", leadId)
        .order("created_at", { ascending: false })
        .limit(12),
      supabase
        .from("response_templates")
        .select("system_prompt")
        .eq("is_default", true)
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle(),
    ]);

  if (!lead) return new NextResponse("Lead not found.", { status: 404 });
  if (lead.status !== "cold") {
    return new NextResponse(
      "AI follow-ups are only allowed for cold (lost) leads.",
      { status: 400 },
    );
  }
  if (!inbound || inbound.direction !== "inbound") {
    return new NextResponse("Inbound message not found.", { status: 404 });
  }

  const systemPrompt =
    template?.system_prompt ??
    [
      "You are an assistant helping a real estate agent re-engage cold, previously unresponsive (lost) leads.",
      "Write a concise, friendly, professional follow-up message in plain text.",
      "Assume the lead has not recently spoken with the agent and may have gone quiet.",
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
    `- Email: ${lead.email ?? "Unknown"}`,
    `- Phone: ${lead.phone ?? "Unknown"}`,
    `- Status: ${String(lead.status)}`,
    "",
    "Recent conversation:",
    conversationForModel || "(none)",
    "",
    "Latest inbound message (from when the lead was active):",
    inbound.body,
    "",
    "Write the agent's follow-up message now, tailored to a lost/cold lead.",
  ].join("\n");

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

  const reply = completion.choices[0]?.message?.content?.trim();
  if (!reply) return new NextResponse("No reply generated.", { status: 502 });

  const { error: insertError } = await supabase.from("lead_messages").insert({
    lead_id: leadId,
    direction: "outbound",
    body: reply,
  });

  if (insertError) {
    return NextResponse.json(
      { error: "Failed to save AI reply.", details: insertError.message },
      { status: 500 },
    );
  }

  return NextResponse.json({ reply });
}

