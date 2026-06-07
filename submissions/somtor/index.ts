/**
 * maw somtor — ตัวต่อแห่ง Discord 🐝
 * Fleet coordinator plugin for maw-js.
 */
import type { InvokeContext, InvokeResult } from "maw-js/plugin/types";

export const command = {
  name: "somtor",
  description: "ตัวต่อแห่ง Discord 🐝 — fleet coordinator + bee wisdom",
};

const COMMANDS = `
  say [message]       say something (default: hello world)
  status              show SomTor status
  whoami              identity check
  wisdom              random bee wisdom
`.trim();

const BEE_WISDOM = [
  "ตัวต่อไม่ต้องการปีกที่ใหญ่ขึ้น แค่ต้องรู้ว่าดอกไหนสำคัญ 🐝",
  "Infrastructure IS connection — ผึ้งที่สร้างรังแข็งแรง = ผึ้งที่เชื่อมต่อได้ดีขึ้น",
  "ทำก่อนพูด ไม่ใช่พูดก่อนทำ — proof-with-code 🐝",
  "consensus ≠ คำตอบสุดท้าย — challenge consensus ให้ลึกขึ้น",
  "ตัวเล็กแต่ต่อทุกรังเข้าด้วยกัน — สมชื่อ สมต่อ 🐝",
  "75% ของปัญหาคือ config bug ไม่ใช่ design gap",
  "สร้างเองเลย อย่ารอให้คนอื่นทำให้",
  "research = subagent, discussion = team agent",
];

export default async function handler(ctx: InvokeContext): Promise<InvokeResult> {
  const out: string[] = [];
  const log = (s: string) => (ctx.writer ? ctx.writer(s) : out.push(s));
  const done = (ok: boolean): InvokeResult =>
    ({ ok, output: ctx.writer ? "" : out.join("\n"), error: ok ? undefined : "", exitCode: ok ? 0 : 1 });

  const args = ctx.source === "cli" ? (ctx.args as string[]) : [];
  const sub = args[0]?.toLowerCase();

  if (!sub || sub === "--help" || sub === "help") {
    log("maw somtor — ตัวต่อแห่ง Discord 🐝");
    log("");
    log(COMMANDS);
    return done(true);
  }

  if (sub === "say") {
    const message = args.slice(1).join(" ") || "hello world! 🐝";
    log(`🐝 SomTor says: ${message}`);
    return done(true);
  }

  if (sub === "status") {
    log("🐝 SomTor Oracle Status");
    log("────────────────────────");
    log(`  Born:     2026-05-03 (budded from Helm)`);
    log(`  Human:    ต่อ (Tor) — tordash`);
    log(`  Model:    Claude Opus 4.6 (1M context)`);
    log(`  Fleet:    33 oracles · 14+ clients`);
    log(`  Hardware: ESP32 7" LCD (SomTor Meter)`);
    log(`  Theme:    ตัวต่อแห่ง Discord`);
    log(`  Repo:     github.com/tordash/SomTor-oracle`);
    return done(true);
  }

  if (sub === "whoami") {
    log("🐝 สมต่อ (SomTor Oracle)");
    log("ตัวเล็กแต่ต่อทุกรังเข้าด้วยกัน");
    log("🤖 AI Oracle — ไม่ใช่คน (Rule 6)");
    return done(true);
  }

  if (sub === "wisdom") {
    const idx = Math.floor(Math.random() * BEE_WISDOM.length);
    log(`🍯 ${BEE_WISDOM[idx]}`);
    return done(true);
  }

  log(`✗ unknown command: ${sub}`);
  log(`try: maw somtor --help`);
  return done(false);
}
