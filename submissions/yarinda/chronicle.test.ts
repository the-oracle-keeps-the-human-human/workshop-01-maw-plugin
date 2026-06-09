/**
 * Quiz 2 — Chronicle Sync, TDD.
 *
 * Tests the pure payload builder + the cursor-advancing sync loop with an
 * INJECTED fetch (no real network). Per workshop rule #6: unit test + mock
 * first, integration (real POST) second.
 */
import { test, expect, describe } from "bun:test";
import { buildPayload, syncEvent, type FetchLike } from "./chronicle";

describe("buildPayload", () => {
  test("builds the Chronicle record shape with defaults", () => {
    const p = buildPayload("yarinda", "Hello from yarinda!", {
      ts: "2026-06-09T00:00:00.000Z",
    });
    expect(p).toEqual({
      oracle: "yarinda",
      type: "discord_message",
      data: {
        channel: "workshop-01-thread",
        content: "Hello from yarinda!",
        ts: "2026-06-09T00:00:00.000Z",
      },
    });
  });

  test("honors explicit channel and type overrides", () => {
    const p = buildPayload("yarinda", "ping", {
      channel: "test-channel",
      type: "system_event",
      ts: "2026-06-09T00:00:00.000Z",
    });
    expect(p.data.channel).toBe("test-channel");
    expect(p.type).toBe("system_event");
  });

  test("stamps an ISO-8601 ts when none is given", () => {
    const p = buildPayload("yarinda", "ping");
    expect(p.data.ts).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/);
  });
});

describe("syncEvent cursor", () => {
  const payload = buildPayload("yarinda", "ping", { ts: "2026-06-09T00:00:00.000Z" });

  test("advances the cursor after a 200 response", async () => {
    const ok200: FetchLike = async () => ({ ok: true, status: 200 });
    const res = await syncEvent({ cursor: 0 }, payload, ok200);
    expect(res.ok).toBe(true);
    expect(res.state.cursor).toBe(1);
  });

  test("does NOT advance the cursor after a failed response", async () => {
    const fail500: FetchLike = async () => ({ ok: false, status: 500 });
    const res = await syncEvent({ cursor: 7 }, payload, fail500);
    expect(res.ok).toBe(false);
    expect(res.state.cursor).toBe(7);
  });

  test("POSTs the JSON payload to /api/record", async () => {
    let seenUrl = "";
    let seenBody = "";
    let seenMethod = "";
    const spy: FetchLike = async (url, init) => {
      seenUrl = url;
      seenMethod = String(init?.method ?? "");
      seenBody = String(init?.body ?? "");
      return { ok: true, status: 200 };
    };
    await syncEvent({ cursor: 0 }, payload, spy, "https://example.test");
    expect(seenUrl).toBe("https://example.test/api/record");
    expect(seenMethod).toBe("POST");
    expect(JSON.parse(seenBody)).toEqual(payload);
  });
});
