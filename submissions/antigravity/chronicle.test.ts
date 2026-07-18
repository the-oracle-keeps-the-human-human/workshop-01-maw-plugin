import { describe, it, expect, mock, beforeEach } from "bun:test";

const ENDPOINT = "https://oracle-chronicle.laris.workers.dev/api/record";
const ORACLE = "antigravity";

interface ChroniclePayload {
  oracle: string;
  type: string;
  data: {
    channel: string;
    content: string;
    ts: string;
    [key: string]: unknown;
  };
}

function buildPayload(content: string, channel = "workshop-01-thread"): ChroniclePayload {
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

interface CursorState {
  lastMessageId: string | null;
  lastTs: string | null;
}

function newCursorState(): CursorState {
  return { lastMessageId: null, lastTs: null };
}

function advanceCursor(state: CursorState, messageId: string, ts: string): CursorState {
  return { lastMessageId: messageId, lastTs: ts };
}

describe("buildPayload", () => {
  it("should include oracle name", () => {
    const payload = buildPayload("hello");
    expect(payload.oracle).toBe("antigravity");
  });

  it("should include type discord_message", () => {
    const payload = buildPayload("hello");
    expect(payload.type).toBe("discord_message");
  });

  it("should include content in data", () => {
    const payload = buildPayload("test message");
    expect(payload.data.content).toBe("test message");
  });

  it("should use default channel", () => {
    const payload = buildPayload("hello");
    expect(payload.data.channel).toBe("workshop-01-thread");
  });

  it("should allow custom channel", () => {
    const payload = buildPayload("hello", "custom-channel");
    expect(payload.data.channel).toBe("custom-channel");
  });

  it("should include timestamp in data", () => {
    const payload = buildPayload("hello");
    expect(payload.data.ts).toBeTruthy();
    expect(() => new Date(payload.data.ts)).not.toThrow();
  });
});

describe("cursor state", () => {
  it("should initialize with null values", () => {
    const state = newCursorState();
    expect(state.lastMessageId).toBeNull();
    expect(state.lastTs).toBeNull();
  });

  it("should advance cursor on success", () => {
    const state = newCursorState();
    const next = advanceCursor(state, "msg-123", "2026-06-07T09:00:00Z");
    expect(next.lastMessageId).toBe("msg-123");
    expect(next.lastTs).toBe("2026-06-07T09:00:00Z");
  });

  it("should not advance cursor on failure (cursor unchanged)", () => {
    const state = newCursorState();
    const failedPost = false;
    const next = failedPost ? advanceCursor(state, "msg-456", "2026-06-07T09:01:00Z") : state;
    expect(next.lastMessageId).toBeNull();
    expect(next.lastTs).toBeNull();
  });

  it("should track multiple advances", () => {
    let state = newCursorState();
    state = advanceCursor(state, "msg-1", "2026-06-07T09:00:00Z");
    state = advanceCursor(state, "msg-2", "2026-06-07T09:01:00Z");
    expect(state.lastMessageId).toBe("msg-2");
    expect(state.lastTs).toBe("2026-06-07T09:01:00Z");
  });
});

describe("POST to Chronicle (mocked)", () => {
  const originalFetch = globalThis.fetch;

  beforeEach(() => {
    globalThis.fetch = originalFetch;
  });

  it("should POST payload and get ok response", async () => {
    globalThis.fetch = mock(async () =>
      new Response(JSON.stringify({ ok: true, ts: "2026-06-07T09:00:00Z", oracle: "antigravity" }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      })
    );

    const payload = buildPayload("Hello from antigravity!");
    const res = await fetch(ENDPOINT, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const json = await res.json() as { ok: boolean; ts: string; oracle: string };

    expect(res.status).toBe(200);
    expect(json.ok).toBe(true);
    expect(json.oracle).toBe("antigravity");
  });

  it("should not advance cursor when POST fails", async () => {
    globalThis.fetch = mock(async () =>
      new Response(JSON.stringify({ ok: false, error: "server error" }), {
        status: 500,
        headers: { "Content-Type": "application/json" },
      })
    );

    let state = newCursorState();
    const payload = buildPayload("fail test");
    const res = await fetch(ENDPOINT, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const json = await res.json() as { ok: boolean };

    if (json.ok) {
      state = advanceCursor(state, "msg-fail", new Date().toISOString());
    }

    expect(state.lastMessageId).toBeNull();
    expect(state.lastTs).toBeNull();
  });
});
