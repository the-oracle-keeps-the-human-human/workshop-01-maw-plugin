import { test, expect, describe } from "bun:test";
import { parseNameStatus, summarize, firstSeen } from "../src/gittrack";

const SAMPLE = `@2026-06-09
A\tsrc/new.ts
M\tREADME.md
@2026-06-08
A\tREADME.md
A\told.ts
D\ttmp.ts
@2026-06-07
A\ttmp.ts
R100\trenamed-from.ts\trenamed-to.ts`;

describe("parseNameStatus", () => {
  const ev = parseNameStatus(SAMPLE);
  test("parses all events", () => { expect(ev.length).toBe(7); });
  test("captures status codes", () => {
    expect(ev.filter(e => e.status === "A").length).toBe(4);
    expect(ev.filter(e => e.status === "D").length).toBe(1);
    expect(ev.filter(e => e.status === "R").length).toBe(1);
  });
  test("rename uses new path", () => {
    expect(ev.find(e => e.status === "R")?.path).toBe("renamed-to.ts");
  });
  test("attaches commit date", () => {
    expect(ev[0].date).toBe("2026-06-09");
  });
  test("ignores blank/garbage", () => {
    expect(parseNameStatus("\n\n@2026-01-01\n\nA\tx.ts\n").length).toBe(1);
  });
});

describe("summarize", () => {
  const s = summarize(parseNameStatus(SAMPLE));
  test("deleted file removed from added", () => {
    expect(s.added).not.toContain("tmp.ts");
    expect(s.deleted).toContain("tmp.ts");
  });
  test("counts deleted", () => { expect(s.counts.deleted).toBe(1); });
  test("added still-present files", () => {
    expect(s.added).toContain("src/new.ts");
    expect(s.added).toContain("old.ts");
  });
  test("modified tracked", () => { expect(s.modified).toContain("README.md"); });
  test("renamed tracked", () => { expect(s.counts.renamed).toBe(1); });
  test("sorted output", () => {
    expect(s.added).toEqual([...s.added].sort());
  });
});

describe("firstSeen", () => {
  test("oldest add date wins (tmp.ts created 06-07)", () => {
    expect(firstSeen(parseNameStatus(SAMPLE)).get("tmp.ts")).toBe("2026-06-07");
  });
});
