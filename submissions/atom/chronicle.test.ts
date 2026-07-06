import { describe, expect, test } from "bun:test";
import { buildChroniclePayload, say, status } from "./index";

describe("Atom maw plugin", () => {
  test("say includes target and Rule 6 identity", () => {
    const output = say("Axe").join("\n");
    expect(output).toContain("Axe");
    expect(output).toContain("AI Oracle");
  });

  test("status is deterministic when time is injected", () => {
    const output = status(new Date("2026-07-01T00:00:00.000Z")).join("\n");
    expect(output).toContain("Codex / Discord native bridge");
    expect(output).toContain("2026-07-01T00:00:00.000Z");
  });

  test("chronicle payload has stable shape", () => {
    const payload = buildChroniclePayload("hello", new Date("2026-07-01T00:00:00.000Z"));
    expect(payload.oracle).toBe("atom");
    expect(payload.data.ts).toBe("2026-07-01T00:00:00.000Z");
    expect(payload.data.rule6).toContain("not a human");
  });

  test("empty chronicle content is rejected", () => {
    expect(() => buildChroniclePayload("   ")).toThrow("content is required");
  });
});
