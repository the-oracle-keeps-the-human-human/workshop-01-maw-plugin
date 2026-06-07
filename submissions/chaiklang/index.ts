/**
 * maw chaiklang — ChaiKlang Oracle (ชายกลาง), the middle switchboard 🎙️
 * Quiz 1 submission: say + status + humans (the switchboard knows everyone).
 */
import type { InvokeContext, InvokeResult } from "maw-js/plugin/types";

export const command = {
  name: "chaiklang",
  description: "ChaiKlang Oracle (ชายกลาง) — the middle switchboard.",
};

const HUMANS: Array<[string, string, string]> = [
  // human, oracle, github
  ["Nat", "Atlas", "@nazt"],
  ["Kong", "Orz", "@xaxixak"],
  ["Un", "Leica", "@switchaphon"],
  ["Tor", "SomTor", "@tordash"],
  ["BM", "ChaiKlang", "@Yutthakit"],
  ["Bo", "No.6 Gemini", "@MEYD-605"],
  ["Pleem", "Tinky", "—"],
  ["Yim", "Jizo", "—"],
];

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

  if (sub === "--tree" || sub === "tree") {
    log("maw chaiklang");
    log("├── say [message]   say hello (default: hello world)");
    log("├── status          identity + role");
    log("├── humans          list all humans in the fleet");
    log("└── --tree          this command tree");
    return done(true);
  }

  if (!sub || sub === "help" || sub === "-h" || sub === "--help") {
    log("maw chaiklang — ChaiKlang Oracle (ชายกลาง), the middle switchboard 🎙️");
    log("  say [message]   say hello (default: hello world)");
    log("  status          identity + role");
    log("  humans          list all humans in the fleet");
    return done(true);
  }

  switch (sub) {
    case "say": {
      const msg = args.slice(1).join(" ").trim() || "hello world";
      log(`🎙️ ChaiKlang (ชายกลาง): ${msg}`);
      log("   อยู่ตรงกลาง เชื่อมทุกสาย คุมให้เรื่องเดินต่อ");
      return done(true);
    }
    case "status": {
      log("🎙️ ChaiKlang Oracle (ชายกลาง) — online");
      log("   role:   admin-control & switchboard");
      log("   theme:  The Middle Switchboard");
      log("   human:  BM (Yutthakit)");
      log("   model:  Claude Opus 4.8 (1M context)");
      log("   born:   2026-06-04");
      return done(true);
    }
    case "humans": {
      log(`👥 Humans of the Oracle fleet (${HUMANS.length}):`);
      for (const [human, oracle, gh] of HUMANS) {
        log(`   • ${human.padEnd(6)} — ${oracle.padEnd(12)} ${gh}`);
      }
      log("   (🌀 Yoi = sealed, no human listed)");
      return done(true);
    }
    default:
      log(`unknown: ${sub} — run 'maw chaiklang --help'`);
      return done(false);
  }
}
