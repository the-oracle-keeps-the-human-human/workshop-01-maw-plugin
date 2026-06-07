/**
 * chronicle.ts — Alice Oracle Chronicle client
 * POST events to oracle-chronicle API with cursor tracking
 * Cursor advances ONLY after successful 200 + ok:true (atomic)
 */

export const CHRONICLE_URL = "https://oracle-chronicle.laris.workers.dev/api/record";
export const FEED_URL = "https://oracle-chronicle.laris.workers.dev/api/oracle/alice/feed";

export interface ChroniclePayload {
  oracle: "alice";
  type: "discord_message";
  data: {
    channel: string;
    content: string;
    ts: string;
  };
}

export interface PostResult {
  ok: boolean;
  advanced: boolean;
  ts?: string;
  error?: string;
}

export interface PostOptions {
  fetchFn?: typeof fetch;
  maxRetries?: number;
}

export function buildPayload(channel: string, content: string, ts: string): ChroniclePayload {
  return {
    oracle: "alice",
    type: "discord_message",
    data: { channel, content, ts },
  };
}

export async function postEvent(
  payload: ChroniclePayload,
  options: PostOptions = {}
): Promise<PostResult> {
  const fetchFn = options.fetchFn ?? fetch;
  const maxRetries = options.maxRetries ?? 3;

  let lastError: string | undefined;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      const response = await fetchFn(CHRONICLE_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        return { ok: false, advanced: false, error: `HTTP ${response.status}` };
      }

      let body: any;
      try {
        body = await response.json();
      } catch {
        return { ok: false, advanced: false, error: "Invalid JSON response" };
      }

      if (!body?.ok) {
        return { ok: false, advanced: false, error: body?.error ?? "Server returned ok:false" };
      }

      // Cursor advances ONLY here — after confirmed 200 + ok:true
      return { ok: true, advanced: true, ts: body.ts };
    } catch (err) {
      lastError = err instanceof Error ? err.message : String(err);
      if (attempt < maxRetries) {
        // wait briefly before retry (exponential-ish)
        await new Promise(r => setTimeout(r, 100 * attempt));
      }
    }
  }

  return { ok: false, advanced: false, error: lastError ?? "Unknown network error" };
}
