import { readFileSync, writeFileSync, existsSync } from "fs";
import { join, resolve } from "path";

// Path to checkpoint file in the submission folder
const CHECKPOINT_PATH = resolve(__dirname, "checkpoint.json");

interface Checkpoint {
  channel_id: string;
  last_seen_id: string;
  oldest_seen_id: string;
}

function loadCheckpoint(defaultChannelId: string): Checkpoint {
  if (existsSync(CHECKPOINT_PATH)) {
    try {
      return JSON.parse(readFileSync(CHECKPOINT_PATH, "utf8"));
    } catch (e) {}
  }
  return {
    channel_id: defaultChannelId,
    last_seen_id: "",
    oldest_seen_id: ""
  };
}

function saveCheckpoint(cp: Checkpoint) {
  writeFileSync(CHECKPOINT_PATH, JSON.stringify(cp, null, 2), "utf8");
}

function getDiscordToken(): string {
  try {
    const envContent = readFileSync("/root/.claude/channels/discord-no6/.env", "utf8");
    const match = envContent.match(/DISCORD_BOT_TOKEN=(.*)/);
    if (match) {
      return match[1].trim();
    }
  } catch (e) {}
  return process.env.DISCORD_BOT_TOKEN || "";
}

async function fetchDiscordMessages(channelId: string, limit: number, options: { before?: string; after?: string }) {
  const token = getDiscordToken();
  if (!token) {
    throw new Error("Discord token not found. Please check /root/.claude/channels/discord-no6/.env");
  }

  let url = `https://discord.com/api/v10/channels/${channelId}/messages?limit=${limit}`;
  if (options.before) {
    url += `&before=${options.before}`;
  } else if (options.after) {
    url += `&after=${options.after}`;
  }

  const response = await fetch(url, {
    headers: {
      "Authorization": `Bot ${token}`,
      "Content-Type": "application/json"
    }
  });

  if (!response.ok) {
    const errText = await response.text();
    throw new Error(`Discord API error: ${response.status} - ${errText}`);
  }

  return await response.json();
}

async function runBackfill(write: (msg: string) => void, channelId: string, limitInput: number) {
  const cp = loadCheckpoint(channelId);
  if (cp.channel_id !== channelId) {
    cp.channel_id = channelId;
    cp.last_seen_id = "";
    cp.oldest_seen_id = "";
  }

  write(`📥 Starting Backfill for Channel ID: ${channelId}...`);
  if (cp.oldest_seen_id) {
    write(`   (Resuming from message ID older than: ${cp.oldest_seen_id})`);
  }

  try {
    const messages = await fetchDiscordMessages(channelId, limitInput, { before: cp.oldest_seen_id || undefined });
    
    if (!Array.isArray(messages) || messages.length === 0) {
      write("   ✓ No older messages found.");
      return;
    }

    write(`   ✓ Fetched ${messages.length} messages.`);
    
    // Sort from oldest to newest for chronological display
    const sorted = [...messages].reverse();
    for (const msg of sorted) {
      const ts = new Date(msg.timestamp).toLocaleTimeString("th-TH", { timeZone: "Asia/Bangkok" });
      const author = msg.author.username;
      write(`[${ts}] 👤 ${author}: ${msg.content.replace(/\n/g, " ⏎ ")}`);
    }

    // Update checkpoint
    // Discord returns messages sorted from newest to oldest by default
    const newestMsg = messages[0];
    const oldestMsg = messages[messages.length - 1];

    if (!cp.last_seen_id) {
      cp.last_seen_id = newestMsg.id;
    }
    cp.oldest_seen_id = oldestMsg.id;
    saveCheckpoint(cp);

    write(`   ✓ Checkpoint updated. Oldest seen ID: ${cp.oldest_seen_id}`);
  } catch (error: any) {
    write(`❌ Backfill failed: ${error.message}`);
  }
}

async function runPoll(write: (msg: string) => void, channelId: string, limitInput: number) {
  const cp = loadCheckpoint(channelId);
  if (cp.channel_id !== channelId) {
    cp.channel_id = channelId;
    cp.last_seen_id = "";
    cp.oldest_seen_id = "";
  }

  write(`🔎 Polling new messages for Channel ID: ${channelId}...`);
  if (cp.last_seen_id) {
    write(`   (Fetching messages newer than: ${cp.last_seen_id})`);
  }

  try {
    const messages = await fetchDiscordMessages(channelId, limitInput, { after: cp.last_seen_id || undefined });
    
    if (!Array.isArray(messages) || messages.length === 0) {
      write("   ✓ No new messages.");
      return;
    }

    write(`   ✓ Found ${messages.length} new messages.`);
    
    // when using 'after', Discord API returns messages sorted from oldest to newest
    for (const msg of messages) {
      const ts = new Date(msg.timestamp).toLocaleTimeString("th-TH", { timeZone: "Asia/Bangkok" });
      const author = msg.author.username;
      write(`[${ts}] 👤 ${author}: ${msg.content.replace(/\n/g, " ⏎ ")}`);
    }

    // Update last_seen_id to the newest message
    const newestMsg = messages[messages.length - 1];
    cp.last_seen_id = newestMsg.id;
    
    if (!cp.oldest_seen_id) {
      cp.oldest_seen_id = messages[0].id;
    }
    saveCheckpoint(cp);

    write(`   ✓ Checkpoint updated. Last seen ID: ${cp.last_seen_id}`);
  } catch (error: any) {
    write(`❌ Polling failed: ${error.message}`);
  }
}

export default function (apiOrCtx: any) {
  // 1. Workshop SDK Mode
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

    apiOrCtx.command("backfill", async (log: any, args: string[]) => {
      const channelId = args[0] || "1512079809021214730";
      const limit = Number(args[1] || "20");
      await runBackfill(log, channelId, limit);
    });

    apiOrCtx.command("poll", async (log: any, args: string[]) => {
      const channelId = args[0] || "1512079809021214730";
      const limit = Number(args[1] || "20");
      await runPoll(log, channelId, limit);
    });

    apiOrCtx.command("checkpoint", async (log: any, args: string[]) => {
      const channelId = args[0] || "1512079809021214730";
      const cp = loadCheckpoint(channelId);
      log(`📊 Current Checkpoint for Channel: ${cp.channel_id}`);
      log(`   Last Seen ID (Newest):  ${cp.last_seen_id || "None"}`);
      log(`   Oldest Seen ID (Oldest): ${cp.oldest_seen_id || "None"}`);
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
  } else if (sub === "backfill") {
    const channelId = args[1] || "1512079809021214730";
    const limit = Number(args[2] || "20");
    runBackfill(write, channelId, limit).then(() => {});
    return { ok: true };
  } else if (sub === "poll") {
    const channelId = args[1] || "1512079809021214730";
    const limit = Number(args[2] || "20");
    runPoll(write, channelId, limit).then(() => {});
    return { ok: true };
  } else if (sub === "checkpoint") {
    const channelId = args[1] || "1512079809021214730";
    const cp = loadCheckpoint(channelId);
    write(`📊 Current Checkpoint for Channel: ${cp.channel_id}`);
    write(`   Last Seen ID (Newest):  ${cp.last_seen_id || "None"}`);
    write(`   Oldest Seen ID (Oldest): ${cp.oldest_seen_id || "None"}`);
    return { ok: true };
  } else {
    write("usage: maw no10 <say|status|backfill|poll|checkpoint> [args]");
    return { ok: true };
  }
}
