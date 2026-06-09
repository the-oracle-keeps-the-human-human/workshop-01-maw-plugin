/**
 * chronicle.ts — Singhasingha Oracle 🦁 Chronicle sync
 * Workshop 01 Quiz 2. Pure functions + injectable fetch for TDD.
 */

export const CHRONICLE_URL = "https://oracle-chronicle.laris.workers.dev";
export const RECORD_ENDPOINT = `${CHRONICLE_URL}/api/record`;

export interface ChroniclePayload {
  oracle: string;
  type: "discord_message";
  ts: string;
  data: {
    channel: string;
    content: string;
    ts: string;
  };
}

export interface Cursor {
  cursor: number;
}

export interface SyncResult extends Cursor {
  ok: boolean;
  status?: number;
  error?: string;
}

/** Build a Chronicle record payload. ts auto-generated (ISO-8601) if omitted. */
export function buildPayload(
  oracle: string,
  content: string,
  ts: string = new Date().toISOString(),
): ChroniclePayload {
  return {
    oracle,
    type: "discord_message",
    ts,
    data: {
      channel: "workshop-01-thread",
      content,
      ts,
    },
  };
}

type FetchLike = (url: string, init?: any) => Promise<{ status: number }>;

/**
 * POST a payload to Chronicle. Cursor advances ONLY on HTTP 200.
 * fail-closed: 4xx/5xx/network-error keep cursor where it was (safe to retry).
 * fetchImpl is injectable so tests never hit the network.
 */
export async function syncToChronicle(
  payload: ChroniclePayload,
  state: Cursor,
  fetchImpl: FetchLike = fetch as unknown as FetchLike,
): Promise<SyncResult> {
  try {
    const res = await fetchImpl(RECORD_ENDPOINT, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    if (res.status === 200) {
      return { ok: true, status: 200, cursor: state.cursor + 1 };
    }
    return { ok: false, status: res.status, cursor: state.cursor };
  } catch (e: any) {
    return { ok: false, error: e?.message ?? "network error", cursor: state.cursor };
  }
}
