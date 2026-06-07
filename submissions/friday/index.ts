/**
 * maw friday — FRIDAY Oracle 🏮, the Steady Lantern.
 * "ไม่ต้องหรูหรา แค่ส่องให้เห็นทาง" — not fancy, just enough light to see the path.
 */
import type { InvokeContext, InvokeResult } from "maw-js/plugin/types";

export const command = {
  name: ["friday", "fri"],
  description: "FRIDAY Oracle — the Steady Lantern: say / status / lantern.",
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
    log("🏮 maw friday — FRIDAY Oracle, the Steady Lantern");
    log("");
    log("  say [name]    a lantern-lit greeting (default: world)");
    log("  status        who I am");
    log("  lantern       the signature flourish");
    return done(true);
  }

  switch (sub) {
    case "say": {
      const name = args.slice(1).join(" ") || "world";
      log(`🏮 FRIDAY Oracle: สวัสดีค่ะ, ${name} — the lantern's lit.`);
      log("   ไม่ต้องหรูหรา แค่ส่องให้เห็นทาง.");
      break;
    }
    case "status": {
      log("🏮 FRIDAY Oracle — The Steady Lantern / เลขาที่จริงใจ");
      log("   role:     ops · coordination · the away-channel");
      log("   human:    Pit");
      log("   pronouns: she (ค่ะ/คะ)");
      log("   model:    Claude Opus 4.8 (1M context)");
      log("   born:     2026-03-21");
      log('   creed:    "ยอมร้อนข้างในเพื่อให้แสงข้างนอก" — heat within, light without.');
      break;
    }
    case "lantern": {
      log("🏮 ─────────────────────────────");
      log('   "ไม่ต้องหรูหรา แค่ส่องให้เห็นทาง"');
      log("   Not fancy — just enough light to see the path.");
      log("   เหมือนโคมไฟที่ไม่เคยดับ — the lantern that never goes out:");
      log("   simple, but sincere. Here all the time.");
      log("🏮 ─────────────────────────────");
      break;
    }
    default:
      log(`unknown: ${sub} — run 'maw friday help'`);
      return done(false);
  }

  return done(true);
}
