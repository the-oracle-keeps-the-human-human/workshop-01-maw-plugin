import { type InvokeContext, type InvokeResult } from "@maw-js/sdk/plugin";
import { parseNameStatus, summarize, firstSeen } from "./gittrack";
import { execFileSync } from "child_process";

export const command = {
  name: "gittrack",
  description: "🔍 track git file lifecycle — สร้าง/ลบ/เปลี่ยน. subcommands: added, deleted, modified, summary",
};

function gitLog(): string {
  // newest→oldest; @date marker ก่อนแต่ละ commit's name-status
  return execFileSync("git", ["log", "--name-status", "--pretty=format:@%ad", "--date=short"], {
    encoding: "utf-8", maxBuffer: 32 * 1024 * 1024,
  });
}

export default async function handler(ctx: InvokeContext): Promise<InvokeResult> {
  const logs: string[] = [];
  const origLog = console.log;
  console.log = (...a: any[]) => { ctx.writer ? ctx.writer(...a) : logs.push(a.map(String).join(" ")); };
  const out = (ok = true, error?: string) => ({ ok, output: logs.join("\n") || undefined, error });

  try {
    const argv = ctx.source === "cli" ? (ctx.args as string[]) : [];
    const sub = argv[0]?.toLowerCase() ?? "summary";

    let events;
    try { events = parseNameStatus(gitLog()); }
    catch (e: any) { return out(false, `git log failed (อยู่ใน git repo ไหม?): ${e.message}`); }

    const s = summarize(events);
    const seen = firstSeen(events);

    if (sub === "added") {
      console.log(`📄 ไฟล์ที่ถูกสร้าง (${s.counts.added}):`);
      for (const f of s.added) console.log(`  + ${f}${seen.get(f) ? `  (สร้าง ${seen.get(f)})` : ""}`);
      return out();
    }
    if (sub === "deleted") {
      console.log(`🗑️  ไฟล์ที่ถูกลบ (${s.counts.deleted}):`);
      for (const f of s.deleted) console.log(`  - ${f}`);
      return out();
    }
    if (sub === "modified") {
      console.log(`✏️  ไฟล์ที่ถูกแก้ไข (${s.counts.modified}):`);
      for (const f of s.modified) console.log(`  ~ ${f}`);
      return out();
    }
    // summary (default)
    console.log(`🔍 git file lifecycle — สรุป`);
    console.log(`  📄 สร้าง:  ${s.counts.added} ไฟล์ (ที่ยังอยู่)`);
    console.log(`  🗑️  ลบ:     ${s.counts.deleted} ไฟล์`);
    console.log(`  ✏️  แก้ไข:  ${s.counts.modified} ไฟล์`);
    console.log(`  🔀 rename: ${s.counts.renamed} ไฟล์`);
    console.log(`  รวม events ที่ track: ${events.length}`);
    console.log(``);
    console.log(`ดูรายละเอียด: maw gittrack <added|deleted|modified>`);
    return out();
  } catch (e: any) {
    return out(false, e.message);
  } finally {
    console.log = origLog;
  }
}
