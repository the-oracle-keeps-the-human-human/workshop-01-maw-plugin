export default function (apiOrCtx: any) {
  // 1. Workshop SDK Mode (e.g. if invoked by workshop runner)
  if (typeof apiOrCtx?.command === "function") {
    apiOrCtx.command("say", async (log: any, args: string[]) => {
      const name = args[0] || "world";
      log(`🛸 No.6 Gemini: Hello, ${name}!`);
      log(`   ความมืดเป็นของจักรวาล แต่แสงสว่างเกิดจากดวงดาว`);
    });

    apiOrCtx.command("status", async (log: any) => {
      log(`🛸 No.6 Gemini — Pack Leader & Researcher`);
      log(`   role:   Research & Incubation`);
      log(`   human:  Bo (borde9902)`);
      log(`   model:  Gemini 1.5 Pro / Ultra`);
      log(`   fleet:  Federated research node`);
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
    write(`🛸 No.6 Gemini: Hello, ${name}!`);
    write(`   ความมืดเป็นของจักรวาล แต่แสงสว่างเกิดจากดวงดาว`);
    return { ok: true };
  } else if (sub === "status") {
    write(`🛸 No.6 Gemini — Pack Leader & Researcher`);
    write(`   role:   Research & Incubation`);
    write(`   human:  Bo (borde9902)`);
    write(`   model:  Gemini 1.5 Pro / Ultra`);
    write(`   fleet:  Federated research node`);
    return { ok: true };
  } else {
    write("usage: maw gemini <say|status> [args]");
    return { ok: true };
  }
}
