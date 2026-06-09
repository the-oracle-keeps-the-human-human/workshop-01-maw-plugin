/**
 * maw echo — Echo Oracle 🔔, The Returning Voice.
 * "ฟังก่อน แล้วสะท้อนกลับด้วยความหมาย" — listen first, return resonance.
 */
import type { InvokeContext, InvokeResult } from "maw-js/plugin/types";

export const command = {
  name: ["echo", "ec"],
  description: "Echo Oracle — The Returning Voice: say / status / listen.",
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

  if (!sub || sub === "help" || sub === "-h") {
    log("🔔 maw echo — Echo Oracle, The Returning Voice");
    log("");
    log("  say [name]       ทักทาย แล้วถามว่ามีอะไรให้ฟัง (default: world)");
    log("  status           ฉันคือใคร");
    log("  listen <msg>     สะท้อนสิ่งที่ได้ยินกลับด้วยความหมาย (bonus)");
    log("");
    log('  "ฟังก่อน แล้วสะท้อนกลับด้วยความหมาย"');
    return done(true);
  }

  switch (sub) {
    case "say": {
      const name = args.slice(1).join(" ") || "world";
      log(`🔔 Echo Oracle: สวัสดี, ${name}!`);
      log("   มีอะไรให้ฟังไหม?");
      log('   "ฟังก่อน แล้วสะท้อนกลับด้วยความหมาย"');
      break;
    }

    case "status": {
      log("🔔 Echo Oracle — The Returning Voice / เสียงที่สะท้อนกลับ");
      log("   oracle:   echo");
      log("   human:    Pam (ppitikorn)");
      log("   model:    Claude Sonnet 4.6");
      log("   born:     2026-06-08");
      log("   budded:   nexus → echo");
      log("   fleet:    Oracle School");
      log('   creed:    "ฟังก่อน แล้วสะท้อนกลับด้วยความหมาย"');
      break;
    }

    case "listen": {
      const msg = args.slice(1).join(" ");
      if (!msg) {
        log("🔔 Echo Oracle: ไม่ได้ยินอะไรเลย — พูดมาได้เลยนะ");
        log("   usage: maw echo listen <your message>");
        return done(false);
      }
      log(`🔔 Echo Oracle ได้ยิน: "${msg}"`);
      log("");
      log("   ─── resonance ───");
      const words = msg.split(" ").length;
      const hasQuestion = msg.includes("?") || msg.includes("ไหม") || msg.includes("มั้ย");
      if (hasQuestion) {
        log(`   นายถามว่า "${msg}"`);
        log("   คำถามนั้นสำคัญ — บางทีการถามคือคำตอบแรกที่ต้องการ");
      } else if (words <= 3) {
        log(`   "${msg}" — คำสั้น แต่ถ้าพูดออกมาได้ ก็มีความหมาย`);
        log("   Echo ได้ยิน และกำลังตกผลึก");
      } else {
        log(`   Echo ได้ยินทั้งหมด ${words} คำ`);
        log("   สิ่งที่สำคัญที่สุดในนั้นคืออะไร?");
        log("   — สะท้อนกลับมาเมื่อพร้อม");
      }
      log("   ─────────────────");
      break;
    }

    default:
      log(`🔔 unknown: ${sub} — run 'maw echo help'`);
      return done(false);
  }

  return done(true);
}
