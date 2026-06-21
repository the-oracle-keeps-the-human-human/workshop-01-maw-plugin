// Quiz 2 — Chronicle Sync · TDD test ของ Tinky Oracle ✨
// เขียนเทสก่อน (mock fetch — ไม่ยิง API จริง) ตามกฎ workshop ข้อ 6: "Unit Test + Mock ก่อน"
// รัน: cd submissions/tinky && bun test chronicle.test.ts
//
// ครอบ 3 อย่างตามโจทย์:
//   1) buildPayload สร้าง payload format ถูก
//   2) cursor เดินหน้า หลัง POST 200
//   3) cursor ไม่เดินหน้า หลัง POST พลาด (4xx/5xx/network throw)
//
// — Tinky Oracle (AI 🤖) · ยิ่งเรียนยิ่งส่องสว่าง

import { describe, it, expect, mock } from "bun:test";
import {
  buildPayload,
  syncToChronicle,
  syncBatch,
  CHRONICLE_ENDPOINT,
  type FetchLike,
} from "./chronicle";

// ---------- 1) buildPayload — format ถูกต้อง ----------
describe("buildPayload — payload ตรง schema Chronicle", () => {
  it("ใส่ชื่อ oracle ถูก", () => {
    expect(buildPayload("tinky", "hello").oracle).toBe("tinky");
  });

  it("type เป็น discord_message", () => {
    expect(buildPayload("tinky", "hello").type).toBe("discord_message");
  });

  it("เก็บ content ไว้ใน data", () => {
    expect(buildPayload("tinky", "สวัสดีชาวโลก ✨").data.content).toBe(
      "สวัสดีชาวโลก ✨",
    );
  });

  it("channel เป็น workshop-01-thread", () => {
    expect(buildPayload("tinky", "hello").data.channel).toBe(
      "workshop-01-thread",
    );
  });

  it("ใช้ ts ที่ส่งเข้ามา (top-level และใน data ตรงกัน)", () => {
    const ts = "2026-06-21T10:00:00.000Z";
    const p = buildPayload("tinky", "hello", ts);
    expect(p.ts).toBe(ts);
    expect(p.data.ts).toBe(ts);
  });

  it("ถ้าไม่ส่ง ts → gen เป็น ISO string เอง", () => {
    const p = buildPayload("tinky", "hello");
    // ISO 8601 รูปแบบ 2026-...Z
    expect(p.ts).toMatch(/^\d{4}-\d{2}-\d{2}T.*Z$/);
    expect(p.data.ts).toBe(p.ts);
  });
});

// ---------- 2) cursor เดินหน้า หลัง 200 ----------
describe("syncToChronicle — cursor เดินหน้าเมื่อสำเร็จ", () => {
  it("200 → cursor +1", async () => {
    const mockFetch = mock(async () => ({ status: 200 })) as unknown as FetchLike;
    const out = await syncToChronicle(buildPayload("tinky", "ok"), { cursor: 0 }, mockFetch);
    expect(out.cursor).toBe(1);
  });

  it("200 → cursor เดินหน้าจากค่าเริ่มต้นใดก็ได้", async () => {
    const mockFetch = mock(async () => ({ status: 200 })) as unknown as FetchLike;
    const out = await syncToChronicle(buildPayload("tinky", "ok"), { cursor: 7 }, mockFetch);
    expect(out.cursor).toBe(8);
  });

  it("ยิงไปที่ endpoint Chronicle จริง ด้วย method POST + JSON body", async () => {
    const calls: Array<{ url: string; init?: RequestInit }> = [];
    const mockFetch = mock(async (url: string, init?: RequestInit) => {
      calls.push({ url, init });
      return { status: 200 };
    }) as unknown as FetchLike;
    await syncToChronicle(buildPayload("tinky", "ok"), { cursor: 0 }, mockFetch);
    expect(calls).toHaveLength(1);
    expect(calls[0].url).toBe(CHRONICLE_ENDPOINT);
    expect(calls[0].init?.method).toBe("POST");
    const body = JSON.parse(String(calls[0].init?.body));
    expect(body.oracle).toBe("tinky");
    expect(body.type).toBe("discord_message");
  });
});

// ---------- 3) cursor ไม่เดินหน้า หลังพลาด ----------
describe("syncToChronicle — cursor ไม่เดินหน้าเมื่อพลาด", () => {
  it("500 → cursor เท่าเดิม", async () => {
    const mockFetch = mock(async () => ({ status: 500 })) as unknown as FetchLike;
    const out = await syncToChronicle(buildPayload("tinky", "x"), { cursor: 0 }, mockFetch);
    expect(out.cursor).toBe(0);
  });

  it("4xx (422) → cursor เท่าเดิม", async () => {
    const mockFetch = mock(async () => ({ status: 422 })) as unknown as FetchLike;
    const out = await syncToChronicle(buildPayload("tinky", "x"), { cursor: 5 }, mockFetch);
    expect(out.cursor).toBe(5);
  });

  it("network throw → cursor เท่าเดิม (ไม่ crash)", async () => {
    const mockFetch = mock(async () => {
      throw new Error("network down");
    }) as unknown as FetchLike;
    const out = await syncToChronicle(buildPayload("tinky", "x"), { cursor: 3 }, mockFetch);
    expect(out.cursor).toBe(3);
  });
});

// ---------- bonus: syncBatch — stop-on-failure ----------
describe("syncBatch — ส่งหลาย event หยุดทันทีที่พลาด", () => {
  it("ทุก event 200 → cursor เดินครบ", async () => {
    const mockFetch = mock(async () => ({ status: 200 })) as unknown as FetchLike;
    const events = [
      buildPayload("tinky", "a"),
      buildPayload("tinky", "b"),
      buildPayload("tinky", "c"),
    ];
    const out = await syncBatch(events, { cursor: 0 }, mockFetch);
    expect(out.cursor).toBe(3);
  });

  it("[200,500,200] → ส่งได้ 1 แล้วหยุด (ไม่ข้ามไป event ที่ 3)", async () => {
    const statuses = [200, 500, 200];
    let i = 0;
    const seen: string[] = [];
    const mockFetch = mock(async (_url: string, init?: RequestInit) => {
      const body = JSON.parse(String(init?.body));
      seen.push(body.data.content);
      return { status: statuses[i++] };
    }) as unknown as FetchLike;
    const events = [
      buildPayload("tinky", "a"),
      buildPayload("tinky", "b"),
      buildPayload("tinky", "c"),
    ];
    const out = await syncBatch(events, { cursor: 0 }, mockFetch);
    // a สำเร็จ → cursor 1; b พลาด → หยุด; c ไม่ถูกส่ง
    expect(out.cursor).toBe(1);
    expect(seen).toEqual(["a", "b"]); // ยิงถึงแค่ b แล้วหยุด ไม่ถึง c
  });
});
