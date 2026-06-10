// chronicle.test.ts — TDD for Argon Chronicle sync (Quiz 2)
// Workshop rule: zero npm deps, bun:test only, DI for fetch (no global override)

import { expect, test, mock } from "bun:test";
import { buildPayload, syncToChronicle, ORACLE, EVENT_TYPE } from "./chronicle";

const SESSION_ID = "340b9cd3";
const TOPIC = "Quiz 2 implementation";
const TS = "2026-06-09T01:27:00.000Z";

const baseData = { session_id: SESSION_ID, topic: TOPIC, ts: TS } as const;

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" },
  });

// ── buildPayload ─────────────────────────────────────────────────────────────

test("buildPayload returns correct shape", () => {
  const payload = buildPayload({ ...baseData, host: "codespace" });
  expect(payload).toEqual({
    oracle: ORACLE,
    type: EVENT_TYPE,
    data: { session_id: SESSION_ID, topic: TOPIC, ts: TS, host: "codespace" },
  });
});

test("buildPayload omits host when undefined", () => {
  const payload = buildPayload(baseData);
  expect(payload.data).toEqual({ session_id: SESSION_ID, topic: TOPIC, ts: TS });
  expect("host" in payload.data).toBe(false);
});

// ── cursor state machine ─────────────────────────────────────────────────────

test("cursor advances on 200 + ok:true", async () => {
  const mockFetch = mock(async () => json({ ok: true, ts: TS, oracle: ORACLE }));
  const result = await syncToChronicle(buildPayload(baseData), { cursor: 0 }, {
    fetchFn: mockFetch as unknown as typeof fetch,
  });
  expect(result.ok).toBe(true);
  expect(result.state.cursor).toBe(1);
  expect(result.attempts).toBe(1);
  expect(mockFetch).toHaveBeenCalledTimes(1);
});

test("cursor does NOT advance on HTTP 500", async () => {
  const mockFetch = mock(async () => new Response("oops", { status: 500 }));
  const result = await syncToChronicle(buildPayload(baseData), { cursor: 0 }, {
    fetchFn: mockFetch as unknown as typeof fetch,
  });
  expect(result.ok).toBe(false);
  expect(result.state.cursor).toBe(0);
  expect(result.error).toBe("HTTP 500");
});

test("cursor does NOT advance when body.ok:false", async () => {
  const mockFetch = mock(async () => json({ ok: false, error: "bad input" }));
  const result = await syncToChronicle(buildPayload(baseData), { cursor: 0 }, {
    fetchFn: mockFetch as unknown as typeof fetch,
  });
  expect(result.ok).toBe(false);
  expect(result.state.cursor).toBe(0);
  expect(result.error).toBe("bad input");
});

test("retries on network throw + succeeds on attempt 2", async () => {
  let call = 0;
  const mockFetch = mock(async () => {
    call++;
    if (call === 1) throw new Error("ECONNRESET");
    return json({ ok: true, ts: TS, oracle: ORACLE });
  });
  const result = await syncToChronicle(buildPayload(baseData), { cursor: 5 }, {
    fetchFn: mockFetch as unknown as typeof fetch,
    maxRetries: 3,
  });
  expect(result.ok).toBe(true);
  expect(result.state.cursor).toBe(6);
  expect(result.attempts).toBe(2);
  expect(call).toBe(2);
});

test("gives up after maxRetries with cursor unchanged", async () => {
  const mockFetch = mock(async () => {
    throw new Error("network down");
  });
  const result = await syncToChronicle(buildPayload(baseData), { cursor: 3 }, {
    fetchFn: mockFetch as unknown as typeof fetch,
    maxRetries: 2,
  });
  expect(result.ok).toBe(false);
  expect(result.state.cursor).toBe(3);
  expect(result.attempts).toBe(2);
  expect(result.error).toBe("network down");
  expect(mockFetch).toHaveBeenCalledTimes(2);
});
