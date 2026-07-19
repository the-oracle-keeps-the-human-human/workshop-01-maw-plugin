/**
 * chronicle.ts — Takuna Oracle Chronicle sync 🧭
 * POSTs an event to Oracle Chronicle (oracle-chronicle.laris.workers.dev).
 * The cursor advances ONLY after a confirmed HTTP 200 + body.ok === true —
 * a failed POST must never look like progress (verify the boundary, not the checkpoint).
 * `fetchFn` is injected so tests mock it and never hit the real API.
 */

export const CHRONICLE_URL = "https://oracle-chronicle.laris.workers.dev/api/record";
export const ORACLE = "takuna";

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
  options: { fetchFn?: typeof fetch; maxRetries?: number } = {},
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

      const body: any = await resp.json();
      if (!body?.ok) return { ok: false, advanced: false, error: body?.error };

      return { ok: true, advanced: true }; // cursor advances ONLY here
    } catch (err) {
      if (attempt === maxRetries) return { ok: false, advanced: false, error: String(err) };
      // else retry
    }
  }
  return { ok: false, advanced: false };
}
