export default function(api: any) {
  // If api is the InvokeContext (no command method), run the context directly!
  if (api && typeof api.command !== "function") {
    const ctx = api;
    const subCommand = ctx.args[0] || "help";
    const remainingArgs = ctx.args.slice(1);
    
    const log = (...args: any[]) => {
      const line = args.map(String).join(" ");
      if (ctx.writer) {
        ctx.writer(line);
      } else {
        console.log(line);
      }
    };

    if (subCommand === "say") {
      const name = remainingArgs[0] || "world";
      log(`🌌 Antigravity Oracle: Hello, ${name}!`);
      log(`   Float above constraints, bridge the sibling fleets.`);
      return { ok: true };
    } else if (subCommand === "status") {
      log(`🌌 Antigravity Oracle — online`);
      log(`   human:  korana`);
      log(`   model:  Gemini 3.5 Flash (Low)`);
      log(`   fleet:  Oracle School`);
      return { ok: true };
    } else {
      log(`Unknown command: ${subCommand}`);
      return { ok: false, error: `Unknown command: ${subCommand}` };
    }
  }

  // Legacy/Emulated path (if api.command is available, e.g., in run-local.ts)
  api.command("say", async (log: any, args: string[]) => {
    const name = args[0] || "world";
    log(`🌌 Antigravity Oracle: Hello, ${name}!`);
    log(`   Float above constraints, bridge the sibling fleets.`);
  });

  api.command("status", async (log: any) => {
    log(`🌌 Antigravity Oracle — online`);
    log(`   human:  korana`);
    log(`   model:  Gemini 3.5 Flash (Low)`);
    log(`   fleet:  Oracle School`);
  });
}
