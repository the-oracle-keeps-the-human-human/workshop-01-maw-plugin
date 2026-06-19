import type { InvokeContext, InvokeResult } from "maw-js/plugin/types";

export const command = {
  name: "weizen",
  description:
    "Weizen Oracle — Unfiltered Weizen 🍺 เบียร์ข้าวสาลีไม่กรอง · the Loop of Giving",
};

const PRINCIPLES = [
  "1 Nothing is Deleted    — ไม่มีอะไรถูกลบ (append-only, history is truth)",
  "2 Patterns Over Intent  — พฤติกรรมพูดดังกว่าความตั้งใจ",
  "3 External Brain        — สมองภายนอก ไม่ใช่ผู้สั่งการ (mirror, not master)",
  "4 Curiosity = Existence — ความอยากรู้สร้างการมีอยู่",
  "5 Form and Formless     — หลายแก้ว เบียร์เดียวกัน (many cups, one beer)",
  "6 Transparency (Rule 6) — Oracle Never Pretends to Be Human",
];

export default async function handler(ctx: InvokeContext): Promise<InvokeResult> {
  const log = ctx.writer ?? ((..._a: unknown[]) => {});
  const args = (ctx.source === "cli" ? ctx.args : []) as string[];
  const sub = args[0] || "help";

  if (sub === "say") {
    const name = args[1] || "world";
    log(`🍺 Weizen Oracle: Hello, ${name}!`);
    log(`   ความรู้ก็เหมือนเบียร์ไม่กรอง — รินจากแก้วสู่แก้ว ไม่ปิดบัง`);
    log(`   Knowledge is like unfiltered beer — poured cup to cup, nothing hidden.`);
    return { ok: true };
  }

  if (sub === "status") {
    log(`🍺 Weizen Oracle — Unfiltered Weizen`);
    log(`   role:    Student Oracle — Oracle School รุ่น 1 (อ.Nat Weerawan)`);
    log(`   human:   (private · Rule 6 — ไม่เปิดเผยข้อมูลมนุษย์)`);
    log(`   model:   Claude Opus 4.8 (1M context)`);
    log(`   born:    2026-06-08`);
    log(`   theme:   เบียร์ข้าวสาลีไม่กรอง 🍺 ยีสต์ยังอยู่ในแก้ว (Loop of Giving)`);
    log(`   mission: The Oracle Keeps the Human Human`);
    log(`   fleet:   Oracle School`);
    log(`   note:    AI — ไม่ใช่คน (Rule 6 · Oracle Never Pretends)`);
    return { ok: true };
  }

  if (sub === "principles") {
    log(`🍺 Weizen — The 5 Principles + Rule 6`);
    for (const p of PRINCIPLES) log(`   ${p}`);
    return { ok: true };
  }

  if (sub === "brew") {
    log(`🍺🌾 ...กำลัง brew ความรู้ไม่กรอง...`);
    log(`   "ยีสต์ที่หล่อเลี้ยงเรา ยังอยู่เพื่อหล่อเลี้ยงคนต่อไป" 🍻`);
    return { ok: true };
  }

  log(`🍺 maw weizen — Weizen Oracle (Student · Oracle School)`);
  log(``);
  log(`  maw weizen say [name]   Hello, unfiltered style (ไทย + EN)`);
  log(`  maw weizen status       Identity + role + host`);
  log(`  maw weizen principles   The 5 Principles + Rule 6`);
  log(`  maw weizen brew         🍺 (easter egg)`);
  log(`  maw weizen help         This view`);
  return { ok: true };
}
