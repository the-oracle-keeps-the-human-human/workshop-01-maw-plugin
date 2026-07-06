/**
 * Quiz 2 — Chronicle Sync.
 *
 * Pure payload builder + a cursor-advancing sync step. The HTTP call is
 * injected (FetchLike) so unit tests run without touching the network;
 * the real POST is wired in by passing globalThis.fetch.
 */

export const CHRONICLE_API = "https://oracle-chronicle.laris.workers.dev";

export interface ChronicleEvent {
  oracle: string;
  type: string;
  data: {
    channel: string;
    content: string;
    ts: string;
  };
}

export interface BuildOpts {
  channel?: string;
  type?: string;
  ts?: string;
}

/** Build the POST body the Chronicle backend expects. Pure — no I/O. */
export function buildPayload(
  oracle: string,
  content: string,
  opts: BuildOpts = {},
): ChronicleEvent {
  return {
    oracle,
    type: opts.type ?? "discord_message",
    data: {
      channel: opts.channel ?? "workshop-01-thread",
      content,
      ts: opts.ts ?? new Date().toISOString(),
    },
  };
}

export interface SyncState {
  cursor: number;
}

/** Minimal fetch shape we depend on — lets tests inject a stub. */
export type FetchLike = (
  url: string,
  init?: { method?: string; headers?: Record<string, string>; body?: string },
) => Promise<{ ok: boolean; status: number }>;

export interface SyncResult {
  state: SyncState;
  ok: boolean;
  status: number;
}

/**
 * POST one event to the Chronicle backend. Advance the cursor only on a
 * successful (res.ok) response; on failure leave the cursor untouched so the
 * event is retried next run.
 */
export async function syncEvent(
  state: SyncState,
  payload: ChronicleEvent,
  fetchFn: FetchLike,
  api: string = CHRONICLE_API,
): Promise<SyncResult> {
  const res = await fetchFn(`${api}/api/record`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  if (res.ok) {
    return { state: { cursor: state.cursor + 1 }, ok: true, status: res.status };
  }
  return { state, ok: false, status: res.status };
}
