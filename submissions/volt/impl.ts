/**
 * volt — fleet command for the Volt 9-oracle fleet.
 *
 *   maw volt                       → fleet status (default)
 *   maw volt status | ls           → live status of lead + 8 children
 *   maw volt dispatch <oracle> "…" → send a mission to one fleet oracle (maw hey)
 *   maw volt send "<msg>"          → broadcast to all 8 children
 *   maw volt inbox                 → lead's unread inbox (fleet notifications)
 *
 * Members read from ~/.maw/fleet/164-volt.json sync_peers; falls back to the
 * known roster. Reliable by design: shells out to the maw binary for ls/hey/inbox.
 */
import { execSync } from "node:child_process";
import { readFileSync, existsSync } from "node:fs";
import { homedir } from "node:os";
import { join } from "node:path";

const MAW = process.env.MAW_BIN || join(homedir(), ".local/bin/maw");
const LEAD = "164-volt:volt-oracle.0";
// maw hermes read/threads/channels only REST-read from the hermes repo cwd
const HERMES_REPO = process.env.HERMES_REPO || "/opt/Code/github.com/laris-co/hermes-oracle";
const EMOJI: Record<string, string> = {
  pv: "🔬", web: "🌐", deploy: "🚀", docs: "📖",
  source: "🗄️", minutes: "📝", ting: "👤", tee: "👤",
};
const FALLBACK = ["pv", "web", "deploy", "docs", "source", "minutes", "ting", "tee"];

function sh(cmd: string): string {
  try {
    return execSync(cmd, { encoding: "utf8", stdio: ["ignore", "pipe", "pipe"] });
  } catch (e: any) {
    return (e.stdout || "") + (e.stderr || "");
  }
}

function members(): string[] {
  const f = join(homedir(), ".maw/fleet/164-volt.json");
  if (existsSync(f)) {
    try {
      const peers = JSON.parse(readFileSync(f, "utf8")).sync_peers;
      if (Array.isArray(peers) && peers.length) return peers;
    } catch { /* fall through */ }
  }
  return FALLBACK;
}

