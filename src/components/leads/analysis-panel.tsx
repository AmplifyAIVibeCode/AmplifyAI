"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";

interface Props {
  leadId: string;
  analysis: {
    intent: string;
    budget_min: number | null;
    budget_max: number | null;
    property_type: string | null;
    urgency: number;
    interest_signals: string | null;
    score: number;
    status: string;
  } | null;
}

export function LeadAnalysisPanel({ leadId, analysis }: Props) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onAnalyze() {
    setError(null);
    setIsLoading(true);

    try {
      const resp = await fetch("/api/ai/analyze", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ leadId }),
      });

      if (!resp.ok) {
        const msg = await resp.text();
        throw new Error(msg || "Analysis failed.");
      }

      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Analysis failed.");
    } finally {
      setIsLoading(false);
    }
  }

  const hasAnalysis = analysis && analysis.intent !== "unknown";

  return (
    <div className="flex flex-col gap-3">
      {hasAnalysis ? (
        <div className="grid gap-2 text-sm">
          <div className="flex items-center justify-between">
            <span className="text-zinc-600">Score</span>
            <span className="font-semibold text-zinc-950">
              {analysis.score}/100
              <span className="ml-2 rounded-full border border-zinc-200 bg-white px-2 py-0.5 text-xs font-medium text-zinc-700">
                {analysis.status.toUpperCase()}
              </span>
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-zinc-600">Intent</span>
            <span className="font-medium text-zinc-950 capitalize">
              {analysis.intent}
            </span>
          </div>
          {(analysis.budget_min || analysis.budget_max) && (
            <div className="flex items-center justify-between">
              <span className="text-zinc-600">Budget</span>
              <span className="font-medium text-zinc-950">
                {analysis.budget_min?.toLocaleString() ?? "?"} –{" "}
                {analysis.budget_max?.toLocaleString() ?? "?"}
              </span>
            </div>
          )}
          {analysis.property_type && (
            <div className="flex items-center justify-between">
              <span className="text-zinc-600">Property</span>
              <span className="font-medium text-zinc-950 capitalize">
                {analysis.property_type}
              </span>
            </div>
          )}
          <div className="flex items-center justify-between">
            <span className="text-zinc-600">Urgency</span>
            <span className="font-medium text-zinc-950">
              {analysis.urgency}/10
            </span>
          </div>
          {analysis.interest_signals && (
            <div className="flex flex-col gap-1">
              <span className="text-zinc-600">Signals</span>
              <span className="text-zinc-950">
                {analysis.interest_signals}
              </span>
            </div>
          )}
        </div>
      ) : (
        <div className="text-sm text-zinc-600">
          No analysis yet. Click below to analyze this lead with AI.
        </div>
      )}

      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800">
          {error}
        </div>
      )}

      <Button
        type="button"
        variant={hasAnalysis ? "secondary" : "primary"}
        onClick={onAnalyze}
        disabled={isLoading}
      >
        {isLoading
          ? "Analyzing…"
          : hasAnalysis
            ? "Re-analyze"
            : "🔍 Analyze Lead"}
      </Button>
    </div>
  );
}
