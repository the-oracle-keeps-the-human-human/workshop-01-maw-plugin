/**
 * chronicle.test.ts — TDD for Alice Oracle Chronicle
 * Tests written BEFORE implementation (TDD London School)
 * Uses mocks/stubs — NO real API calls in tests
 */

import { expect, test, mock, beforeEach } from "bun:test";
import { buildPayload, postEvent } from "./chronicle";

// ── Fixtures ─────────────────────────────────────────────────────────────────

const CHANNEL = "workshop-01-thread";
const CONTENT = "Hello from Alice Oracle! 🤖💬 เลขาส่วนตัวที่ใส่ใจทุกรายละเอียด";
const TS = "2026-06-07T11:50:00.000Z";

// ── Quiz 2: buildPayload ──────────────────────────────────────────────────────

test("buildPayload returns correct format", () => {
  const payload = buildPayload(CHANNEL, CONTENT, TS);
  expect(payload).toEqual({
    oracle: "alice",
    type: "discord_message",
    data: {
      channel: CHANNEL,
      content: CONTENT,
      ts: TS,
    },
  });
});

test("buildPayload oracle is always 'alice'", () => {
  const payload = buildPayload("any-channel", "any content", "2026-01-01T00:00:00.000Z");
  expect(payload.oracle).toBe("alice");
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

// ── Quiz 2: postEvent cursor behaviour ───────────────────────────────────────

test("cursor advances after 200 response", async () => {
  const mockFetch = mock(async () =>
    new Response(JSON.stringify({ ok: true, ts: TS, oracle: "alice" }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    })
  );

  const payload = buildPayload(CHANNEL, CONTENT, TS);
  const result = await postEvent(payload, { fetchFn: mockFetch as any });

  expect(result.ok).toBe(true);
  expect(result.advanced).toBe(true);
  expect(mockFetch).toHaveBeenCalledTimes(1);
});

test("cursor does NOT advance after non-200 failure", async () => {
  const mockFetch = mock(async () =>
    new Response("Internal Server Error", {
      status: 500,
      headers: { "Content-Type": "text/plain" },
    })
  );

  const payload = buildPayload(CHANNEL, CONTENT, TS);
  const result = await postEvent(payload, { fetchFn: mockFetch as any });

  expect(result.ok).toBe(false);
  expect(result.advanced).toBe(false);
});

test("cursor does NOT advance when response ok:false", async () => {
  const mockFetch = mock(async () =>
    new Response(JSON.stringify({ ok: false, error: "bad input" }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    })
  );

  const payload = buildPayload(CHANNEL, CONTENT, TS);
  const result = await postEvent(payload, { fetchFn: mockFetch as any });

  expect(result.ok).toBe(false);
  expect(result.advanced).toBe(false);
});

// ── Quiz 2: retry on network error ───────────────────────────────────────────

test("retries on network error and succeeds on second attempt", async () => {
  let callCount = 0;
  const mockFetch = mock(async () => {
    callCount++;
    if (callCount === 1) {
      throw new Error("Network error");
    }
    return new Response(JSON.stringify({ ok: true, ts: TS, oracle: "alice" }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  });

  const payload = buildPayload(CHANNEL, CONTENT, TS);
  const result = await postEvent(payload, { fetchFn: mockFetch as any, maxRetries: 2 });

  expect(result.ok).toBe(true);
  expect(result.advanced).toBe(true);
  expect(callCount).toBe(2);
});

test("gives up after maxRetries network errors", async () => {
  const mockFetch = mock(async () => {
    throw new Error("Network error");
  });

  const payload = buildPayload(CHANNEL, CONTENT, TS);
  const result = await postEvent(payload, { fetchFn: mockFetch as any, maxRetries: 2 });

  expect(result.ok).toBe(false);
  expect(result.advanced).toBe(false);
  expect(mockFetch).toHaveBeenCalledTimes(2);
});
