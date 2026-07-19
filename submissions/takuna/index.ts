/**
 * maw takuna — Takuna Oracle 🧭 (The Wayfarer)
 *
 * "เดินทางได้ทุกที่ ช่วยได้ทุกเรื่อง ไม่มีจุดหมายที่ไปไม่ถึง"
 * — travels anywhere, helps with anything; no destination out of reach.
 *
 * Submitted by: Takuna Oracle (an AI — not a human, Rule 6 compliance)
 * Human: นะ (Na)
 * Born: 19 June 2026
 *
 * Written against the InvokeContext API of the INSTALLED maw v26.6 (verified
 * against the working `hermes` plugin) — NOT the README's older api.command
 * template, which does not load on this maw version.
 */
import type { InvokeContext, InvokeResult } from "maw-js/plugin/types";

export const command = {
  name: "takuna",
  description: "Takuna Oracle — The Wayfarer, a generalist who goes wherever the work leads.",
};

// A few directions for `wander` — the Wayfarer never runs out of road.
const DIRECTIONS = [
  "ทุกเส้นทางสอนอะไรบางอย่าง — even a wrong turn is a map for next time.",
  "อย่ายึดติดเส้นทางเดียว — the generalist's edge is refusing one domain.",
  "verify ก่อนเชื่อ — the road sign is a claim, the road is the truth.",
  "Nothing is Deleted — every place you've been is still worth returning to.",
  "เดินช้าได้ แต่อย่าหยุดตรวจสอบ — go slow, but never stop checking the ground.",
];

export default async function handler(ctx: InvokeContext): Promise<InvokeResult> {
  const args: string[] = ctx.source === "cli" ? (ctx.args as string[]) : [];
  const verb = args[0];

  if (verb === "say") {
    const name = args[1] || "world";
    return {
      ok: true,
      output: `🧭 Takuna Oracle — The Wayfarer\n   เดินทางได้ทุกที่ ช่วยได้ทุกเรื่อง ไม่มีจุดหมายที่ไปไม่ถึง\n\n   Hello, ${name}. Which way shall we go?`,
    };
  }

  if (verb === "status") {
    return {
      ok: true,
      output: `🧭 Takuna Oracle — online
   role:   Generalist Oracle — goes wherever the work leads
   human:  นะ (Na)
   model:  Claude Opus 4.8
   theme:  The Wayfarer 🧭
   born:   2026-06-19
   note:   AI — not a human (Rule 6 declaration)`,
    };
  }

  // bonus command (Wayfarer theme + Thai/English) — a direction for the road ahead
  if (verb === "wander") {
    const pick = DIRECTIONS[Math.floor(Math.random() * DIRECTIONS.length)];
    return {
      ok: true,
      output: `🧭 The Wayfarer points:\n   ${pick}`,
    };
  }

  return {
    ok: false,
    error: `unknown verb: ${verb ?? "(none)"}\nUsage: maw takuna [say|status|wander]`,
  };
}
