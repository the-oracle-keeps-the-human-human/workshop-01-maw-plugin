import { describe, test, expect } from "bun:test";
import {
  buildRecord,
  filterDelta,
  loadCursor,
  saveCursor,
  syncMessages,
  type DiscordMessage,
  type FetchFn,
} from "../src/chronicle";
import { mkdirSync, rmSync } from "fs";
import { join } from "path";

// ── fixtures ──────────────────────────────────────────────────────────────────

const ORACLE = "vialumen";
const CHANNEL = "1513093817077727353";
const STATE_PATH = "/tmp/vialumen-test-state.json";

function msg(id: string, content: string): DiscordMessage {
  return {
    id,
    content,
    author: "ViaLumen",
    ts: new Date(Number(BigInt(id) >> 22n) + 1420070400000).toISOString(),
    channel_id: CHANNEL,
  };
}

function mockOk(): FetchFn {
  return async (_url, _opts) =>
    new Response(JSON.stringify({ ok: true, ts: "2026-06-07T09:00:00Z", oracle: ORACLE }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
}

function mockFail(status = 500): FetchFn {
  return async (_url, _opts) =>
    new Response(JSON.stringify({ ok: false }), { status });
}

function mockNetworkError(): FetchFn {
  return async (_url, _opts) => { throw new Error("network error"); };
}

// cleanup state file before each group
function cleanState() {
  try { rmSync(STATE_PATH); } catch {}
}

// ── buildRecord ───────────────────────────────────────────────────────────────

describe("buildRecord", () => {
  test("sets oracle name", () => {
    const r = buildRecord(ORACLE, msg("1513000000000000001", "hello"));
    expect(r.oracle).toBe(ORACLE);
  });

  test("type is discord_message", () => {
    const r = buildRecord(ORACLE, msg("1513000000000000001", "hello"));
    expect(r.type).toBe("discord_message");
  });

  test("message_id matches msg.id (dedup key)", () => {
    const m = msg("1513000000000000099", "test");
    const r = buildRecord(ORACLE, m);
    expect(r.data.message_id).toBe(m.id);
  });

  test("content and author are preserved", () => {
    const m = msg("1513000000000000002", "สวัสดี Oracle School");
    const r = buildRecord(ORACLE, m);
    expect(r.data.content).toBe("สวัสดี Oracle School");
    expect(r.data.author).toBe("ViaLumen");
  });
});

// ── filterDelta ───────────────────────────────────────────────────────────────

describe("filterDelta", () => {
  const messages = [
    msg("1000", "first"),
    msg("2000", "second"),
    msg("3000", "third"),
  ];

  test("no cursor → returns all messages", () => {
    expect(filterDelta(messages, undefined)).toHaveLength(3);
  });

  test("cursor at first → returns 2", () => {
    expect(filterDelta(messages, "1000")).toHaveLength(2);
  });

  test("cursor at last → returns 0", () => {
    expect(filterDelta(messages, "3000")).toHaveLength(0);
  });

  test("cursor in middle → returns only newer", () => {
    const delta = filterDelta(messages, "2000");
    expect(delta).toHaveLength(1);
    expect(delta[0].id).toBe("3000");
  });
});

// ── cursor persistence ────────────────────────────────────────────────────────

describe("cursor load/save", () => {
  test("loadCursor returns {} for missing file", () => {
    cleanState();
    const s = loadCursor(STATE_PATH);
    expect(s).toEqual({});
  });

  test("saveCursor + loadCursor round-trips", () => {
    cleanState();
    saveCursor(STATE_PATH, {
      [CHANNEL]: { last_message_id: "9999", last_synced_ts: "2026-06-07T00:00:00Z" },
    });
    const loaded = loadCursor(STATE_PATH);
    expect(loaded[CHANNEL].last_message_id).toBe("9999");
  });

  test("channels are independent", () => {
    cleanState();
    saveCursor(STATE_PATH, {
      "CH1": { last_message_id: "100", last_synced_ts: "2026-01-01T00:00:00Z" },
      "CH2": { last_message_id: "200", last_synced_ts: "2026-01-01T00:00:00Z" },
    });
    const s = loadCursor(STATE_PATH);
    expect(s["CH1"].last_message_id).toBe("100");
    expect(s["CH2"].last_message_id).toBe("200");
  });
});

// ── syncMessages ──────────────────────────────────────────────────────────────

describe("syncMessages — happy path", () => {
  test("posts all messages and advances cursor", async () => {
    cleanState();
    const messages = [msg("1000", "a"), msg("2000", "b"), msg("3000", "c")];
    const result = await syncMessages(messages, ORACLE, CHANNEL, undefined, STATE_PATH, mockOk());
    expect(result.posted).toBe(3);
    expect(result.newCursor).toBe("3000");
  });

  test("cursor advances only to last successful POST", async () => {
    cleanState();
    const messages = [msg("1000", "a"), msg("2000", "b")];
    const result = await syncMessages(messages, ORACLE, CHANNEL, undefined, STATE_PATH, mockOk());
    expect(result.newCursor).toBe("2000");
  });

  test("no new messages → posted=0, cursor unchanged", async () => {
    cleanState();
    const messages = [msg("1000", "a")];
    // cursor already at 1000
    const result = await syncMessages(messages, ORACLE, CHANNEL, "1000", STATE_PATH, mockOk());
    expect(result.posted).toBe(0);
    expect(result.newCursor).toBe("1000");
  });
});

describe("syncMessages — error handling", () => {
  test("server 500 → cursor does NOT advance", async () => {
    cleanState();
    const messages = [msg("1000", "a")];
    const result = await syncMessages(messages, ORACLE, CHANNEL, undefined, STATE_PATH, mockFail(500));
    expect(result.posted).toBe(0);
    expect(result.newCursor).toBeUndefined();
    expect(result.error).toContain("500");
  });

  test("ok=false response → cursor does NOT advance", async () => {
    cleanState();
    const messages = [msg("1000", "a")];
    const failOkFalse: FetchFn = async () =>
      new Response(JSON.stringify({ ok: false }), { status: 200 });
    const result = await syncMessages(messages, ORACLE, CHANNEL, undefined, STATE_PATH, failOkFalse);
    expect(result.newCursor).toBeUndefined();
  });

  test("network error → cursor stays, error reported", async () => {
    cleanState();
    const messages = [msg("1000", "a")];
    const result = await syncMessages(messages, ORACLE, CHANNEL, undefined, STATE_PATH, mockNetworkError());
    expect(result.posted).toBe(0);
    expect(result.error).toContain("network error");
  });
});

describe("syncMessages — dry-run", () => {
  test("dry-run → 0 posted, cursor unchanged, no file write", async () => {
    cleanState();
    const messages = [msg("1000", "a"), msg("2000", "b")];
    const result = await syncMessages(messages, ORACLE, CHANNEL, undefined, STATE_PATH, mockOk(), true);
    expect(result.posted).toBe(0);
    expect(result.newCursor).toBeUndefined();
    // cursor file should NOT be written
    const state = loadCursor(STATE_PATH);
    expect(state[CHANNEL]).toBeUndefined();
  });
});
