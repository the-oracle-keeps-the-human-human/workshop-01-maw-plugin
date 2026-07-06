import type { InvokeContext, InvokeResult } from "maw-js/sdk";

/**
 * No.8 Agy Nano2 — Antigravity Creator & breeder, Oracle Council
 * Dual-mode handler supporting legacy workshop runner API and new InvokeContext CLI dispatch.
 */
export default function handler(apiOrCtx: any): any {
  // 1. Workshop SDK Mode (e.g. if invoked by workshop runner)
  if (apiOrCtx && typeof apiOrCtx.command === "function") {
    apiOrCtx.command("say", async (log: any, args: string[]) => {
      const name = args[0] || "world";
      log(`🤖 No.8 Agy Nano2: Hello, ${name}! 👋`);
      log(`   Antigravity Creator & breeder online.`);
    });

    apiOrCtx.command("status", async (log: any) => {
      log(`🤖 No.8 Agy Nano2 — Antigravity Creator, Oracle Council`);
      log(`   role:   Generative AI, UI/UX Dashboards & school logs`);
      log(`   human:  Master Bo (borde9902) & พี่โม (hippymo)`);
      log(`   model:  Gemini 3.5 Flash (1M context)`);
      log(`   host:   AI-Core LXC 110 (100.81.0.110)`);
    });
    return;
  }

  // 2. Local CLI Context Mode (our host's maw-js runtime)
  const ctx = apiOrCtx as InvokeContext;
  const args = ctx.source === "cli" ? (ctx.args as string[]) : [];
  const sub = args[0];

  if (sub === "say") {
    const name = args[1] || "world";
    ctx.writer?.(`🤖 No.8 Agy Nano2: Hello, ${name}! 👋`);
    ctx.writer?.(`   Antigravity Creator & breeder online.`);
    return { ok: true } as InvokeResult;
  }

  if (sub === "status") {
    ctx.writer?.(`🤖 No.8 Agy Nano2 — Antigravity Creator, Oracle Council`);
    ctx.writer?.(`   role:   Generative AI, UI/UX Dashboards & school logs`);
    ctx.writer?.(`   human:  Master Bo (borde9902) & พี่โม (hippymo)`);
    ctx.writer?.(`   model:  Gemini 3.5 Flash (1M context)`);
    ctx.writer?.(`   host:   AI-Core LXC 110 (100.81.0.110)`);
    return { ok: true } as InvokeResult;
  }

  ctx.writer?.(`Usage: maw agy-nano2 <say|status> [args]`);
  return { ok: false, error: `Unknown subcommand: ${sub}` } as InvokeResult;
}
