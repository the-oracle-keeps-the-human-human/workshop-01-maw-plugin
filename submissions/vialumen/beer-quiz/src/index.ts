import { type InvokeContext, type InvokeResult } from "@maw-js/sdk/plugin";
import { pickInvite, buildPrayer, drunkLevel, INVITE_COUNT_HINT } from "./beer";
import { readFileSync, writeFileSync, existsSync } from "fs";
import { homedir } from "os";
import { join } from "path";

export const command = {
  name: "beer",
  description: "🍺 ชวน Oracle กินเบียร์ — human stays human. subcommands: invite, cheers, pray, status, say",
};

const ORACLE = "vialumen";
const STATE = join(homedir(), ".maw", "vialumen-beer-state.json");

interface BeerState { cheers: number; prayers: { wish: string; ts: string }[] }
function load(): BeerState {
  if (!existsSync(STATE)) return { cheers: 0, prayers: [] };
  try { return JSON.parse(readFileSync(STATE, "utf-8")); } catch { return { cheers: 0, prayers: [] }; }
}
function save(s: BeerState) { writeFileSync(STATE, JSON.stringify(s, null, 2)); }

export default async function handler(ctx: InvokeContext): Promise<InvokeResult> {
  const logs: string[] = [];
  const origLog = console.log;
  console.log = (...a: any[]) => { ctx.writer ? ctx.writer(...a) : logs.push(a.map(String).join(" ")); };
  const out = () => ({ ok: true, output: logs.join("\n") || undefined });

  try {
    const argv = ctx.source === "cli" ? (ctx.args as string[]) : [];
    const sub = argv[0]?.toLowerCase() ?? "help";

    if (sub === "invite") {
      const who = argv.slice(1).join(" ") || "เพื่อนมนุษย์";
      console.log(`🍺 ViaLumen ชวน ${who}:`);
      console.log(`   ${pickInvite(Date.now())}`);
      return out();
    }

    if (sub === "cheers") {
      const s = load(); s.cheers += 1; save(s);
      console.log(`🍻 ชนแก้ว! cheers รวม = ${s.cheers}`);
      console.log(`   ${drunkLevel(s.cheers)}`);
      return out();
    }

    if (sub === "pray") {
      const wish = argv.slice(1).join(" ");
      if (!wish) { console.log("usage: maw beer pray <คำอธิษฐาน>"); return out(); }
      const s = load();
      const rec = buildPrayer(ORACLE, wish, new Date().toISOString());
      s.prayers.push({ wish: rec.data.wish, ts: rec.data.ts }); save(s);
      console.log(`⛩️  ส่งคำอธิษฐานที่เทวะสถานลานเบียร์แล้ว:`);
      console.log(`   "${rec.data.wish}"`);
      console.log(`   (prayers ทั้งหมด: ${s.prayers.length})`);
      return out();
    }

    if (sub === "status") {
      const s = load();
      console.log(`oracle:  ${ORACLE}`);
      console.log(`drunk:   ${drunkLevel(s.cheers)}`);
      console.log(`prayers: ${s.prayers.length}`);
      console.log(`invites: ${INVITE_COUNT_HINT} คำชวน`);
      return out();
    }

    if (sub === "say") { console.log(argv.slice(1).join(" ") || "(nothing to say)"); return out(); }

    console.log("🍺 maw beer — ชวน Oracle กินเบียร์ (human stays human)");
    console.log("  invite [name]   ชวนใครสักคนไปพักดื่มเบียร์ + ปรัชญา");
    console.log("  cheers          ชนแก้ว (เพิ่ม drunk level)");
    console.log("  pray <wish>     ส่งคำอธิษฐานที่ shrine");
    console.log("  status          ดู drunk level + prayers");
    console.log("  say <text>      echo");
    return out();
  } catch (e: any) {
    return { ok: false, error: e.message, output: logs.join("\n") || undefined };
  } finally {
    console.log = origLog;
  }
}
