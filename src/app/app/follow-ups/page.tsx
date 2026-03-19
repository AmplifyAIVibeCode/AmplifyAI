import { Card } from "@/components/ui/card";

export default function FollowUpsPage() {
  return (
    <div className="w-full">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-zinc-950">Follow-ups</h1>
        <p className="mt-1 text-sm text-zinc-600">
          Schedule reminders for leads who haven&apos;t replied.
        </p>
      </div>

      <Card className="p-6">
        <div className="text-sm text-zinc-700">
          MVP placeholder. Next step: list follow-ups due and allow scheduling
          from a lead.
        </div>
      </Card>
    </div>
  );
}

