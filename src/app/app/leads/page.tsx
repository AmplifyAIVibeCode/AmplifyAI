import Link from "next/link";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { Card } from "@/components/ui/card";

type LeadRow = {
  id: string;
  full_name: string | null;
  phone: string | null;
  status: "hot" | "warm" | "cold";
  score: number;
  intent: string;
  created_at: string;
};

export default async function LeadsPage() {
  const supabase = await createSupabaseServerClient();

  const { data: leads, error } = await supabase
    .from("leads")
    .select("id, full_name, phone, status, score, intent, created_at")
    .order("score", { ascending: false })
    .returns<LeadRow[]>();

  return (
    <div className="flex w-full flex-col items-center gap-10 bg-gradient-to-b from-white to-zinc-50 min-h-screen py-10">
      <div className="w-full max-w-6xl flex flex-col gap-8">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-zinc-900 tracking-tight">Leads Hub</h1>
            <p className="mt-1 text-base text-zinc-500 max-w-2xl">
              Central workspace for your pipeline. Filter by priority, track status, and call your hottest leads first.
            </p>
          </div>
          <button
            type="button"
            disabled
            className="h-10 px-6 rounded-xl bg-zinc-200 text-zinc-400 shadow-sm cursor-not-allowed"
            aria-label="Add lead (disabled)"
          >
            Add lead (disabled)
          </button>
        </div>

        {/* Primary lead overview */}
        <Card className="p-6 bg-white/90 shadow-lg backdrop-blur-md border border-zinc-100">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="rounded-xl bg-zinc-100 p-4">
              <p className="text-xs uppercase tracking-wider text-zinc-500">Total leads</p>
              <p className="text-2xl font-bold">{leads?.length ?? 0}</p>
            </div>
            <div className="rounded-xl bg-zinc-100 p-4">
              <p className="text-xs uppercase tracking-wider text-zinc-500">Hot leads</p>
              <p className="text-2xl font-bold">{(leads ?? []).filter((l) => l.status === "hot").length}</p>
            </div>
            <div className="rounded-xl bg-zinc-100 p-4">
              <p className="text-xs uppercase tracking-wider text-zinc-500">Warm leads</p>
              <p className="text-2xl font-bold">{(leads ?? []).filter((l) => l.status === "warm").length}</p>
            </div>
            <div className="rounded-xl bg-zinc-100 p-4">
              <p className="text-xs uppercase tracking-wider text-zinc-500">Cold leads</p>
              <p className="text-2xl font-bold">{(leads ?? []).filter((l) => l.status === "cold").length}</p>
            </div>
          </div>
        </Card>

        {/* Leads list */}
        <Card className="overflow-hidden bg-white/80 shadow-lg backdrop-blur-md border border-zinc-100">
          <div className="border-b border-zinc-100 bg-zinc-50/80 px-8 py-4 text-base font-semibold text-zinc-800 tracking-tight">
            {error
              ? "Unable to load leads (check Supabase schema/RLS)."
              : "All leads"}
          </div>
          <div className="divide-y divide-zinc-100">
            {(leads ?? []).length === 0 ? (
              <div className="p-8 text-base text-zinc-500">No leads yet. Upload a file or add a lead manually.</div>
            ) : (
              leads!.map((lead) => (
                <Link
                  key={lead.id}
                  href={`/app/leads/${lead.id}`}
                  className="flex items-center justify-between gap-6 px-8 py-5 hover:bg-zinc-50/70 transition-colors cursor-pointer group"
                  aria-label={`View details for ${lead.full_name ?? 'Unnamed lead'}`}
                >
                  <div className="min-w-0 flex-1">
                    <div className="truncate text-base font-semibold text-zinc-900 group-hover:text-primary transition-colors">
                      {lead.full_name ?? "Unnamed lead"}
                    </div>
                    <div className="mt-1 truncate text-sm text-zinc-500">
                      {lead.phone ?? "No phone"}
                      {lead.intent !== "unknown" && (
                        <span className="ml-2 capitalize text-zinc-400">• {lead.intent}</span>
                      )}
                    </div>
                  </div>
                  <div className="flex shrink-0 items-center gap-3">
                    <span className="text-base font-bold text-zinc-700">{lead.score}</span>
                    <span className={
                      `rounded-full border border-zinc-200 bg-white/90 px-4 py-1 text-xs font-semibold tracking-wide ` +
                      (lead.status === 'hot' ? 'text-red-600 border-red-100 bg-red-50/80' :
                        lead.status === 'warm' ? 'text-yellow-700 border-yellow-100 bg-yellow-50/80' :
                        'text-blue-700 border-blue-100 bg-blue-50/80')
                    }>
                      {lead.status.toUpperCase()}
                    </span>
                  </div>
                </Link>
              ))
            )}
          </div>
        </Card>
      </div>
    </div>
  );
}
