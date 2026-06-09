/**
 * chronicle.ts — Maxus's Chronicle sync (Quiz 2).
 *
 * Posts Discord/fleet events to the Oracle Chronicle backend with an
 * incremental cursor: the cursor only advances for events that the backend
 * accepted (HTTP 200), so a failed POST is retried next run — never dropped
 * (Principle 1: Nothing is Deleted).
 *
 * Pure + dependency-injected (fetch is passed in) so it is unit-testable
 * without hitting the network.
 */

export const CHRONICLE_ENDPOINT =
  "https://oracle-chronicle.laris.workers.dev/api/record";

export type EventType =
  | "discord_message"
  | "fleet_pulse"
  | "workshop_milestone"
  | "oracle_status";

export interface SourceEvent {
  /** monotonic id used as the cursor watermark (e.g. Discord snowflake) */
  id: string;
  type: EventType;
  channel?: string;
  content: string;
  ts: string; // ISO-8601 UTC
}

export interface ChroniclePayload {
  oracle: string;
  type: EventType;
  data: {
    id: string;
    channel?: string;
    content: string;
    ts: string;
  };
}

/** Shape a source event into the backend's record payload. */
export function buildPayload(oracle: string, ev: SourceEvent): ChroniclePayload {
  return {
    oracle,
    type: ev.type,
    data: {
      id: ev.id,
      ...(ev.channel ? { channel: ev.channel } : {}),
      content: ev.content,
      ts: ev.ts,
    },
  };
}

/** Only events strictly newer than the cursor are eligible to sync. */
export function selectNew(events: SourceEvent[], cursor: string | null): SourceEvent[] {
  const after = cursor ?? "";
  return events
    .filter((e) => e.id > after)
    .sort((a, b) => (a.id < b.id ? -1 : a.id > b.id ? 1 : 0));
}

export interface SyncResult {
  posted: number;
  failed: number;
  cursor: string | null; // advanced only past successfully-posted events
}

export type FetchLike = (
  url: string,
  init: { method: string; headers: Record<string, string>; body: string },
) => Promise<{ ok: boolean; status: number }>;

export interface SyncDeps {
  fetch: FetchLike;
  oracle: string;
  endpoint?: string;
}

/**
 * Sync new events in id-order. Advances the cursor past each accepted event;
 * stops advancing at the first failure so nothing is skipped on the next run.
 */
export async function sync(
  events: SourceEvent[],
  cursor: string | null,
  deps: SyncDeps,
): Promise<SyncResult> {
  const endpoint = deps.endpoint ?? CHRONICLE_ENDPOINT;
  const queue = selectNew(events, cursor);
  let posted = 0;
  let failed = 0;
  let watermark = cursor;

  for (const ev of queue) {
    let ok = false;
    try {
      const res = await deps.fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(buildPayload(deps.oracle, ev)),
      });
      ok = res.ok && res.status === 200;
    } catch {
      ok = false;
    }
    if (!ok) {
      failed++;
      break; // stop: do not advance cursor past an unsent event
    }
    posted++;
    watermark = ev.id; // atomic advance AFTER a confirmed 200
  }

  return { posted, failed, cursor: watermark };
}
