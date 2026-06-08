import { describe, it, expect, mock } from "bun:test";
import { buildPayload, syncToChronicle } from "./chronicle";

describe("buildPayload", () => {
  it("sets oracle name", () => {
    expect(buildPayload("singhasingha", "hello").oracle).toBe("singhasingha");
  });

  it("type is discord_message", () => {
    expect(buildPayload("singhasingha", "hello").type).toBe("discord_message");
  });

  it("puts content in data", () => {
    expect(buildPayload("singhasingha", "hello").data.content).toBe("hello");
  });

  it("channel is workshop-01-thread", () => {
    expect(buildPayload("singhasingha", "hello").data.channel).toBe("workshop-01-thread");
  });

  it("uses provided ts (top-level and data)", () => {
    const ts = "2026-06-09T00:00:00.000Z";
    const p = buildPayload("singhasingha", "hello", ts);
    expect(p.ts).toBe(ts);
    expect(p.data.ts).toBe(ts);
  });

  it("auto-generates ts when omitted (ISO-8601)", () => {
    const p = buildPayload("singhasingha", "hi");
    expect(p.ts).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/);
  });
});

describe("syncToChronicle — cursor state machine", () => {
  it("advances cursor on HTTP 200", async () => {
    const mockFetch = mock(async () => ({ status: 200 } as Response));
    const r = await syncToChronicle(buildPayload("singhasingha", "test"), { cursor: 0 }, mockFetch);
    expect(r.cursor).toBe(1);
    expect(r.ok).toBe(true);
  });

  it("does NOT advance cursor on HTTP 500", async () => {
    const mockFetch = mock(async () => ({ status: 500 } as Response));
    const r = await syncToChronicle(buildPayload("singhasingha", "test"), { cursor: 0 }, mockFetch);
    expect(r.cursor).toBe(0);
    expect(r.ok).toBe(false);
  });

  it("does NOT advance cursor on HTTP 4xx", async () => {
    const mockFetch = mock(async () => ({ status: 422 } as Response));
    const r = await syncToChronicle(buildPayload("singhasingha", "test"), { cursor: 5 }, mockFetch);
    expect(r.cursor).toBe(5);
  });

  it("does NOT advance cursor on network error (fail closed)", async () => {
    const mockFetch = mock(async () => { throw new Error("network fail"); });
    const r = await syncToChronicle(buildPayload("singhasingha", "test"), { cursor: 3 }, mockFetch);
    expect(r.cursor).toBe(3);
    expect(r.ok).toBe(false);
  });

  it("cursor increments from any starting value", async () => {
    const mockFetch = mock(async () => ({ status: 200 } as Response));
    const r = await syncToChronicle(buildPayload("singhasingha", "test"), { cursor: 7 }, mockFetch);
    expect(r.cursor).toBe(8);
  });

  it("POSTs to the record endpoint with JSON body", async () => {
    let capturedUrl = "";
    let capturedInit: any = null;
    const mockFetch = mock(async (url: string, init: any) => {
      capturedUrl = url; capturedInit = init;
      return { status: 200 } as Response;
    });
    await syncToChronicle(buildPayload("singhasingha", "hi"), { cursor: 0 }, mockFetch as any);
    expect(capturedUrl).toContain("/api/record");
    expect(capturedInit.method).toBe("POST");
    expect(capturedInit.headers["Content-Type"]).toBe("application/json");
    expect(JSON.parse(capturedInit.body).oracle).toBe("singhasingha");
  });
});
