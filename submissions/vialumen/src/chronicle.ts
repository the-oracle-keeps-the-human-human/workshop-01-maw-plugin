import { readFileSync, writeFileSync, mkdirSync } from "fs";
import { dirname } from "path";

export const CHRONICLE_URL = "https://oracle-chronicle.laris.workers.dev/api/record";
export const CHRONICLE_FEED_URL = "https://oracle-chronicle.laris.workers.dev/api/oracle/vialumen/feed";

export interface DiscordMessage {
  id: string;
  content: string;
  author: string;
  ts: string;
  channel_id: string;
}

export interface ChronicleRecord {
  oracle: string;
  type: string;
  data: {
    channel: string;
    channel_id: string;
    message_id: string;
    author: string;
    content: string;
    ts: string;
  };
}

export interface CursorState {
  [channel_id: string]: {
    last_message_id: string;
    last_synced_ts: string;
  };
}

export type FetchFn = (url: string, opts?: RequestInit) => Promise<Response>;

// Pure function — build Chronicle payload from a Discord message
export function buildRecord(oracle: string, msg: DiscordMessage): ChronicleRecord {
  return {
    oracle,
    type: "discord_message",
    data: {
      channel: "workshop-01-thread",
      channel_id: msg.channel_id,
      message_id: msg.id,
      author: msg.author,
      content: msg.content,
      ts: msg.ts,
    },
  };
}

// Pure function — filter only messages newer than cursor
export function filterDelta(messages: DiscordMessage[], lastId: string | undefined): DiscordMessage[] {
  if (!lastId) return messages;
  // Discord snowflake IDs are monotonically increasing — higher ID = newer
  return messages.filter((m) => BigInt(m.id) > BigInt(lastId));
}

// Load cursor state from JSON file
export function loadCursor(statePath: string): CursorState {
  try {
    return JSON.parse(readFileSync(statePath, "utf-8"));
  } catch {
    return {};
  }
}

// Save cursor state atomically (write then rename not available in bun, so direct write)
export function saveCursor(statePath: string, state: CursorState): void {
  mkdirSync(dirname(statePath), { recursive: true });
  writeFileSync(statePath, JSON.stringify(state, null, 2), "utf-8");
}

// Core sync function — posts delta messages to Chronicle
// Returns number of records posted
export async function syncMessages(
  messages: DiscordMessage[],
  oracle: string,
  channelId: string,
  currentCursor: string | undefined,
  statePath: string,
  fetchFn: FetchFn,
  dryRun = false
): Promise<{ posted: number; newCursor: string | undefined; error?: string }> {
  const delta = filterDelta(messages, currentCursor);

  if (delta.length === 0) {
    return { posted: 0, newCursor: currentCursor };
  }

  if (dryRun) {
    return { posted: 0, newCursor: currentCursor };
  }

  let posted = 0;
  let newCursor = currentCursor;

  for (const msg of delta) {
    const record = buildRecord(oracle, msg);
    try {
      const res = await fetchFn(CHRONICLE_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(record),
      });
      const json = await res.json() as { ok: boolean };
      if (res.ok && json.ok) {
        posted++;
        newCursor = msg.id; // advance cursor only after confirmed success
      } else {
        // POST failed — stop, don't advance cursor
        return { posted, newCursor, error: `POST failed: HTTP ${res.status}` };
      }
    } catch (err) {
      // Network error — cursor stays, stop
      return { posted, newCursor, error: String(err) };
    }
  }

  // All posted — save cursor
  const state = loadCursor(statePath);
  state[channelId] = {
    last_message_id: newCursor!,
    last_synced_ts: new Date().toISOString(),
  };
  saveCursor(statePath, state);

  return { posted, newCursor };
}
