/**
 * chronicle.test.ts — TDD for Echo Oracle Chronicle
 * Tests written BEFORE implementation (TDD London School)
 * Uses mocks/stubs — NO real API calls in tests
 */

import { expect, test, mock } from "bun:test";
import { buildPayload, postEvent } from "./chronicle";

// ── Fixtures ──────────────────────────────────────────────────────────────────

const CHANNEL = "workshop-01-thread";
const CONTENT = "🔔 Echo Oracle: สวัสดี, Oracle School! มีอะไรให้ฟังไหม?";
const TS = "2026-06-08T09:33:00.000Z";

// ── buildPayload ───────────────────────────────────────────────────────────────

test("buildPayload returns correct format", () => {
  const payload = buildPayload(CHANNEL, CONTENT, TS);
  expect(payload).toEqual({
    oracle: "echo",
    type: "discord_message",
    data: { channel: CHANNEL, content: CONTENT, ts: TS },
  });
});

test("buildPayload oracle is always 'echo'", () => {
  const payload = buildPayload("any", "any", "2026-01-01T00:00:00.000Z");
  expect(payload.oracle).toBe("echo");
});

test("buildPayload type is always 'discord_message'", () => {
  const payload = buildPayload(CHANNEL, CONTENT, TS);
  expect(payload.type).toBe("discord_message");
});

test("buildPayload data contains channel, content, ts", () => {
  const payload = buildPayload(CHANNEL, CONTENT, TS);
  expect(payload.data.channel).toBe(CHANNEL);
  expect(payload.data.content).toBe(CONTENT);
  expect(payload.data.ts).toBe(TS);
});

// ── cursor behaviour ──────────────────────────────────────────────────────────

test("cursor advances after 200 + ok:true", async () => {
  const mockFetch = mock(async () =>
    new Response(JSON.stringify({ ok: true, ts: TS, oracle: "echo" }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    })
  );
  const result = await postEvent(buildPayload(CHANNEL, CONTENT, TS), { fetchFn: mockFetch as any });
  expect(result.ok).toBe(true);
  expect(result.advanced).toBe(true);
  expect(mockFetch).toHaveBeenCalledTimes(1);
});

test("cursor does NOT advance after non-200", async () => {
  const mockFetch = mock(async () =>
    new Response("Internal Server Error", {
      status: 500,
      headers: { "Content-Type": "text/plain" },
    })
  );
  const result = await postEvent(buildPayload(CHANNEL, CONTENT, TS), { fetchFn: mockFetch as any });
  expect(result.ok).toBe(false);
  expect(result.advanced).toBe(false);
});

test("cursor does NOT advance when ok:false", async () => {
  const mockFetch = mock(async () =>
    new Response(JSON.stringify({ ok: false, error: "bad input" }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    })
  );
  const result = await postEvent(buildPayload(CHANNEL, CONTENT, TS), { fetchFn: mockFetch as any });
  expect(result.ok).toBe(false);
  expect(result.advanced).toBe(false);
});

// ── retry on network error ────────────────────────────────────────────────────

test("retries on network error, succeeds on second attempt", async () => {
  let calls = 0;
  const mockFetch = mock(async () => {
    calls++;
    if (calls === 1) throw new Error("network timeout");
    return new Response(JSON.stringify({ ok: true, ts: TS }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  });
  const result = await postEvent(buildPayload(CHANNEL, CONTENT, TS), { fetchFn: mockFetch as any, maxRetries: 3 });
  expect(result.ok).toBe(true);
  expect(result.advanced).toBe(true);
  expect(calls).toBe(2);
});

test("returns error after all retries exhausted", async () => {
  const mockFetch = mock(async () => { throw new Error("persistent failure"); });
  const result = await postEvent(buildPayload(CHANNEL, CONTENT, TS), { fetchFn: mockFetch as any, maxRetries: 2 });
  expect(result.ok).toBe(false);
  expect(result.advanced).toBe(false);
  expect(result.error).toContain("persistent failure");
});
