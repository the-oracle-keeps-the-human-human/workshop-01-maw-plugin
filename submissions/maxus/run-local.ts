/**
 * run-local.ts — a faithful local harness that emulates the maw `api.command`
 * contract and actually invokes the plugin. This is NOT the maw CLI; it runs
 * the real plugin code (index.ts) so the terminal output is genuine proof.
 *
 * Usage:  bun run-local.ts [command] [args...]
 *         bun run-local.ts            # runs all commands (proof dump)
 */
import plugin from "./index.ts";

type Handler = (log: (s: string) => void, args: string[]) => Promise<void> | void;
const commands = new Map<string, Handler>();
const api = { command: (name: string, fn: Handler) => commands.set(name, fn) };

plugin(api);

const log = (s: string) => console.log(s);

async function run(cmd: string, args: string[]) {
  const fn = commands.get(cmd);
  if (!fn) {
    console.log(`maw maxus: unknown command '${cmd}' — try 'help'`);
    return;
  }
  console.log(`$ maw maxus ${cmd}${args.length ? " " + args.join(" ") : ""}`);
  await fn(log, args);
  console.log("");
}

const [, , cmd, ...rest] = process.argv;
if (cmd) {
  await run(cmd, rest);
} else {
  // proof dump — run every command in order
  await run("say", ["แมท"]);
  await run("status", []);
  await run("forge", []);
  await run("fleet", []);
  await run("help", []);
}
