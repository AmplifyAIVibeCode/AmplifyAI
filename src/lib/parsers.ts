/**
 * Parsers for CSV and WhatsApp .txt exports.
 * Extracts lead name, phone, and message history.
 */

export interface ParsedLead {
  name: string;
  phone: string;
  messages: { body: string; direction: "inbound" | "outbound"; date?: string }[];
}

// ────────────────────────────────────────────
// CSV Parser
// Expected columns: name, phone, message (optional)
// ────────────────────────────────────────────

function splitCSVLine(line: string): string[] {
  const cols: string[] = [];
  let cur = "";
  let inQuotes = false;
  for (const ch of line) {
    if (ch === '"') {
      inQuotes = !inQuotes;
    } else if (ch === "," && !inQuotes) {
      cols.push(cur.trim());
      cur = "";
    } else {
      cur += ch;
    }
  }
  cols.push(cur.trim());
  return cols;
}

export function parseCSV(text: string): ParsedLead[] {
  const lines = text.split(/\r?\n/).filter((l) => l.trim());
  if (lines.length < 2) return [];

  const headerCols = splitCSVLine(lines[0]).map((h) => h.toLowerCase());
  const nameIdx = headerCols.findIndex((h) => h.includes("name"));
  const phoneIdx = headerCols.findIndex(
    (h) => h.includes("phone") || h.includes("mobile") || h.includes("number"),
  );
  const messageIdx = headerCols.findIndex(
    (h) => h.includes("message") || h.includes("msg"),
  );

  if (phoneIdx === -1) return []; // phone is required

  const leadsMap = new Map<string, ParsedLead>();

  for (let i = 1; i < lines.length; i++) {
    const cols = splitCSVLine(lines[i]);
    const phone = (cols[phoneIdx] ?? "").replace(/[^+\d]/g, "");
    if (!phone) continue;

    const name = nameIdx !== -1 ? (cols[nameIdx] ?? "") : "";
    const msg = messageIdx !== -1 ? (cols[messageIdx] ?? "") : "";

    const existing = leadsMap.get(phone);
    if (existing) {
      if (msg) existing.messages.push({ body: msg, direction: "inbound" });
    } else {
      leadsMap.set(phone, {
        name,
        phone,
        messages: msg ? [{ body: msg, direction: "inbound" }] : [],
      });
    }
  }

  return Array.from(leadsMap.values());
}

// ────────────────────────────────────────────
// WhatsApp Chat Export Parser (.txt)
// Format: "DD/MM/YYYY, HH:MM - Name: Message"
// or:     "[DD/MM/YYYY, HH:MM:SS] Name: Message"
// ────────────────────────────────────────────

const WA_LINE_RE =
  /^[\["]?(\d{1,2}\/\d{1,2}\/\d{2,4}),?\s+(\d{1,2}:\d{2}(?::\d{2})?(?:\s*[APap][Mm])?)\]?\s*[-–]\s*([^:]+):\s*([\s\S]*)/;

export function parseWhatsApp(text: string, ownerName?: string): ParsedLead[] {
  const lines = text.split(/\r?\n/);
  const leadsMap = new Map<string, ParsedLead>();

  const ownerLower = (ownerName ?? "").toLowerCase().trim();

  for (const line of lines) {
    const match = WA_LINE_RE.exec(line);
    if (!match) continue;

    const [, datePart, timePart, sender, body] = match;
    const senderTrimmed = sender.trim();

    // Skip system messages
    if (
      body.includes("end-to-end encrypted") ||
      body.includes("created group") ||
      body.includes("added you") ||
      body === "<Media omitted>"
    )
      continue;

    const direction: "inbound" | "outbound" =
      ownerLower && senderTrimmed.toLowerCase() === ownerLower
        ? "outbound"
        : "inbound";

    const existing = leadsMap.get(senderTrimmed);
    if (existing) {
      existing.messages.push({
        body: body.trim(),
        direction,
        date: `${datePart} ${timePart}`,
      });
    } else {
      leadsMap.set(senderTrimmed, {
        name: senderTrimmed,
        phone: "", // WhatsApp export doesn't include phone numbers
        messages: [
          {
            body: body.trim(),
            direction,
            date: `${datePart} ${timePart}`,
          },
        ],
      });
    }
  }

  return Array.from(leadsMap.values());
}
