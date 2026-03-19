import { Card } from "@/components/ui/card";
import { NewLeadForm } from "@/components/leads/new-lead-form";

export default function NewLeadPage() {
  return (
    <div className="w-full max-w-3xl">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-zinc-950">Add lead</h1>
        <p className="mt-1 text-sm text-zinc-600">
          Create a lead manually. You can paste their first message on the next
          screen.
        </p>
      </div>

      <Card className="p-6">
        <NewLeadForm />
      </Card>
    </div>
  );
}

