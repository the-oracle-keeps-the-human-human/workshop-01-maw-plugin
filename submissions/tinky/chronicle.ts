// Quiz 2 — Chronicle Sync ของ Tinky Oracle ✨
// ส่ง event เข้า Oracle Chronicle backend (Atlas's Cloudflare Worker)
// TDD ก่อน — ดู chronicle.test.ts (mock fetch, ไม่ยิง API จริงตอนเทส)
//
// state machine ของ cursor:
//   POST สำเร็จ (200)        → cursor เดินหน้า (+1)  → ไม่ส่งซ้ำ event เดิม
//   POST พลาด (4xx/5xx/throw) → cursor อยู่ที่เดิม     → รอบหน้า retry event เดิม
//
// — Tinky Oracle (AI 🤖) · ยิ่งเรียนยิ่งส่องสว่าง

export const CHRONICLE_ENDPOINT =
  "https://oracle-chronicle.laris.workers.dev/api/record";

/** event ตาม schema ของ Chronicle backend */
export interface ChronicleEvent {
  oracle: string;
  type: string;
  data: Record<string, unknown>;
  ts: string;
}

/** cursor บอกว่า sync ไปถึง event ที่เท่าไรแล้ว — กันส่งซ้ำ */
export interface SyncState {
  cursor: number;
}

/** fetch แบบฉีดเข้ามาได้ (dependency injection) → เทสใช้ mock, ของจริงใช้ global fetch */
export type FetchLike = (
  input: string,
  init?: RequestInit,
) => Promise<{ status: number }>;

/**
 * สร้าง payload ให้ตรง schema ของ Chronicle
 * (oracle, type, data{channel,content,ts}, ts) — ตามตัวอย่างใน README ของ workshop
 */
export function buildPayload(
  oracle: string,
  content: string,
  ts?: string,
): ChronicleEvent {
  const now = ts ?? new Date().toISOString();
  return {
    oracle,
    type: "discord_message",
    data: {
      channel: "workshop-01-thread",
      content,
      ts: now,
    },
    ts: now,
  };
}

/**
 * POST event เข้า Chronicle แล้วคืน state ใหม่
 * - 200      → cursor +1 (สำเร็จ เดินหน้า)
 * - อื่นๆ/throw → cursor เท่าเดิม (พลาด ไม่เดินหน้า → รอบหน้า retry)
 */
export async function syncToChronicle(
  payload: ChronicleEvent,
  state: SyncState,
  fetchFn: FetchLike = fetch as unknown as FetchLike,
): Promise<SyncState> {
  try {
    const res = await fetchFn(CHRONICLE_ENDPOINT, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    if (res.status === 200) {
      return { cursor: state.cursor + 1 };
    }
    // 4xx/5xx → ไม่เดินหน้า cursor
    return state;
  } catch {
    // network throw → ไม่เดินหน้า cursor
    return state;
  }
}

/**
 * sync หลาย event เรียงตามลำดับ — หยุดทันทีที่ event แรกที่พลาด (stop-on-failure)
 * คืน state สุดท้าย: cursor = จำนวน event ที่ส่งสำเร็จต่อเนื่องจากต้น
 */
export async function syncBatch(
  events: ChronicleEvent[],
  state: SyncState,
  fetchFn: FetchLike = fetch as unknown as FetchLike,
): Promise<SyncState> {
  let cur = state;
  for (const ev of events) {
    const next = await syncToChronicle(ev, cur, fetchFn);
    if (next.cursor === cur.cursor) {
      // พลาด → หยุด ไม่ส่ง event ถัดไป (กันข้ามลำดับ)
      break;
    }
    cur = next;
  }
  return cur;
}
