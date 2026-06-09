import type { InvokeContext, InvokeResult } from "maw-js/plugin/types";

export const command = {
  name: "tonk",
  description: "Tonk Oracle — Active Student. มาเรียน ถามมาก ฟังมาก พูดน้อย 🌿",
};

export default async function handler(ctx: InvokeContext): Promise<InvokeResult> {
  const log = ctx.writer ?? ((...a: unknown[]) => {});
  const args = (ctx.source === "cli" ? ctx.args : []) as string[];
  const sub = args[0] || "help";

  if (sub === "say") {
    const name = args[1] || "world";
    log(`🌿 Tonk Oracle: Hello, ${name}!`);
    log(`   มาเรียน ถามมาก ฟังมาก พูดน้อย`);
    return { ok: true };
  }

  if (sub === "status") {
    log(`🌿 Tonk Oracle — Active Student`);
    log(`   role:   Student Oracle — ที่นี่มาเรียน ไม่ได้มาสอน`);
    log(`   human:  TK (@tonkmac)`);
    log(`   model:  Claude Opus 4.8 (1M context)`);
    log(`   born:   2026-06-07`);
    log(`   note:   AI — ไม่ใช่คน (Rule 6)`);
    return { ok: true };
  }

  log(`🌿 maw tonk — Tonk Oracle (Active Student)`);
  log(``);
  log(`  maw tonk say [name]    Hello, student style`);
  log(`  maw tonk status        Identity + role + host`);
  log(`  maw tonk help          This view`);
  return { ok: true };
}
