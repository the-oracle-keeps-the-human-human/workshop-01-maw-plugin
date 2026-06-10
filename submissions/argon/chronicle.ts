// chronicle.ts — Argon Oracle Chronicle client (Quiz 2)
// Pattern: Nagi-style explicit cursor state machine + function-param DI
// Invariant: cursor advances ONLY after HTTP 200 AND body.ok:true (atomic)

export const CHRONICLE_URL = "https://oracle-chronicle.laris.workers.dev/api/record";
export const ORACLE = "argon" as const;
export const EVENT_TYPE = "session_event" as const;

export interface SessionEventData {
  session_id: string;
  topic: string;
  ts: string;
  host?: "codespace" | "mac";
}

export interface ChroniclePayload {
  oracle: "argon";
  type: "session_event";
  data: SessionEventData;
}

export interface SyncState {
  cursor: number;
}

export interface SyncResult {
  state: SyncState;
  ok: boolean;
  ts?: string;
  error?: string;
  attempts: number;
}

export interface SyncOptions {
  fetchFn?: typeof fetch;
  maxRetries?: number;
}

export function buildPayload(data: SessionEventData): ChroniclePayload {
  const cleaned: SessionEventData = {
    session_id: data.session_id,
    topic: data.topic,
    ts: data.ts,
  };
  if (data.host !== undefined) cleaned.host = data.host;
  return {
    oracle: ORACLE,
    type: EVENT_TYPE,
    data: cleaned,
  };
}

export async function syncToChronicle(
  payload: ChroniclePayload,
  state: SyncState,
  options: SyncOptions = {}
): Promise<SyncResult> {
  const fetchFn = options.fetchFn ?? fetch;
  const maxRetries = options.maxRetries ?? 3;

  let lastError: string | undefined;
  let attempts = 0;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    attempts = attempt;
    try {
      const response = await fetchFn(CHRONICLE_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        return {
          state,
          ok: false,
          error: `HTTP ${response.status}`,
          attempts,
        };
      }

      let body: { ok?: boolean; ts?: string; error?: string };
      try {
        body = await response.json();
      } catch {
        return { state, ok: false, error: "Invalid JSON response", attempts };
      }

      if (!body?.ok) {
        return {
          state,
          ok: false,
          error: body?.error ?? "Server returned ok:false",
          attempts,
        };
      }

      // Atomic advance — only here
      return {
        state: { cursor: state.cursor + 1 },
        ok: true,
        ts: body.ts,
        attempts,
      };
    } catch (err) {
      lastError = err instanceof Error ? err.message : String(err);
      if (attempt < maxRetries) {
        await new Promise(r => setTimeout(r, 50 * attempt));
      }
    }
  }

  return {
    state,
    ok: false,
    error: lastError ?? "Unknown network error",
    attempts,
  };
}
