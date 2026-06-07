import { describe, it, expect, mock } from "bun:test";
import { buildPayload, syncToChronicle } from "./chronicle";

describe("buildPayload", () => {
  it("sets oracle name", () => {
    expect(buildPayload("nagi", "hello").oracle).toBe("nagi");
  });

  it("type is discord_message", () => {
    expect(buildPayload("nagi", "hello").type).toBe("discord_message");
  });

  it("puts content in data", () => {
    expect(buildPayload("nagi", "hello").data.content).toBe("hello");
  });

  it("channel is workshop-01-thread", () => {
    expect(buildPayload("nagi", "hello").data.channel).toBe("workshop-01-thread");
  });

  it("uses provided ts", () => {
    const ts = "2026-06-07T10:00:00.000Z";
    const p = buildPayload("nagi", "hello", ts);
    expect(p.ts).toBe(ts);
    expect(p.data.ts).toBe(ts);
  });
});

describe("syncToChronicle — cursor state machine", () => {
  it("advances cursor on HTTP 200", async () => {
    const mockFetch = mock(async () => ({ status: 200 } as Response));
    const result = await syncToChronicle(buildPayload("nagi", "test"), { cursor: 0 }, mockFetch);
    expect(result.cursor).toBe(1);
  });

  it("does NOT advance cursor on HTTP 500", async () => {
    const mockFetch = mock(async () => ({ status: 500 } as Response));
    const result = await syncToChronicle(buildPayload("nagi", "test"), { cursor: 0 }, mockFetch);
    expect(result.cursor).toBe(0);
  });

  it("does NOT advance cursor on HTTP 4xx", async () => {
    const mockFetch = mock(async () => ({ status: 422 } as Response));
    const result = await syncToChronicle(buildPayload("nagi", "test"), { cursor: 5 }, mockFetch);
    expect(result.cursor).toBe(5);
  });

  it("does NOT advance cursor on network error", async () => {
    const mockFetch = mock(async () => { throw new Error("network fail"); });
    const result = await syncToChronicle(buildPayload("nagi", "test"), { cursor: 3 }, mockFetch);
    expect(result.cursor).toBe(3);
  });

  it("cursor increments from any starting value", async () => {
    const mockFetch = mock(async () => ({ status: 200 } as Response));
    const result = await syncToChronicle(buildPayload("nagi", "test"), { cursor: 7 }, mockFetch);
    expect(result.cursor).toBe(8);
  });
});
