/**
 * chronicle.test.ts — Quiz 2 TDD. Unit tests with a mocked fetch (no network).
 *
 * Run: bun test chronicle.test.ts
 */
import { describe, expect, it } from "bun:test";
import {
  buildPayload,
  selectNew,
  sync,
  CHRONICLE_ENDPOINT,
  type FetchLike,
  type SourceEvent,
} from "./chronicle.ts";

const ev = (id: string, content = "hi"): SourceEvent => ({
  id,
  type: "discord_message",
  channel: "workshop-01-thread",
  content,
  ts: "2026-06-07T10:00:00.000Z",
});

/** A mock fetch that records calls and returns a scripted status per call. */
function mockFetch(statuses: number[]) {
  const calls: { url: string; body: any }[] = [];
  let i = 0;
  const fn: FetchLike = async (url, init) => {
    calls.push({ url, body: JSON.parse(init.body) });
    const status = statuses[i++] ?? 200;
    return { ok: status >= 200 && status < 300, status };
  };
  return { fn, calls };
}

describe("buildPayload", () => {
  it("shapes a source event into the backend contract", () => {
    const p = buildPayload("maxus", ev("100", "hello"));
    expect(p).toEqual({
      oracle: "maxus",
      type: "discord_message",
      data: { id: "100", channel: "workshop-01-thread", content: "hello", ts: "2026-06-07T10:00:00.000Z" },
    });
  });

  it("omits channel when absent", () => {
    const p = buildPayload("maxus", { id: "1", type: "oracle_status", content: "online", ts: "t" });
    expect(p.data).not.toHaveProperty("channel");
  });
});

describe("selectNew", () => {
  it("returns only events newer than the cursor, in id order", () => {
    const out = selectNew([ev("3"), ev("1"), ev("2")], "1");
    expect(out.map((e) => e.id)).toEqual(["2", "3"]);
  });

  it("returns all events when cursor is null", () => {
    const out = selectNew([ev("2"), ev("1")], null);
    expect(out.map((e) => e.id)).toEqual(["1", "2"]);
  });
});

describe("sync", () => {
  it("posts all new events and advances the cursor to the last id on success", async () => {
    const { fn, calls } = mockFetch([200, 200]);
    const res = await sync([ev("10"), ev("11")], null, { fetch: fn, oracle: "maxus" });
    expect(res).toEqual({ posted: 2, failed: 0, cursor: "11" });
    expect(calls).toHaveLength(2);
    expect(calls[0].url).toBe(CHRONICLE_ENDPOINT);
    expect(calls[0].body.oracle).toBe("maxus");
  });

  it("does NOT advance the cursor past a failed POST (nothing dropped)", async () => {
    const { fn, calls } = mockFetch([200, 500, 200]);
    const res = await sync([ev("10"), ev("11"), ev("12")], null, { fetch: fn, oracle: "maxus" });
    // first succeeds (cursor=10), second fails → stop before 11
    expect(res.posted).toBe(1);
    expect(res.failed).toBe(1);
    expect(res.cursor).toBe("10");
    expect(calls).toHaveLength(2); // never attempted #12
  });

  it("treats a thrown fetch (network error) as failure without advancing", async () => {
    const fn: FetchLike = async () => { throw new Error("ENOTFOUND"); };
    const res = await sync([ev("10")], null, { fetch: fn, oracle: "maxus" });
    expect(res).toEqual({ posted: 0, failed: 1, cursor: null });
  });

  it("is idempotent — re-running with the advanced cursor posts nothing", async () => {
    const { fn, calls } = mockFetch([200]);
    const res = await sync([ev("10")], "10", { fetch: fn, oracle: "maxus" });
    expect(res).toEqual({ posted: 0, failed: 0, cursor: "10" });
    expect(calls).toHaveLength(0);
  });
});
