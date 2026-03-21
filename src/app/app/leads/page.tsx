import Link from "next/link";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { UploadForm } from "@/components/leads/upload-form";

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
    <div className="flex w-full flex-col gap-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-zinc-950">Leads</h1>
          <p className="mt-1 text-sm text-zinc-600">
            Upload, manage, and analyze your leads.
          </p>
        </div>
        <Link href="/app/leads/new">
          <Button>Add lead</Button>
        </Link>
      </div>

      {/* File upload */}
      <Card className="p-5">
        <UploadForm />
      </Card>

      {/* Leads list */}
      <Card className="overflow-hidden">
        <div className="border-b border-zinc-200 bg-zinc-50 px-5 py-3 text-sm font-medium text-zinc-700">
          {error
            ? "Unable to load leads (check Supabase schema/RLS)."
            : "All leads"}
        </div>
        <div className="divide-y divide-zinc-200">
          {(leads ?? []).length === 0 ? (
            <div className="p-6 text-sm text-zinc-600">
              No leads yet. Upload a file or add a lead manually.
            </div>
          ) : (
            leads!.map((lead) => (
              <Link
                key={lead.id}
                href={`/app/leads/${lead.id}`}
                className="flex items-center justify-between gap-4 px-5 py-4 hover:bg-zinc-50"
              >
                <div className="min-w-0 flex-1">
                  <div className="truncate text-sm font-medium text-zinc-950">
                    {lead.full_name ?? "Unnamed lead"}
                  </div>
                  <div className="mt-1 truncate text-sm text-zinc-600">
                    {lead.phone ?? "No phone"}
                    {lead.intent !== "unknown" && (
                      <span className="ml-2 capitalize text-zinc-500">
                        • {lead.intent}
                      </span>
                    )}
                  </div>
                </div>
                <div className="flex shrink-0 items-center gap-2">
                  <span className="text-sm font-semibold text-zinc-700">
                    {lead.score}
                  </span>
                  <span className="rounded-full border border-zinc-200 bg-white px-3 py-1 text-xs font-medium text-zinc-700">
                    {lead.status.toUpperCase()}
                  </span>
                </div>
              </Link>
            ))
          )}
        </div>
      </Card>
    </div>
  );
}
