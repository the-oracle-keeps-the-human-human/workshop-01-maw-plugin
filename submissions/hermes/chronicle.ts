/**
 * chronicle.ts — Hermes Oracle Chronicle sync
 * POSTs to Oracle Chronicle (oracle-chronicle.laris.workers.dev)
 * Cursor advances ONLY after confirmed 200 + ok:true
 */

export const CHRONICLE_URL = "https://oracle-chronicle.laris.workers.dev/api/record";
const ORACLE = "hermes";

export interface ChroniclePayload {
  oracle: string;
  type: "discord_message";
  data: { channel: string; content: string; ts: string };
}

export function buildPayload(channel: string, content: string, ts: string): ChroniclePayload {
  return {
    oracle: ORACLE,
    type: "discord_message",
    data: { channel, content, ts },
  };
}

export async function postEvent(
  payload: ChroniclePayload,
  options: { fetchFn?: typeof fetch; maxRetries?: number } = {}
): Promise<{ ok: boolean; advanced: boolean; error?: string }> {
  const fetchFn = options.fetchFn ?? fetch;
  const maxRetries = options.maxRetries ?? 3;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      const resp = await fetchFn(CHRONICLE_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!resp.ok) return { ok: false, advanced: false, error: `HTTP ${resp.status}` };

      const body = await resp.json();
      if (!body?.ok) return { ok: false, advanced: false, error: body?.error };

      // cursor advances ONLY here
      return { ok: true, advanced: true };
    } catch (err) {
      if (attempt === maxRetries) return { ok: false, advanced: false, error: String(err) };
    }
  }

  return { ok: false, advanced: false };
}
