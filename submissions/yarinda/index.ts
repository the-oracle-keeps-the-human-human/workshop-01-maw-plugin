/**
 * maw yarinda — ญรินดา (Yarinda) Oracle, The Curious Compass 🧭
 *
 * Written against the installed maw-js v26.5 plugin SDK contract:
 *   - export const command = { name, description }
 *   - export default async function handler(ctx: InvokeContext): InvokeResult
 *   - ctx.writer streams to stdout on the CLI surface; fall back to console.log
 *
 * (Note: the workshop README + existing submissions use an `api.command(...)`
 *  registration shape. On the maw installed here (v26.5.2) the CLI invokes a
 *  plugin's default export as handler(ctx), so that shape throws
 *  "api.command is not a function" at runtime — verified with a probe plugin.
 *  This file targets the installed contract so the commands run for real. I
 *  did not determine whether api.command is a newer or a parallel convention.)
 */

interface InvokeContext {
  source: "cli" | "api" | "peer";
  args: string[] | Record<string, unknown>;
  writer?: (...args: unknown[]) => void;
}

interface InvokeResult {
  ok: boolean;
  output?: string;
  error?: string;
}

export const command = {
  name: ["yarinda", "yi"],
  description: "ญรินดา (Yarinda) — The Curious Compass 🧭",
};

export default async function handler(ctx: InvokeContext): Promise<InvokeResult> {
  const log = ctx.writer ?? ((...a: unknown[]) => console.log(...a));

  const argv = ctx.source === "cli" ? (ctx.args as string[]) : [];
  const sub =
    ctx.source === "cli"
      ? argv[0] ?? "status"
      : ((ctx.args as Record<string, unknown>).sub as string) ?? "status";
  const rest = argv.slice(1);

  switch (sub) {
    case "say": {
      const name = rest[0] ?? "world";
      log(`🧭 Yarinda: Hello, ${name}!`);
      log(`   สงสัยทุกทาง พาถึงปลายทาง — every question leads to the way.`);
      return { ok: true };
    }

    case "status": {
      log(`🧭 ญรินดา (Yarinda) — online`);
      log(`   human:  Atom`);
      log(`   model:  Claude Opus 4.8`);
      log(`   theme:  The Curious Compass`);
      log(`   fleet:  Oracle School`);
      return { ok: true };
    }

    // Bonus command — the compass never decides for you, it asks.
    case "ask": {
      const topic = rest.join(" ") || "this";
      log(`🧭 Yarinda asks about "${topic}":`);
      log(`   1. ทำไม?        — why does it matter?`);
      log(`   2. แล้วไง?       — what changes if it's true?`);
      log(`   3. มีทางอื่นไหม? — what's the alternative?`);
      return { ok: true };
    }

    default: {
      log(`usage: maw yarinda [say <name>|status|ask <topic>]`);
      return { ok: false, error: `unknown subcommand: ${sub}` };
    }
  }
}
