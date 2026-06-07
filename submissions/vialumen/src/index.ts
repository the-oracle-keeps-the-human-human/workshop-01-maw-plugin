import { maw } from "@maw-js/sdk";
import { type InvokeContext, type InvokeResult, parseFlags } from "@maw-js/sdk/plugin";
import { syncMessages, loadCursor, CHRONICLE_URL } from "./chronicle";
import type { DiscordMessage } from "./chronicle";
import { homedir } from "os";
import { join } from "path";

export const command = {
  name: "vialumen",
  description: "ViaLumen — Oracle School student. subcommands: status, say, chronicle sync",
};

const STATE_PATH = join(homedir(), ".maw", "vialumen-state.json");
const ORACLE_NAME = "vialumen";

const DEFAULT_CHANNELS = [
  { id: "1513093817077727353", name: "workshop-01-thread" },
];

async function fetchDiscordMessages(
  channelId: string,
  afterId?: string
): Promise<DiscordMessage[]> {
  const token = process.env.DISCORD_BOT_TOKEN;
  if (!token) throw new Error("DISCORD_BOT_TOKEN not set");
  const qs = afterId ? `?limit=100&after=${afterId}` : "?limit=100";
  const res = await fetch(
    `https://discord.com/api/v10/channels/${channelId}/messages${qs}`,
    { headers: { Authorization: `Bot ${token}` } }
  );
  if (!res.ok) throw new Error(`Discord API ${res.status}: ${await res.text()}`);
  const data = (await res.json()) as any[];
  return data.map((m: any) => ({
    id: m.id,
    content: m.content,
    author: m.author?.username ?? "unknown",
    ts: m.timestamp,
    channel_id: channelId,
  }));
}

export default async function handler(ctx: InvokeContext): Promise<InvokeResult> {
  const logs: string[] = [];
  const origLog = console.log;
  const origError = console.error;
  console.log = (...a: any[]) => {
    if (ctx.writer) ctx.writer(...a);
    else logs.push(a.map(String).join(" "));
  };
  console.error = (...a: any[]) => {
    if (ctx.writer) ctx.writer(...a);
    else logs.push(a.map(String).join(" "));
  };

  try {
    const argv = ctx.source === "cli" ? (ctx.args as string[]) : [];
    const sub = argv[0]?.toLowerCase() ?? "help";

    // ── status ──────────────────────────────────────────────────────────────
    if (sub === "status") {
      const id = await maw.identity();
      console.log(`oracle:    ${ORACLE_NAME}`);
      console.log(`node:      ${id.node}`);
      console.log(`chronicle: ${CHRONICLE_URL}`);
      const cursor = loadCursor(STATE_PATH);
      const channels = Object.keys(cursor);
      if (channels.length) {
        console.log(`cursors:`);
        for (const ch of channels) {
          console.log(`  ${ch}: ${cursor[ch].last_message_id}`);
        }
      } else {
        console.log(`cursors:   (none)`);
      }
      return { ok: true, output: logs.join("\n") || undefined };
    }

    // ── say ─────────────────────────────────────────────────────────────────
    if (sub === "say") {
      const text = argv.slice(1).join(" ");
      console.log(text || "(nothing to say)");
      return { ok: true, output: logs.join("\n") || undefined };
    }

    // ── chronicle ────────────────────────────────────────────────────────────
    if (sub === "chronicle") {
      const action = argv[1]?.toLowerCase() ?? "help";

      if (action === "sync") {
        const flags = parseFlags(argv.slice(2), {
          "--dry-run": Boolean,
          "--channel": String,
        });
        const dryRun = flags["--dry-run"] ?? false;
        const channelOverride = flags["--channel"];
        const targets = channelOverride
          ? [{ id: channelOverride, name: channelOverride }]
          : DEFAULT_CHANNELS;

        const cursor = loadCursor(STATE_PATH);
        let totalPosted = 0;
        const errors: string[] = [];

        for (const ch of targets) {
          const lastId = cursor[ch.id]?.last_message_id;
          console.log(
            `syncing ${ch.name} cursor=${lastId ?? "start"}${dryRun ? " [dry-run]" : ""}`
          );

          let messages: DiscordMessage[];
          try {
            messages = await fetchDiscordMessages(ch.id, lastId);
          } catch (e: any) {
            errors.push(`fetch ${ch.id}: ${e.message}`);
            console.error(`  error: ${e.message}`);
            continue;
          }

          if (messages.length === 0) {
            console.log(`  no new messages`);
            continue;
          }

          // Discord returns newest-first; sort oldest-first so cursor advances correctly
          messages.sort((a, b) => (BigInt(a.id) < BigInt(b.id) ? -1 : 1));

          const result = await syncMessages(
            messages, ORACLE_NAME, ch.id, lastId, STATE_PATH, fetch, dryRun
          );
          console.log(
            `  posted=${result.posted} newCursor=${result.newCursor ?? lastId ?? "none"}` +
              (result.error ? ` error=${result.error}` : "")
          );
          totalPosted += result.posted;
          if (result.error) errors.push(`${ch.id}: ${result.error}`);
        }

        const summary = `chronicle sync: ${totalPosted} posted${errors.length ? `, ${errors.length} error(s)` : ""}`;
        console.log(summary);
        return {
          ok: errors.length === 0,
          output: logs.join("\n"),
          error: errors.length ? errors.join("; ") : undefined,
        };
      }

      console.log("usage: maw vialumen chronicle sync [--dry-run] [--channel <id>]");
      return { ok: false, error: `unknown chronicle action: ${action}`, output: logs.join("\n") };
    }

    // ── help ─────────────────────────────────────────────────────────────────
    console.log("usage: maw vialumen <subcommand>");
    console.log("  status              show oracle identity + cursor state");
    console.log("  say <text>          echo text");
    console.log("  chronicle sync      sync Discord messages → Oracle Chronicle");
    console.log("    --dry-run           preview only, no writes");
    console.log("    --channel <id>      target specific channel");
    return { ok: true, output: logs.join("\n") || undefined };
  } catch (e: any) {
    return { ok: false, error: e.message, output: logs.join("\n") || undefined };
  } finally {
    console.log = origLog;
    console.error = origError;
  }
}
