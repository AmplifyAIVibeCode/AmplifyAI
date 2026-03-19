import { notFound } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { Card } from "@/components/ui/card";
import { LeadMessageComposer } from "@/components/leads/message-composer";

type LeadRow = {
  id: string;
  full_name: string | null;
  email: string | null;
  phone: string | null;
  status: "hot" | "warm" | "cold";
  created_at: string;
};

type MessageRow = {
  id: string;
  lead_id: string;
  direction: "inbound" | "outbound";
  body: string;
  created_at: string;
};

export default async function LeadDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createSupabaseServerClient();

  const [{ data: lead }, { data: messages }] = await Promise.all([
    supabase
      .from("leads")
      .select("id, full_name, email, phone, status, created_at")
      .eq("id", id)
      .single<LeadRow>(),
    supabase
      .from("lead_messages")
      .select("id, lead_id, direction, body, created_at")
      .eq("lead_id", id)
      .order("created_at", { ascending: true })
      .returns<MessageRow[]>(),
  ]);

  if (!lead) return notFound();

  return (
    <div className="flex w-full flex-col gap-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-2xl font-semibold text-zinc-950">
          {lead.full_name ?? "Unnamed lead"}
        </h1>
        <div className="flex flex-wrap items-center gap-2 text-sm text-zinc-600">
          <span className="rounded-full border border-zinc-200 bg-white px-3 py-1 text-xs font-medium text-zinc-700">
            {lead.status.toUpperCase()}
          </span>
          <span>{lead.email ?? ""}</span>
          {lead.email && lead.phone ? <span>•</span> : null}
          <span>{lead.phone ?? ""}</span>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
        <Card className="flex min-h-[520px] flex-col overflow-hidden">
          <div className="border-b border-zinc-200 bg-zinc-50 px-5 py-3 text-sm font-medium text-zinc-700">
            Conversation
          </div>
          <div className="flex flex-1 flex-col gap-3 overflow-auto p-5">
            {(messages ?? []).length === 0 ? (
              <div className="text-sm text-zinc-600">
                No messages yet. Add the lead&apos;s first message to generate a
                reply.
              </div>
            ) : (
              messages!.map((m) => (
                <div
                  key={m.id}
                  className={
                    m.direction === "outbound"
                      ? "flex justify-end"
                      : "flex justify-start"
                  }
                >
                  <div
                    className={
                      m.direction === "outbound"
                        ? "max-w-[80%] rounded-2xl bg-zinc-950 px-4 py-3 text-sm text-white"
                        : "max-w-[80%] rounded-2xl border border-zinc-200 bg-white px-4 py-3 text-sm text-zinc-900"
                    }
                  >
                    <div className="whitespace-pre-wrap">{m.body}</div>
                    <div className="mt-2 text-xs opacity-70">
                      {new Date(m.created_at).toLocaleString()}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </Card>

        <div className="flex flex-col gap-4">
          <Card className="p-5">
            <div className="text-sm font-medium text-zinc-950">Send message</div>
            <div className="mt-1 text-sm text-zinc-600">
              Save inbound/outbound messages and optionally generate an AI reply.
            </div>
            <div className="mt-4">
              <LeadMessageComposer leadId={lead.id} />
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}

