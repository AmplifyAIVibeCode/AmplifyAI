import { createSupabaseServerClient } from "@/lib/supabase/server";
import { Card } from "@/components/ui/card";
import Link from "next/link";

export default async function DashboardPage() {
  const supabase = await createSupabaseServerClient();

  const now = new Date();
  const sevenDaysAgo = new Date(
    now.getTime() - 7 * 24 * 60 * 60 * 1000,
  ).toISOString();

  const [
    { count: totalLeads },
    { data: hotLeads },
    { count: inactiveCount },
    { data: allLeads },
    { data: needFollowUp },
  ] = await Promise.all([
    // Total leads
    supabase.from("leads").select("id", { count: "exact", head: true }),

    // Hot leads (likely to convert) — also get budget_max for deal value
    supabase
      .from("leads")
      .select("id, budget_max")
      .eq("status", "hot"),

    // Inactive leads (no messages in 7+ days based on last_interaction or updated_at)
    supabase
      .from("leads")
      .select("id", { count: "exact", head: true })
      .lt("updated_at", sevenDaysAgo),

    // All leads with status for distribution
    supabase.from("leads").select("id, status, score"),

    // Leads needing follow-up: have inbound messages but no recent outbound
    // We approximate this by finding leads with the most recent message being inbound
    supabase
      .from("lead_messages")
      .select("lead_id, direction")
      .order("created_at", { ascending: false }),
  ]);

  // Calculate estimated deal value from hot leads
  const estimatedDealValue = (hotLeads ?? []).reduce(
    (sum, l) => sum + (l.budget_max ?? 0),
    0,
  );

  // Calculate leads needing follow-up (last message is inbound)
  const lastMessageByLead = new Map<string, string>();
  for (const msg of needFollowUp ?? []) {
    if (!lastMessageByLead.has(msg.lead_id)) {
      lastMessageByLead.set(msg.lead_id, msg.direction);
    }
  }
  const needsFollowUpCount = Array.from(lastMessageByLead.values()).filter(
    (d) => d === "inbound",
  ).length;

  // Status distribution
  const statusCounts = { hot: 0, warm: 0, cold: 0 };
  for (const lead of allLeads ?? []) {
    if (lead.status in statusCounts) {
      statusCounts[lead.status as keyof typeof statusCounts]++;
    }
  }

  return (
    <div className="flex w-full flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold text-zinc-950">
          Opportunity Dashboard
        </h1>
        <p className="mt-1 text-sm text-zinc-600">
          Lead insights, conversion signals, and follow-up alerts.
        </p>
      </div>

      {/* Primary insight cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="p-5">
          <div className="text-sm text-zinc-600">Likely to convert</div>
          <div className="mt-2 text-3xl font-semibold text-zinc-950">
            {hotLeads?.length ?? 0}
          </div>
          <div className="mt-1 text-xs text-zinc-500">
            Hot leads (score ≥ 70)
          </div>
        </Card>

        <Card className="p-5">
          <div className="text-sm text-zinc-600">Estimated deal value</div>
          <div className="mt-2 text-3xl font-semibold text-zinc-950">
            {estimatedDealValue > 0
              ? `$${estimatedDealValue.toLocaleString()}`
              : "—"}
          </div>
          <div className="mt-1 text-xs text-zinc-500">
            Budget total from hot leads
          </div>
        </Card>

        <Card className="p-5">
          <div className="text-sm text-zinc-600">Inactive &gt; 7 days</div>
          <div className="mt-2 text-3xl font-semibold text-zinc-950">
            {inactiveCount ?? 0}
          </div>
          <div className="mt-1 text-xs text-zinc-500">
            Leads with no recent activity
          </div>
        </Card>

        <Card className="p-5">
          <div className="text-sm text-zinc-600">Need follow-up</div>
          <div className="mt-2 text-3xl font-semibold text-zinc-950">
            {needsFollowUpCount}
          </div>
          <div className="mt-1 text-xs text-zinc-500">
            Last message was from lead
          </div>
        </Card>
      </div>

      {/* Status breakdown */}
      <Card className="p-6">
        <div className="text-sm font-medium text-zinc-950">
          Lead distribution
        </div>
        <div className="mt-4 grid gap-3 sm:grid-cols-3">
          <div className="rounded-xl border border-zinc-200 p-4 text-center">
            <div className="text-2xl font-semibold text-zinc-950">
              {statusCounts.hot}
            </div>
            <div className="mt-1 text-sm text-zinc-600">🔥 Hot</div>
          </div>
          <div className="rounded-xl border border-zinc-200 p-4 text-center">
            <div className="text-2xl font-semibold text-zinc-950">
              {statusCounts.warm}
            </div>
            <div className="mt-1 text-sm text-zinc-600">🟡 Warm</div>
          </div>
          <div className="rounded-xl border border-zinc-200 p-4 text-center">
            <div className="text-2xl font-semibold text-zinc-950">
              {statusCounts.cold}
            </div>
            <div className="mt-1 text-sm text-zinc-600">🧊 Cold</div>
          </div>
        </div>
      </Card>

      {/* Quick action */}
      <Card className="p-6">
        <div className="text-sm font-medium text-zinc-950">Quick actions</div>
        <div className="mt-3 flex flex-wrap gap-3">
          <Link
            href="/app/leads"
            className="inline-flex h-10 items-center justify-center rounded-xl border border-zinc-200 bg-white px-4 text-sm font-medium text-zinc-950 hover:bg-zinc-50"
          >
            View all leads ({totalLeads ?? 0})
          </Link>
          <Link
            href="/app/leads/new"
            className="inline-flex h-10 items-center justify-center rounded-xl bg-zinc-950 px-4 text-sm font-medium text-white hover:bg-zinc-800"
          >
            Add lead
          </Link>
        </div>
      </Card>
    </div>
  );
}
