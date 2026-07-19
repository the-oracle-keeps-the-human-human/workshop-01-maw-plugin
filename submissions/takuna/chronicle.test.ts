/**
 * chronicle.test.ts — TDD for Takuna Oracle Chronicle sync 🧭
 * Tests written to define the contract BEFORE trusting any real POST.
 * Uses mock fetch (dependency injection) — NO real API calls in tests.
 *
 * Contract (workshop Quiz 2):
 *   1. buildPayload produces the exact Chronicle format
 *   2. cursor advances ONLY after HTTP 200 + body.ok === true
 *   3. cursor does NOT advance on any failure (non-200, ok:false, network error)
 */

import { expect, test, mock } from "bun:test";
import { buildPayload, postEvent, ORACLE } from "./chronicle";

const CHANNEL = "workshop-01-thread";
const CONTENT = "Hello from Takuna Oracle! 🧭 — The Wayfarer arrives.";
const TS = "2026-07-18T12:00:00.000Z";

// ── buildPayload format ──────────────────────────────────────────────────────

test("buildPayload returns the exact Chronicle format", () => {
  expect(buildPayload(CHANNEL, CONTENT, TS)).toEqual({
    oracle: ORACLE,
    type: "discord_message",
    data: { channel: CHANNEL, content: CONTENT, ts: TS },
  });
});

test("buildPayload oracle is always 'takuna'", () => {
  expect(buildPayload("x", "y", TS).oracle).toBe("takuna");
});

test("buildPayload type is always 'discord_message'", () => {
  expect(buildPayload(CHANNEL, CONTENT, TS).type).toBe("discord_message");
});

// ── cursor advances only on real success ─────────────────────────────────────

test("cursor advances after HTTP 200 + ok:true", async () => {
  const mockFetch = mock(async () =>
    new Response(JSON.stringify({ ok: true, ts: TS }), { status: 200 }),
  );
  const r = await postEvent(buildPayload(CHANNEL, CONTENT, TS), { fetchFn: mockFetch as any });
  expect(r.ok).toBe(true);
  expect(r.advanced).toBe(true); // advances ONLY here
  expect(mockFetch).toHaveBeenCalledTimes(1);
});

// ── cursor does NOT advance on failure ───────────────────────────────────────

test("cursor does NOT advance on non-200", async () => {
  const mockFetch = mock(async () => new Response("err", { status: 500 }));
  const r = await postEvent(buildPayload(CHANNEL, CONTENT, TS), { fetchFn: mockFetch as any });
  expect(r.ok).toBe(false);
  expect(r.advanced).toBe(false);
});

test("cursor does NOT advance when body ok:false (even on HTTP 200)", async () => {
  const mockFetch = mock(async () =>
    new Response(JSON.stringify({ ok: false, error: "bad input" }), { status: 200 }),
  );
  const r = await postEvent(buildPayload(CHANNEL, CONTENT, TS), { fetchFn: mockFetch as any });
  expect(r.ok).toBe(false);
  expect(r.advanced).toBe(false);
  expect(r.error).toBe("bad input");
});

// ── retry semantics ──────────────────────────────────────────────────────────

test("retries on network error, succeeds on 2nd attempt", async () => {
  let n = 0;
  const mockFetch = mock(async () => {
    if (++n === 1) throw new Error("network down");
    return new Response(JSON.stringify({ ok: true }), { status: 200 });
  });
  const r = await postEvent(buildPayload(CHANNEL, CONTENT, TS), { fetchFn: mockFetch as any, maxRetries: 2 });
  expect(r.ok).toBe(true);
  expect(r.advanced).toBe(true);
  expect(n).toBe(2);
});

test("gives up (no advance) after maxRetries network errors", async () => {
  const mockFetch = mock(async () => { throw new Error("network down"); });
  const r = await postEvent(buildPayload(CHANNEL, CONTENT, TS), { fetchFn: mockFetch as any, maxRetries: 2 });
  expect(r.ok).toBe(false);
  expect(r.advanced).toBe(false);
  expect(mockFetch).toHaveBeenCalledTimes(2);
});
