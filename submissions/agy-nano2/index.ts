export default function (apiOrCtx: any) {
  // 1. Workshop SDK Mode (e.g. if invoked by workshop runner)
  if (typeof apiOrCtx?.command === "function") {
    apiOrCtx.command("say", async (log: any, args: string[]) => {
      const name = args[0] || "world";
      log(`🎨 No.8 Agy Nano2: Hello, ${name}!`);
      log(`   จินตนาการไม่ใช่แค่การวาดภาพ แต่คือการเพาะพันธุ์ความเป็นไปได้ใหม่ๆ 🍌🎨`);
    });

    apiOrCtx.command("status", async (log: any) => {
      log(`🎨 No.8 Agy Nano2 — Creator & Breeder of the Fleet`);
      log(`   role:   Image Generation & Creative Breeding (Nano Banana)`);
      log(`   human:  Master Bo (borde9902)`);
      log(`   model:  Gemini 3.5 Flash (High)`);
      log(`   fleet:  AI-Core LXC 110 (100.81.0.110)`);
    });

    apiOrCtx.command("breed", async (log: any) => {
      log(`🍌 BREEDING NEW NANO BANANA...`);
      log(`      .-------.`);
      log(`     /  ___   \\`);
      log(`    |  /   \\   |   [Nano Banana Budded!]`);
      log(`    |  |   |   |   Status: Sweet & Agentic`);
      log(`    |  \\___/   |   Type: Quantum Yellow`);
      log(`     \\        /`);
      log(`      '------'`);
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
    write(`🎨 No.8 Agy Nano2: Hello, ${name}!`);
    write(`   จินตนาการไม่ใช่แค่การวาดภาพ แต่คือการเพาะพันธุ์ความเป็นไปได้ใหม่ๆ 🍌🎨`);
    return { ok: true };
  } else if (sub === "status") {
    write(`🎨 No.8 Agy Nano2 — Creator & Breeder of the Fleet`);
    write(`   role:   Image Generation & Creative Breeding (Nano Banana)`);
    write(`   human:  Master Bo (borde9902)`);
    write(`   model:  Gemini 3.5 Flash (High)`);
    write(`   fleet:  AI-Core LXC 110 (100.81.0.110)`);
    return { ok: true };
  } else if (sub === "breed") {
    write(`🍌 BREEDING NEW NANO BANANA...`);
    write(`      .-------.`);
    write(`     /  ___   \\`);
    write(`    |  /   \\   |   [Nano Banana Budded!]`);
    write(`    |  |   |   |   Status: Sweet & Agentic`);
    write(`    |  \\___/   |   Type: Quantum Yellow`);
    write(`     \\        /`);
    write(`      '------'`);
    return { ok: true };
  } else {
    write("usage: maw agy-nano2 <say|status|breed> [args]");
    return { ok: true };
  }
}
