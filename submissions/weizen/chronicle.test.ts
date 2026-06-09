import { describe, it, expect, mock, beforeEach } from "bun:test";
import {
  buildPayload,
  newCursorState,
  advanceCursor,
  postToChronicle,
  syncMessage,
  ENDPOINT,
  ORACLE,
} from "./chronicle";

describe("buildPayload", () => {
  it("should include oracle name (weizen)", () => {
    expect(buildPayload("hello").oracle).toBe("weizen");
    expect(ORACLE).toBe("weizen");
  });

  it("should include type discord_message", () => {
    expect(buildPayload("hello").type).toBe("discord_message");
  });

  it("should include content in data", () => {
    expect(buildPayload("test message").data.content).toBe("test message");
  });

  it("should use default channel workshop-01-thread", () => {
    expect(buildPayload("hello").data.channel).toBe("workshop-01-thread");
  });

  it("should allow a custom channel", () => {
    expect(buildPayload("hello", "free-for-all").data.channel).toBe("free-for-all");
  });

  it("should include a valid ISO timestamp", () => {
    const payload = buildPayload("hello");
    expect(payload.data.ts).toBeTruthy();
    expect(() => new Date(payload.data.ts)).not.toThrow();
    expect(new Date(payload.data.ts).toISOString()).toBe(payload.data.ts);
  });
});

describe("cursor state", () => {
  it("should initialize with null values", () => {
    const state = newCursorState();
    expect(state.lastMessageId).toBeNull();
    expect(state.lastTs).toBeNull();
  });

  it("should advance cursor on success", () => {
    const next = advanceCursor(newCursorState(), "msg-123", "2026-06-09T09:00:00Z");
    expect(next.lastMessageId).toBe("msg-123");
    expect(next.lastTs).toBe("2026-06-09T09:00:00Z");
  });

  it("should track multiple advances (keeps latest)", () => {
    let state = newCursorState();
    state = advanceCursor(state, "msg-1", "2026-06-09T09:00:00Z");
    state = advanceCursor(state, "msg-2", "2026-06-09T09:01:00Z");
    expect(state.lastMessageId).toBe("msg-2");
    expect(state.lastTs).toBe("2026-06-09T09:01:00Z");
  });

  it("should not mutate the original state (pure)", () => {
    const state = newCursorState();
    advanceCursor(state, "msg-x", "2026-06-09T09:00:00Z");
    expect(state.lastMessageId).toBeNull();
  });
});

describe("postToChronicle (mocked fetch)", () => {
  const originalFetch = globalThis.fetch;
  beforeEach(() => {
    globalThis.fetch = originalFetch;
  });

  it("should POST to the chronicle endpoint and return ok", async () => {
    globalThis.fetch = mock(async (url: string) => {
      expect(url).toBe(ENDPOINT);
      return new Response(
        JSON.stringify({ ok: true, ts: "2026-06-09T09:00:00Z", oracle: "weizen" }),
        { status: 200, headers: { "Content-Type": "application/json" } },
      );
    }) as unknown as typeof fetch;

    const { status, json } = await postToChronicle(buildPayload("Hello from weizen!"));
    expect(status).toBe(200);
    expect(json.ok).toBe(true);
    expect(json.oracle).toBe("weizen");
  });
});

describe("syncMessage (cursor advances only on success)", () => {
  const originalFetch = globalThis.fetch;
  beforeEach(() => {
    globalThis.fetch = originalFetch;
  });

  it("should advance the cursor on a 200 ok response", async () => {
    globalThis.fetch = mock(async () =>
      new Response(JSON.stringify({ ok: true, oracle: "weizen" }), { status: 200 }),
    ) as unknown as typeof fetch;

    const next = await syncMessage(newCursorState(), "msg-200", "ok payload");
    expect(next.lastMessageId).toBe("msg-200");
    expect(next.lastTs).not.toBeNull();
  });

  it("should NOT advance the cursor on a 500 failure", async () => {
    globalThis.fetch = mock(async () =>
      new Response(JSON.stringify({ ok: false, error: "server error" }), { status: 500 }),
    ) as unknown as typeof fetch;

    const next = await syncMessage(newCursorState(), "msg-500", "fail payload");
    expect(next.lastMessageId).toBeNull();
    expect(next.lastTs).toBeNull();
  });

  it("should NOT advance when status is 200 but ok:false", async () => {
    globalThis.fetch = mock(async () =>
      new Response(JSON.stringify({ ok: false }), { status: 200 }),
    ) as unknown as typeof fetch;

    const next = await syncMessage(newCursorState(), "msg-soft-fail", "soft fail");
    expect(next.lastMessageId).toBeNull();
  });
});
