
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { DashboardClient } from "./dashboard-client";

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
    <DashboardClient
      hotLeads={hotLeads ?? []}
      estimatedDealValue={estimatedDealValue}
      inactiveCount={inactiveCount ?? 0}
      needsFollowUpCount={needsFollowUpCount}
      statusCounts={statusCounts}
      totalLeads={totalLeads ?? 0}
    />
  );
}
