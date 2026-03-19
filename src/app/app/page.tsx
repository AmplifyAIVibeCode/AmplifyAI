import { createSupabaseServerClient } from "@/lib/supabase/server";
import { Card } from "@/components/ui/card";

export default async function DashboardPage() {
  const supabase = await createSupabaseServerClient();

  // These queries assume the SQL in supabase/migrations has been applied.
  const [{ count: leadsCount }, { count: followUpsDueCount }] = await Promise.all([
    supabase.from("leads").select("id", { count: "exact", head: true }),
    supabase
      .from("follow_ups")
      .select("id", { count: "exact", head: true })
      .lte("due_at", new Date().toISOString())
      .eq("status", "due"),
  ]);

  return (
    <div className="flex w-full flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold text-zinc-950">Dashboard</h1>
        <p className="mt-1 text-sm text-zinc-600">
          Lead stats, response rates, and follow-ups due.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="p-5">
          <div className="text-sm text-zinc-600">Total leads</div>
          <div className="mt-2 text-3xl font-semibold text-zinc-950">
            {leadsCount ?? 0}
          </div>
        </Card>
        <Card className="p-5">
          <div className="text-sm text-zinc-600">Follow-ups due</div>
          <div className="mt-2 text-3xl font-semibold text-zinc-950">
            {followUpsDueCount ?? 0}
          </div>
        </Card>
        <Card className="p-5">
          <div className="text-sm text-zinc-600">Response rate</div>
          <div className="mt-2 text-3xl font-semibold text-zinc-950">—</div>
          <div className="mt-1 text-xs text-zinc-500">MVP placeholder</div>
        </Card>
        <Card className="p-5">
          <div className="text-sm text-zinc-600">Conversions</div>
          <div className="mt-2 text-3xl font-semibold text-zinc-950">—</div>
          <div className="mt-1 text-xs text-zinc-500">MVP placeholder</div>
        </Card>
      </div>

      <Card className="p-6">
        <div className="text-sm font-medium text-zinc-950">Next steps</div>
        <ul className="mt-3 list-disc space-y-1 pl-5 text-sm text-zinc-700">
          <li>Create your first lead in the Leads tab.</li>
          <li>Schedule follow-ups for leads who go quiet.</li>
          <li>Use AI follow-ups only for cold / lost leads you want to re-engage.</li>
        </ul>
      </Card>
    </div>
  );
}