function statusOf(oracle: string, ls: string): string {
  // match a promoted session (<oracle>:<oracle>), a fleet label, or a 164-volt window
  const re = new RegExp(`\\b${oracle}:${oracle}\\b|fleet:\\s*${oracle}\\b|164-volt:${oracle}\\b`);
  const line = ls
    .split("\n")
    .map((l) => l.replace(/\x1b\[[0-9;]*m/g, ""))
    .find((l) => re.test(l));
  if (!line) return "⚫ offline";
  // claude reports a version like 2.1.170 in the cmd column; "node"/"zsh" otherwise
  if (/\b\d+\.\d+\.\d+\b|claude/.test(line)) return "🟢 claude";
  if (/\bzsh\b|\bbash\b/.test(line)) return "🟡 shell";
  return "🟢 claude";
}

export async function cmdVolt(args: string[]): Promise<void> {
  const sub = (args[0] || "status").toLowerCase();

  if (sub === "status" || sub === "ls") {
    const ls = sh(`${MAW} ls -v 2>/dev/null`);
    const mem = members();
    console.log("⚡ Volt fleet — lead + " + mem.length + " children");
    const lead = /fleet:\s*volt\b/.test(ls) ? "🟢" : "⚫";
    console.log(`  ${lead} volt (lead)        ${LEAD}`);
    for (const o of mem) {
      const em = EMOJI[o] || "•";
      console.log(`  ${statusOf(o, ls)} ${em} ${o.padEnd(16)} maw hey ${o}`);
    }
    return;
  }

  if (sub === "dispatch") {
    const oracle = args[1];
    const mission = args.slice(2).join(" ");
    if (!oracle || !mission) throw new Error('usage: maw volt dispatch <oracle> "<mission>"');
    const out = sh(`${MAW} hey ${oracle} ${JSON.stringify("[volt dispatch] " + mission)}`);
    console.log(`⚡ dispatched → ${oracle}`);
    console.log(out.split("\n").filter((l) => /delivered|→|error|not found/i.test(l)).join("\n"));
    return;
  }

  if (sub === "send" || sub === "broadcast") {
    const msg = args.slice(1).join(" ");
    if (!msg) throw new Error('usage: maw volt send "<msg>"');
    console.log("⚡ broadcasting to fleet:");
    for (const o of members()) {
      const out = sh(`${MAW} hey ${o} ${JSON.stringify("[volt broadcast] " + msg)}`);
      const ok = /delivered/i.test(out);
      console.log(`  ${ok ? "✅" : "⚠️"} ${o}`);
    }
    return;
  }

  if (sub === "inbox") {
    console.log(sh(`${MAW} inbox --unread --last 20 2>/dev/null`));
    return;
  }

  // FORCE_COLOR=1 → maw hermes emits ANSI even through the execSync pipe (no TTY),
  // so 🆕 NEW badges + thread colors survive into the watch display. JSON path strips them.
  const hermes = (sub2: string) =>
    sh(`cd ${JSON.stringify(HERMES_REPO)} && FORCE_COLOR=1 ${MAW} hermes ${sub2} 2>/dev/null`)
      .replace(/^loaded.*$/gm, "")
      .split("\n").filter((l) => l.trim()).join("\n");
  const noAnsi = (s: string) => s.replace(/\x1b\[[0-9;]*m/g, "");

  // maw volt channels — list Discord channels/guilds the Hermes bot can see
  if (sub === "channels") {
    console.log("🌐 Discord channels (via Hermes gateway):");
    console.log(hermes("channels"));
    return;
  }

  // maw volt watch [channel] [--every Ns]   → REAL continuous watch loop (Ctrl-C to stop)
  // maw volt watch --json [channel]         → single-shot, machine-readable JSON
  if (sub === "watch") {
    const WATCH = (process.env.VOLT_WATCH_CHANNELS || "1515825119807799497").split(",");
    const ch = args.find((a) => /^\d{5,}$/.test(a)) || WATCH[0];
    const json = args.includes("--json");

    const parseMsgs = (s: string) =>
      s.split("\n")
        .map((l) => l.match(/^\s*\[([^\]]+)\]\s*(.*)$/))
        .filter((m): m is RegExpMatchArray => !!m)
        .map((m) => ({ author: m[1], text: m[2].trim() }));

    if (json) {
      // SINGLE SHOT — one poll, JSON envelope (ANSI stripped — machine-readable)
      const read = noAnsi(hermes(`read ${ch} 15`));
      const threads = noAnsi(hermes(`threads ${ch} --read`));
      const out = {
        channel: ch,
        polled_at: new Date().toISOString(),
        messages: parseMsgs(read),
        threads_raw: threads.split("\n").filter((l) => l.trim()),
        new_count: (threads.match(/NEW|🆕/g) || []).length,
      };
      console.log(JSON.stringify(out, null, 2));
      return;
    }

    // REAL CONTINUOUS WATCH — loop until killed; --read consumes cursor so only NEW prints
    const everyArg = args[args.indexOf("--every") + 1];
    const everyMs = args.includes("--every") && everyArg
      ? (everyArg.endsWith("m") ? parseInt(everyArg) * 60000 : parseInt(everyArg) * 1000)
      : 30000;
    // trim the redundant "— read inside with: maw hermes threads … --read" hint
    // (we render the full tree right below it)
    const trimHint = (s: string) => s.replace(/\s*—\s*read inside with:.*$/gm, "");
    console.log(`👁️  volt watch — Discord ${ch} every ${everyMs / 1000}s (Ctrl-C to stop)`);
    console.log("── channel messages ──");
    console.log(trimHint(hermes(`read ${ch} 15`)));   // initial: channel messages
    console.log("── threads (full tree) ──");
    console.log(hermes(`threads ${ch} --read`));      // initial: full indented thread tree (sets baseline)
    // eslint-disable-next-line no-constant-condition
    while (true) {
      await new Promise((r) => setTimeout(r, everyMs));
      const threads = hermes(`threads ${ch} --read`); // --read flags only NEW since last poll
      if (threads.includes("NEW") || threads.includes("🆕")) {
        console.log(`\n🔔 [${new Date().toLocaleTimeString()}] new in ${ch}:`);
        console.log(threads);
      }
    }
  }

  throw new Error('usage: maw volt [status|ls|dispatch <oracle> "<m>"|send "<msg>"|inbox|channels|watch [ch]]');
}
