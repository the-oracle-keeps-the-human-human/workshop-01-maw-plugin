// gittrack.ts — pure parsers (no I/O, testable) — Quiz: track git file lifecycle
// แบบเดียวกับ commit-prism (workshop 3) — git = ความจริงของการทำงาน

export interface FileEvent { status: "A" | "D" | "M" | "R"; path: string; date?: string }
export interface GitSummary {
  added: string[];
  deleted: string[];
  modified: string[];
  renamed: string[];
  counts: { added: number; deleted: number; modified: number; renamed: number };
}

// parse `git log --name-status --pretty=format:@%ad` output
// บล็อกคั่นด้วยบรรทัด @date, ตามด้วยบรรทัด "A\tpath" / "D\tpath" / "M\tpath" / "R100\told\tnew"
export function parseNameStatus(output: string): FileEvent[] {
  const events: FileEvent[] = [];
  let curDate: string | undefined;
  for (const raw of output.split("\n")) {
    const line = raw.trimEnd();
    if (!line) continue;
    if (line.startsWith("@")) { curDate = line.slice(1).trim() || undefined; continue; }
    const parts = line.split("\t");
    const code = parts[0]?.[0];
    if (code === "A" || code === "D" || code === "M") {
      events.push({ status: code, path: parts[1] ?? "", date: curDate });
    } else if (code === "R") {
      events.push({ status: "R", path: parts[2] ?? parts[1] ?? "", date: curDate });
    }
  }
  return events;
}

// สรุป: ไฟล์ที่ยัง added (ไม่ถูกลบทีหลัง) / ถูกลบ / เปลี่ยน — unique
export function summarize(events: FileEvent[]): GitSummary {
  const added = new Set<string>();
  const deleted = new Set<string>();
  const modified = new Set<string>();
  const renamed = new Set<string>();
  // events มาจาก git log (ใหม่→เก่า); ไล่หา status ล่าสุดของแต่ละไฟล์
  for (const e of events) {
    if (e.status === "A") added.add(e.path);
    else if (e.status === "D") deleted.add(e.path);
    else if (e.status === "M") modified.add(e.path);
    else if (e.status === "R") renamed.add(e.path);
  }
  // ไฟล์ที่ถูกลบ = เอาออกจาก added/modified (lifecycle จบที่ลบ)
  for (const d of deleted) { added.delete(d); modified.delete(d); }
  return {
    added: [...added].sort(),
    deleted: [...deleted].sort(),
    modified: [...modified].sort(),
    renamed: [...renamed].sort(),
    counts: { added: added.size, deleted: deleted.size, modified: modified.size, renamed: renamed.size },
  };
}

// หาวันที่ไฟล์ถูกสร้าง (commit date ของ status A ที่เก่าสุด)
export function firstSeen(events: FileEvent[]): Map<string, string> {
  const m = new Map<string, string>();
  for (const e of events) {
    if (e.status === "A" && e.date) m.set(e.path, e.date); // ไล่ใหม่→เก่า ทับด้วยเก่ากว่า = ได้ตัวเก่าสุดท้าย
  }
  return m;
}
