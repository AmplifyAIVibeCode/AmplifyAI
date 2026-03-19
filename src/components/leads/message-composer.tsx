"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";

type Direction = "inbound" | "outbound";

type LeadStatus = "hot" | "warm" | "cold";

export function LeadMessageComposer({
  leadId,
  leadStatus,
}: {
  leadId: string;
  leadStatus: LeadStatus;
}) {
  const router = useRouter();
  const [direction, setDirection] = useState<Direction>("inbound");
  const [body, setBody] = useState("");
  const isColdLead = leadStatus === "cold";
  const [generateReply, setGenerateReply] = useState(isColdLead);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      const supabase = createSupabaseBrowserClient();

      const { data: inserted, error: insertError } = await supabase
        .from("lead_messages")
        .insert({
          lead_id: leadId,
          direction,
          body,
        })
        .select("id")
        .single<{ id: string }>();

      if (insertError) throw insertError;

      setBody("");

      if (direction === "inbound" && generateReply && isColdLead) {
        const resp = await fetch("/api/ai/reply", {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({
            leadId,
            inboundMessageId: inserted.id,
          }),
        });

        if (!resp.ok) {
          const msg = await resp.text();
          throw new Error(msg || "AI reply failed.");
        }
      }

      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to save message.");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <form className="flex flex-col gap-3" onSubmit={onSubmit}>
      <div className="grid gap-2">
        <label className="text-sm font-medium text-zinc-900">Direction</label>
        <div className="grid grid-cols-2 gap-2">
          <button
            type="button"
            className={
              direction === "inbound"
                ? "h-10 rounded-xl bg-zinc-950 text-sm font-medium text-white"
                : "h-10 rounded-xl border border-zinc-200 bg-white text-sm font-medium text-zinc-900 hover:bg-zinc-50"
            }
            onClick={() => setDirection("inbound")}
          >
            Inbound (lead)
          </button>
          <button
            type="button"
            className={
              direction === "outbound"
                ? "h-10 rounded-xl bg-zinc-950 text-sm font-medium text-white"
                : "h-10 rounded-xl border border-zinc-200 bg-white text-sm font-medium text-zinc-900 hover:bg-zinc-50"
            }
            onClick={() => setDirection("outbound")}
          >
            Outbound (you)
          </button>
        </div>
      </div>

      <div className="grid gap-2">
        <label className="text-sm font-medium text-zinc-900">Message</label>
        <textarea
          className="min-h-[120px] w-full resize-y rounded-xl border border-zinc-200 bg-white p-3 text-sm text-zinc-950 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-zinc-900/10"
          value={body}
          onChange={(e) => setBody(e.target.value)}
          placeholder={
            direction === "inbound"
              ? "Paste the lead's message…"
              : "Write your reply…"
          }
          required
        />
      </div>

      <label className="flex items-center gap-2 text-sm text-zinc-700">
        <input
          type="checkbox"
          className="h-4 w-4 rounded border-zinc-300"
          checked={generateReply}
          onChange={(e) => setGenerateReply(e.target.checked)}
          disabled={direction !== "inbound" || !isColdLead}
        />
        Generate AI follow-up (only for cold / lost leads)
      </label>

      {error ? (
        <div className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800">
          {error}
        </div>
      ) : null}

      <Button type="submit" disabled={isLoading || body.trim().length === 0}>
        {isLoading ? "Saving…" : "Save"}
      </Button>
    </form>
  );
}

