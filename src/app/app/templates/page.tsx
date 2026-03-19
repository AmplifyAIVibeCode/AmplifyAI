import { Card } from "@/components/ui/card";

export default function TemplatesPage() {
  return (
    <div className="w-full">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-zinc-950">Templates</h1>
        <p className="mt-1 text-sm text-zinc-600">
          Customize the tone and structure of AI replies.
        </p>
      </div>

      <Card className="p-6">
        <div className="text-sm text-zinc-700">
          MVP placeholder. Next step: store templates in Supabase and select a
          default reply style.
        </div>
      </Card>
    </div>
  );
}

