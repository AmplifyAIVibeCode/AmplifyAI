"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";

export function LeadMessageComposer({ leadId }: { leadId: string }) {
  const router = useRouter();
  const [body, setBody] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSuggesting, setIsSuggesting] = useState(false);
  const [hasSuggestion, setHasSuggestion] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /* ── Generate AI suggestion (human-in-the-loop) ── */
  async function onGenerateSuggestion() {
    setError(null);
    setIsSuggesting(true);

    try {
      const resp = await fetch("/api/ai/reply", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ leadId }),
      });

      if (!resp.ok) {
        const msg = await resp.text();
        throw new Error(msg || "Failed to generate suggestion.");
      }

      const data = await resp.json();
      setBody(data.suggestion);
      setHasSuggestion(true);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to generate suggestion.",
      );
    } finally {
      setIsSuggesting(false);
    }
  }

  /* ── Send (save to DB as outbound message) ── */
  async function onSend() {
    if (!body.trim()) return;
    setError(null);
    setIsLoading(true);

    try {
      const supabase = createSupabaseBrowserClient();

      const { error: insertError } = await supabase
        .from("lead_messages")
        .insert({
          lead_id: leadId,
          direction: "outbound" as const,
          body: body.trim(),
        });

      if (insertError) throw insertError;

      setBody("");
      setHasSuggestion(false);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to send message.");
    } finally {
      setIsLoading(false);
    }
  }

  /* ── Skip (discard suggestion) ── */
  function onSkip() {
    setBody("");
    setHasSuggestion(false);
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-col gap-2">
        <label className="text-sm font-medium text-zinc-900">Message</label>
        <textarea
          className="min-h-[120px] w-full resize-y rounded-xl border border-zinc-200 bg-white p-3 text-sm text-zinc-950 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-zinc-900/10"
          value={body}
          onChange={(e) => {
            setBody(e.target.value);
            if (hasSuggestion) setHasSuggestion(false); // user is editing
          }}
          placeholder="Write a message or generate an AI suggestion…"
        />
      </div>

      {hasSuggestion && (
        <div className="rounded-xl border border-blue-200 bg-blue-50 px-3 py-2 text-xs text-blue-800">
          ✨ AI suggestion loaded — edit, send, or skip.
        </div>
      )}

      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800">
          {error}
        </div>
      )}

      <div className="flex flex-wrap items-center gap-2">
        <Button
          type="button"
          onClick={onSend}
          disabled={isLoading || !body.trim()}
        >
          {isLoading ? "Sending…" : "Send"}
        </Button>

        <Button
          type="button"
          variant="secondary"
          onClick={onGenerateSuggestion}
          disabled={isSuggesting}
        >
          {isSuggesting ? "Generating…" : "✨ AI Suggest"}
        </Button>

        {hasSuggestion && (
          <Button type="button" variant="ghost" onClick={onSkip}>
            Skip
          </Button>
        )}
      </div>
    </div>
  );
}
