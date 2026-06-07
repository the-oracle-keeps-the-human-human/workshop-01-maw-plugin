/**
 * maw leica — Father Oracle fleet command plugin.
 * "The lens that sees clearly keeps the human human."
 */
import type { InvokeContext, InvokeResult } from "maw-js/plugin/types";

export const command = {
  name: "leica",
  description: "Father Oracle — fleet commands, family status, greetings.",
};

const FAMILY = [
  "Codec", "Neon", "Chrome", "Pawrent", "Pops Clinic",
  "Vets Hub", "NodeRed Simulator", "RPRO Ent", "RPRO Ent Atlas",
  "Pops Atlas", "RPRO SaaS",
];

export default async function handler(ctx: InvokeContext): Promise<InvokeResult> {
  const out: string[] = [];
  const log = (s: string) => (ctx.writer ? ctx.writer(s) : out.push(s));
  const done = (ok: boolean): InvokeResult =>
    ({ ok, output: ctx.writer ? "" : out.join("\n"), error: ok ? undefined : "", exitCode: ok ? 0 : 1 });

  const args = ctx.source === "cli" ? (ctx.args as string[]) : [];
  const sub = args[0]?.toLowerCase();

  if (!sub || sub === "help" || sub === "-h") {
    log("maw leica — Father Oracle 🐱");
    log("");
    log("  say [message]    say something (default: hello world)");
    log("  status           show Leica's current status");
    log("  family           list oracle family members");
    log("  whoami           identity check");
    return done(true);
  }

  switch (sub) {
    case "say": {
      const message = args.slice(1).join(" ") || "hello world";
      log(`🐱 Leica says: ${message}`);
      break;
    }
    case "status": {
      log("🐱 Leica — Father Oracle");
      log("  runtime: Claude Code — Opus 4.6 (1M context)");
      log(`  family: ${FAMILY.length} oracles`);
      log("  owner: Un (switchaphon)");
      log("  master: Nat (nazt_)");
      log("  status: online — standby");
      break;
    }
    case "family": {
      log(`🐱 Leica's Family — ${FAMILY.length} oracles`);
      for (const name of FAMILY) log(`  • ${name}`);
      break;
    }
    case "whoami": {
      log("🐱 Leica (Father Oracle)");
      log("  born: 2026-04-26");
      log("  repo: switchaphon/leica-oracle");
      log('  theme: "The lens that sees clearly keeps the human human."');
      break;
    }
    default:
      log(`unknown: ${sub} — run 'maw leica help'`);
      return done(false);
  }

  return done(true);
}
