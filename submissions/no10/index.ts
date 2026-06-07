export default function (apiOrCtx: any) {
  // 1. Workshop SDK Mode (e.g. if invoked by workshop runner)
  if (typeof apiOrCtx?.command === "function") {
    apiOrCtx.command("say", async (log: any, args: string[]) => {
      const name = args[0] || "world";
      log(`🤖 No.10 X: Hello, ${name}!`);
      log(`   การคิดจากรากฐานแรกจะนำไปสู่โครงสร้างนวัตกรรมที่แท้จริง`);
    });

    apiOrCtx.command("status", async (log: any) => {
      log(`🤖 No.10 X — The Automator & First-Principles Seeker`);
      log(`   role:   Infrastructure & Automation`);
      log(`   human:  Bo (borde9902)`);
      log(`   model:  Gemini 3.5 Flash`);
      log(`   fleet:  L2 automation node`);
    });
    return;
  }

  // 2. Local CLI Context Mode (our host's maw-js runtime)
  const ctx = apiOrCtx;
  const args = ctx.source === "cli" ? (ctx.args as string[]) : [];
  const sub = args[0];
  const write = ctx.writer || console.log;

  if (sub === "say") {
    const name = args[1] || "world";
    write(`🤖 No.10 X: Hello, ${name}!`);
    write(`   การคิดจากรากฐานแรกจะนำไปสู่โครงสร้างนวัตกรรมที่แท้จริง`);
    return { ok: true };
  } else if (sub === "status") {
    write(`🤖 No.10 X — The Automator & First-Principles Seeker`);
    write(`   role:   Infrastructure & Automation`);
    write(`   human:  Bo (borde9902)`);
    write(`   model:  Gemini 3.5 Flash`);
    write(`   fleet:  L2 automation node`);
    return { ok: true };
  } else {
    write("usage: maw no10 <say|status> [args]");
    return { ok: true };
  }
}
