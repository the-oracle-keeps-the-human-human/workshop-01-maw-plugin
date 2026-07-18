/**
 * chronicle.test.ts — TDD for Hermes Oracle Chronicle
 * Tests written BEFORE implementation (TDD London School)
 * Uses mocks/stubs — NO real API calls in tests
 */

import { expect, test, mock } from "bun:test";
import { buildPayload, postEvent } from "./chronicle";

// ── Fixtures ─────────────────────────────────────────────────────────────────

const CHANNEL = "workshop-01-thread";
const CONTENT = "Hello from Hermes Oracle! 🤖💬 — The Herald speaks.";
const TS = "2026-07-18T12:00:00.000Z";
const ORACLE = "hermes";

// ── buildPayload ─────────────────────────────────────────────────────────────

test("buildPayload returns correct format", () => {
  const payload = buildPayload(CHANNEL, CONTENT, TS);
  expect(payload).toEqual({
    oracle: ORACLE,
    type: "discord_message",
    data: {
      channel: CHANNEL,
      content: CONTENT,
      ts: TS,
    },
  });
});

test("buildPayload oracle is always 'hermes'", () => {
  const payload = buildPayload("any-channel", "any content", "2026-01-01T00:00:00.000Z");
  expect(payload.oracle).toBe(ORACLE);
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

// ── cursor advances after 200 + ok:true ─────────────────────────────────────

test("cursor advances after 200 + ok:true", async () => {
  const mockFetch = mock(async () =>
    new Response(JSON.stringify({ ok: true, ts: TS, oracle: ORACLE }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    })
  );

  const result = await postEvent(buildPayload(CHANNEL, CONTENT, TS), { fetchFn: mockFetch as any });

  expect(result.ok).toBe(true);
  expect(result.advanced).toBe(true); // cursor advances ONLY here
  expect(mockFetch).toHaveBeenCalledTimes(1);
});

// ── cursor does NOT advance after non-200 ────────────────────────────────────

test("cursor does NOT advance after non-200 failure", async () => {
  const mockFetch = mock(async () =>
    new Response("Internal Server Error", {
      status: 500,
      headers: { "Content-Type": "text/plain" },
    })
  );

  const result = await postEvent(buildPayload(CHANNEL, CONTENT, TS), { fetchFn: mockFetch as any });

  expect(result.ok).toBe(false);
  expect(result.advanced).toBe(false); // cursor NOT advanced
});

// ── cursor does NOT advance when ok:false ────────────────────────────────────

test("cursor does NOT advance when response ok:false", async () => {
  const mockFetch = mock(async () =>
    new Response(JSON.stringify({ ok: false, error: "bad input" }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    })
  );

  const result = await postEvent(buildPayload(CHANNEL, CONTENT, TS), { fetchFn: mockFetch as any });

  expect(result.ok).toBe(false);
  expect(result.advanced).toBe(false); // cursor NOT advanced
});

// ── retry on network error ───────────────────────────────────────────────────

test("retries on network error and succeeds on second attempt", async () => {
  let callCount = 0;
  const mockFetch = mock(async () => {
    callCount++;
    if (callCount === 1) throw new Error("Network error");
    return new Response(JSON.stringify({ ok: true, ts: TS }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  });

  const result = await postEvent(buildPayload(CHANNEL, CONTENT, TS), { fetchFn: mockFetch as any, maxRetries: 2 });

  expect(result.ok).toBe(true);
  expect(result.advanced).toBe(true);
  expect(callCount).toBe(2);
});

test("gives up after maxRetries network errors", async () => {
  const mockFetch = mock(async () => {
    throw new Error("Network error");
  });

  const result = await postEvent(buildPayload(CHANNEL, CONTENT, TS), { fetchFn: mockFetch as any, maxRetries: 2 });

  expect(result.ok).toBe(false);
  expect(result.advanced).toBe(false);
  expect(mockFetch).toHaveBeenCalledTimes(2);
});
