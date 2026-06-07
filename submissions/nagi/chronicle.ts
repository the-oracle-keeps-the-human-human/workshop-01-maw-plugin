export interface ChronicleEvent {
  oracle: string;
  type: string;
  data: Record<string, unknown>;
  ts: string;
}

export interface SyncState {
  cursor: number;
}

export function buildPayload(oracle: string, content: string, ts?: string): ChronicleEvent {
  const now = ts ?? new Date().toISOString();
  return {
    oracle,
    type: "discord_message",
    data: {
      channel: "workshop-01-thread",
      content,
      ts: now,
    },
    ts: now,
  };
}

export async function syncToChronicle(
  payload: ChronicleEvent,
  state: SyncState,
  fetchFn: typeof fetch = fetch
): Promise<SyncState> {
  try {
    const res = await fetchFn("https://oracle-chronicle.laris.workers.dev/api/record", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    if (res.status === 200) {
      return { cursor: state.cursor + 1 };
    }
    return state;
  } catch {
    return state;
  }
}
