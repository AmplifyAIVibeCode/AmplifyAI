/**
 * Lead scoring function — computes a score 0–100 and maps to hot/warm/cold.
 *
 * Factors:
 *  - Recency of last interaction (0–30 pts)
 *  - Engagement: message count (0–25 pts)
 *  - Intent / viewing signals (0–25 pts)
 *  - Budget clarity (0–20 pts)
 */

export type LeadStatus = "hot" | "warm" | "cold";
export type LeadIntent = "buy" | "sell" | "rent" | "unknown";

export interface ScoreInput {
  lastInteraction: string | null; // ISO timestamp
  messageCount: number;
  intent: LeadIntent;
  urgency: number; // 0–10
  budgetMin: number | null;
  budgetMax: number | null;
}

export interface ScoreResult {
  score: number; // 0–100
  status: LeadStatus;
}

export function scoreLead(input: ScoreInput): ScoreResult {
  let score = 0;

  // --- Recency (0–30) ---
  if (input.lastInteraction) {
    const daysSince = Math.max(
      0,
      (Date.now() - new Date(input.lastInteraction).getTime()) /
        (1000 * 60 * 60 * 24),
    );
    if (daysSince <= 1) score += 30;
    else if (daysSince <= 3) score += 25;
    else if (daysSince <= 7) score += 18;
    else if (daysSince <= 14) score += 10;
    else if (daysSince <= 30) score += 5;
    // >30 days → 0
  }

  // --- Engagement: message count (0–25) ---
  const msgs = Math.min(input.messageCount, 20);
  score += Math.round((msgs / 20) * 25);

  // --- Intent + urgency (0–25) ---
  const intentWeight =
    input.intent === "buy"
      ? 15
      : input.intent === "rent"
        ? 12
        : input.intent === "sell"
          ? 10
          : 0;
  score += intentWeight;
  // urgency contributes proportionally to remaining 10 pts
  score += Math.round((Math.min(input.urgency, 10) / 10) * 10);

  // --- Budget clarity (0–20) ---
  if (input.budgetMin != null && input.budgetMax != null) {
    score += 20;
  } else if (input.budgetMin != null || input.budgetMax != null) {
    score += 10;
  }

  // Clamp
  score = Math.max(0, Math.min(100, score));

  const status: LeadStatus =
    score >= 70 ? "hot" : score >= 30 ? "warm" : "cold";

  return { score, status };
}
