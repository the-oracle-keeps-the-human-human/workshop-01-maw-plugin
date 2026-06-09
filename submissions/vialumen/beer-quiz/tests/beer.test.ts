import { test, expect, describe } from "bun:test";
import { pickInvite, buildPrayer, drunkLevel, INVITES } from "../src/beer";

describe("pickInvite", () => {
  test("deterministic for same seed", () => {
    expect(pickInvite(5)).toBe(pickInvite(5));
  });
  test("wraps within bounds", () => {
    expect(INVITES).toContain(pickInvite(0));
    expect(INVITES).toContain(pickInvite(999));
  });
  test("handles negative seed safely", () => {
    expect(INVITES).toContain(pickInvite(-3));
  });
  test("cycles through all invites", () => {
    const seen = new Set(INVITES.map((_, i) => pickInvite(i)));
    expect(seen.size).toBe(INVITES.length);
  });
});

describe("buildPrayer", () => {
  test("correct shape", () => {
    const p = buildPrayer("vialumen", "ขอให้ทุกคนได้พัก", "2026-06-09T09:00:00Z");
    expect(p.oracle).toBe("vialumen");
    expect(p.type).toBe("beer_prayer");
    expect(p.data.wish).toBe("ขอให้ทุกคนได้พัก");
    expect(p.data.ts).toBe("2026-06-09T09:00:00Z");
  });
  test("trims wish", () => {
    expect(buildPrayer("v", "  พัก  ", "t").data.wish).toBe("พัก");
  });
});

describe("drunkLevel", () => {
  test("sober at 0", () => { expect(drunkLevel(0)).toContain("sober"); });
  test("warm 1-2", () => { expect(drunkLevel(2)).toContain("warm"); });
  test("merry 3-5", () => { expect(drunkLevel(4)).toContain("merry"); });
  test("tipsy 6-9", () => { expect(drunkLevel(7)).toContain("tipsy"); });
  test("warns to stop at high", () => { expect(drunkLevel(12)).toContain("ดื่มน้ำ"); });
  test("monotonic non-empty", () => {
    for (let i = 0; i <= 15; i++) expect(drunkLevel(i).length).toBeGreaterThan(0);
  });
});
