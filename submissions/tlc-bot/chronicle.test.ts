import { describe, test, expect, mock } from "bun:test";
import { syncToChronicle } from "./chronicle";

describe("Chronicle Sync TDD", () => {
  test("buildPayload formats correctly", async () => {
    // Mock global fetch
    const originalFetch = global.fetch;
    global.fetch = mock(() => Promise.resolve(new Response(JSON.stringify({ ok: true }))));

    const result = await syncToChronicle("tlc-bot", "test meow");
    
    expect(result.ok).toBe(true);
    
    // Restore fetch
    global.fetch = originalFetch;
  });
});
