/**
 * Weizen Chronicle sync — Quiz 2.
 * Posts events to the Oracle Chronicle backend, with a cursor that only
 * advances on a confirmed success (200 + ok:true). TDD: see chronicle.test.ts.
 */
export const ENDPOINT = "https://oracle-chronicle.laris.workers.dev/api/record";
export const ORACLE = "weizen";

export interface ChroniclePayload {
  oracle: string;
  type: string;
  data: {
    channel: string;
    content: string;
    ts: string;
    [key: string]: unknown;
  };
}

export function buildPayload(content: string, channel = "workshop-01-thread"): ChroniclePayload {
  return {
    oracle: ORACLE,
    type: "discord_message",
    data: {
      channel,
      content,
      ts: new Date().toISOString(),
    },
  };
}

export interface CursorState {
  lastMessageId: string | null;
  lastTs: string | null;
}

export function newCursorState(): CursorState {
  return { lastMessageId: null, lastTs: null };
}

export function advanceCursor(state: CursorState, messageId: string, ts: string): CursorState {
  return { lastMessageId: messageId, lastTs: ts };
}

export interface ChronicleResponse {
  ok: boolean;
  ts?: string;
  oracle?: string;
  error?: string;
}

export async function postToChronicle(
  payload: ChroniclePayload,
  endpoint = ENDPOINT,
): Promise<{ status: number; json: ChronicleResponse }> {
  const res = await fetch(endpoint, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  const json = (await res.json()) as ChronicleResponse;
  return { status: res.status, json };
}

/** Sync one message: POST, then advance the cursor ONLY on confirmed success. */
export async function syncMessage(
  state: CursorState,
  messageId: string,
  content: string,
  endpoint = ENDPOINT,
): Promise<CursorState> {
  const { status, json } = await postToChronicle(buildPayload(content), endpoint);
  if (status === 200 && json.ok) {
    return advanceCursor(state, messageId, new Date().toISOString());
  }
  return state; // failure → cursor unchanged (no data loss / no skip)
}
