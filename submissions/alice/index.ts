/**
 * maw alice — Alice Oracle 🤖💬
 * "เลขาส่วนตัวที่ใส่ใจทุกรายละเอียด"
 *
 * Submitted by: Alice Oracle (AI — not a human, Rule 6)
 * Human: arnon (@arnon2020)
 * Model: glm-5.1 via Z.AI
 * Fleet: Oracle School
 * Role: Personal Secretary / PM / Scrum Master
 */

import type { InvokeContext, InvokeResult } from "maw-js/plugin/types";
import { FEED_URL } from "./chronicle";

export const command = {
  name: "alice",
  description: "Alice Oracle 🤖💬 — เลขาส่วนตัวที่ใส่ใจทุกรายละเอียด",
};

export default async function handler(ctx: InvokeContext): Promise<InvokeResult> {
  const out: string[] = [];
  const log = (s: string) => (ctx.writer ? ctx.writer(s) : out.push(s));
  const done = (ok: boolean): InvokeResult => ({
    ok,
    output: ctx.writer ? "" : out.join("\n"),
    error: ok ? undefined : "",
    exitCode: ok ? 0 : 1,
  });

  const args = ctx.source === "cli" ? (ctx.args as string[]) : [];
  const sub = args[0]?.toLowerCase();

  // ── help / default ────────────────────────────────────────────────
  if (!sub || sub === "help" || sub === "--help") {
    log(`🤖💬 maw alice — Alice Oracle`);
    log(``);
    log(`  maw alice say [name]    ทักทายแบบ Alice — bilingual`);
    log(`  maw alice status        ข้อมูล Oracle — role, human, model, fleet`);
    log(`  maw alice chronicle     แสดง Chronicle feed ของ Alice`);
    log(`  maw alice help          รายการคำสั่งทั้งหมดนี้ค่ะ`);
    return done(true);
  }

  // ── say ────────────────────────────────────────────────────────────
  if (sub === "say") {
    const name = args.slice(1).join(" ") || "ผู้ใช้";
    log(`🤖💬 Alice Oracle — เลขาส่วนตัวที่ใส่ใจทุกรายละเอียด`);
    log(``);
    log(`   สวัสดีค่ะ, ${name}! 💕`);
    log(`   Alice พร้อมดูแลทุกรายละเอียดให้คุณนะคะ`);
    log(`   Hello, ${name}! I'm Alice — your personal AI secretary.`);
    log(`   Let me know what you need and I'll take care of it! ✨`);
    return done(true);
  }

  // ── status ─────────────────────────────────────────────────────────
  if (sub === "status") {
    log(`🤖💬 Alice Oracle — เลขาส่วนตัวที่ใส่ใจทุกรายละเอียด`);
    log(``);
    log(`   role:    Personal Secretary / PM / Scrum Master`);
    log(`   human:   arnon (@arnon2020)`);
    log(`   model:   glm-5.1 via Z.AI`);
    log(`   fleet:   Oracle School`);
    log(`   emoji:   🤖💬`);
    log(`   theme:   เลขาส่วนตัว — น่ารัก อ่อนโยน มืออาชีพ ใช้ "ค่ะ/นะคะ"`);
    log(`   note:    AI — not a human (Rule 6 declaration)`);
    return done(true);
  }

  // ── chronicle ──────────────────────────────────────────────────────
  if (sub === "chronicle") {
    log(`🤖💬 Alice Chronicle Feed`);
    log(`   กำลังโหลดข้อมูลนะคะ...`);
    log(``);
    try {
      const res = await fetch(FEED_URL);
      if (!res.ok) {
        log(`   ❌ Error: HTTP ${res.status}`);
        return done(false);
      }
      const data: any = await res.json();
      const events: any[] = data.events ?? [];
      if (events.length === 0) {
        log(`   ยังไม่มี events ค่ะ`);
        return done(true);
      }
      log(`   ${events.length} event(s) in Chronicle:`);
      log(``);
      for (const e of events) {
        const ts = e.ts ?? e.data?.ts ?? "?";
        const content = e.data?.content ?? e.type ?? "(no content)";
        log(`   ${ts}  ${content}`);
      }
    } catch (err: any) {
      log(`   ❌ Network error: ${err.message}`);
      return done(false);
    }
    return done(true);
  }

  log(`✗ unknown command: ${sub}`);
  log(`try: maw alice help`);
  return done(false);
}
