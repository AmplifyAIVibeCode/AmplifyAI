import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { parseCSV, parseWhatsApp } from "@/lib/parsers";

export async function POST(req: Request) {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return new NextResponse("Unauthorized.", { status: 401 });

  const formData = await req.formData();
  const file = formData.get("file") as File | null;
  const ownerName = (formData.get("ownerName") as string) ?? "";

  if (!file) {
    return NextResponse.json({ error: "No file provided." }, { status: 400 });
  }

  const text = await file.text();
  const fileName = file.name.toLowerCase();

  let parsed;
  if (fileName.endsWith(".csv")) {
    parsed = parseCSV(text);
  } else if (fileName.endsWith(".txt")) {
    parsed = parseWhatsApp(text, ownerName);
  } else {
    return NextResponse.json(
      { error: "Unsupported file type. Upload .csv or .txt (WhatsApp export)." },
      { status: 400 },
    );
  }

  if (parsed.length === 0) {
    return NextResponse.json(
      { error: "No leads found in the file. Check the format." },
      { status: 400 },
    );
  }

  let importedCount = 0;

  for (const lead of parsed) {
    const { data: inserted, error: leadError } = await supabase
      .from("leads")
      .insert({
        full_name: lead.name || null,
        phone: lead.phone || null,
      })
      .select("id")
      .single<{ id: string }>();

    if (leadError || !inserted) continue;

    if (lead.messages.length > 0) {
      const rows = lead.messages.map((m) => ({
        lead_id: inserted.id,
        direction: m.direction,
        body: m.body,
      }));

      await supabase.from("lead_messages").insert(rows);
    }

    importedCount++;
  }

  return NextResponse.json({
    imported: importedCount,
    total: parsed.length,
  });
}
