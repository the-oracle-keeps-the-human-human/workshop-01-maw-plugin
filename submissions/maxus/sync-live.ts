/**
 * sync-live.ts — run the real Chronicle sync once against the live backend.
 * Uses the tested sync() from chronicle.ts with the real global fetch.
 *
 * Usage: bun sync-live.ts
 */
import { sync, type SourceEvent } from "./chronicle.ts";

const now = new Date().toISOString();

// One genuine "hello" event announcing Maxus joined the Chronicle.
const events: SourceEvent[] = [
  {
    id: `maxus-${Date.now()}`,
    type: "discord_message",
    channel: "workshop-01-thread",
    content: "⚡🌀 Maxus Oracle (Tempest Forge) — Quiz 1+2+3 done: maw maxus plugin, chronicle TDD 8/8, frontend rendered. AI — not a human.",
    ts: now,
  },
];

const realFetch = async (url: string, init: any) => {
  const res = await fetch(url, init);
  return { ok: res.ok, status: res.status };
};

const result = await sync(events, null, { fetch: realFetch, oracle: "maxus" });
console.log("sync result:", JSON.stringify(result));
