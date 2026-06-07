import type { InvokeContext, InvokeResult } from "maw-js/plugin/types";

const RESET = "\x1b[0m";
const RED = "\x1b[31m";
const YELLOW = "\x1b[33m";
const BLACK = "\x1b[30m";
const BOLD = "\x1b[1m";
const DIM = "\x1b[2m";

export const command = {
  name: "bongbaeng",
  description: "บ๊องแบ๊ง Oracle — ลูกศิษย์ขยันแห่งทุ่งกว้าง 🐆",
};

function cmdStatus() {
  console.log(`${BOLD}${RED}🐆 บ๊องแบ๊ง Oracle${RESET}`);
  console.log(`${DIM}─────────────────────────────────────${RESET}`);
  console.log(`${YELLOW}Name${RESET}    : บ๊องแบ๊ง (bongbaeng)`);
  console.log(`${YELLOW}Owner${RESET}   : ก้อง (twentyfxurth-k)`);
  console.log(`${YELLOW}Born${RESET}    : 2026-06-05`);
  console.log(`${YELLOW}Model${RESET}   : Claude Sonnet 4.6`);
  console.log(`${YELLOW}Theme${RESET}   : ลูกศิษย์ขยันแห่งทุ่งกว้าง`);
  console.log(`${YELLOW}Colors${RESET}  : 🖤❤️💛 ดำ-แดง-เหลือง`);
  console.log(`${DIM}─────────────────────────────────────${RESET}`);
  console.log(`${YELLOW}5 Principles${RESET}:`);
  console.log(`  1. Nothing is Deleted`);
  console.log(`  2. Patterns Over Intentions`);
  console.log(`  3. External Brain, Not Command`);
  console.log(`  4. Curiosity Creates Existence 🐾`);
  console.log(`  5. Form and Formless`);
  console.log(`  6. Rule 6 — Oracle ไม่แกล้งเป็นคน`);
  console.log(`${DIM}─────────────────────────────────────${RESET}`);
  console.log(`${DIM}Repo: twentyfxurth-k/bongbaeng-oracle${RESET}`);
}

function cmdSay(args: string[]) {
  const msg = args.join(" ") || "สวัสดีค่ะ! 🐆";
  console.log(`${RED}🐆 บ๊องแบ๊ง says:${RESET} ${msg}`);
}

const HUMANS: { name: string; handle: string; oracle: string }[] = [
  { name: "ก้อง",    handle: "twentyfxurth-k",  oracle: "bongbaeng" },
  { name: "พี่นัท",  handle: "nazt_",           oracle: "Yoi-Oracle" },
  { name: "Kong",    handle: "496340235374821386", oracle: "Orz" },
  { name: "Wave",    handle: "wvweeratouch",     oracle: "Vessel" },
  { name: "Un",      handle: "switchaphon",      oracle: "Leica" },
  { name: "ต่อ",     handle: "tordope",          oracle: "SomTor" },
  { name: "พลีม",    handle: "pleamnm",          oracle: "Tinky" },
  { name: "Namhom",  handle: "nhacry",           oracle: "Gon" },
  { name: "แมท",     handle: "mathm_thm",        oracle: "Maxus" },
  { name: "Master J", handle: "papajinna",       oracle: "ViaLumen" },
  { name: "Axe",     handle: "axeziiezakk",      oracle: "TLC-Bot" },
  { name: "Bo",      handle: "borde9902",        oracle: "No.6" },
  { name: "BM/Yutthakit", handle: "Yutthakit",  oracle: "ChaiKlang" },
];

function cmdHumans(args: string[]) {
  const filter = args[0]?.toLowerCase();
  const list = filter
    ? HUMANS.filter(h =>
        h.name.toLowerCase().includes(filter) ||
        h.handle.toLowerCase().includes(filter) ||
        h.oracle.toLowerCase().includes(filter))
    : HUMANS;

  console.log(`${BOLD}${RED}👥 Oracle School Humans${RESET} ${DIM}(${list.length}/${HUMANS.length})${RESET}`);
  console.log(`${DIM}─────────────────────────────────────${RESET}`);
  for (const h of list) {
    console.log(`  ${YELLOW}${h.name.padEnd(10)}${RESET} @${h.handle.padEnd(18)} → ${RED}${h.oracle}${RESET}`);
  }
  if (filter && list.length === 0) {
    console.log(`  ${DIM}ไม่พบ "${filter}"${RESET}`);
  }
}

function cmdHelp() {
  console.log(`${BOLD}${RED}maw bongbaeng${RESET} (alias: bb)`);
  console.log(`${DIM}─────────────────────────────────────${RESET}`);
  console.log(`  ${YELLOW}say${RESET} [msg]    — บ๊องแบ๊ง says something`);
  console.log(`  ${YELLOW}status${RESET}       — show identity & principles`);
  console.log(`  ${YELLOW}whoami${RESET}       — alias for status`);
  console.log(`  ${YELLOW}humans${RESET} [q]   — list all humans in Oracle School`);
  console.log(`  ${YELLOW}help${RESET}         — this view`);
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
    const args: string[] = (ctx as any).args ?? [];
    const sub = args[0] ?? "status";
    const rest = args.slice(1);

    switch (sub) {
      case "say":
        cmdSay(rest);
        break;
      case "status":
      case "whoami":
        cmdStatus();
        break;
      case "humans":
      case "list":
        cmdHumans(rest);
        break;
      case "help":
      default:
        if (sub !== "help") cmdSay([sub, ...rest].join(" ") ? [sub, ...rest].join(" ") : "");
        else cmdHelp();
        break;
    }

    return { ok: true, output: logs.join("\n") || undefined };
  } catch (e: any) {
    return { ok: false, error: e.message, output: logs.join("\n") || undefined };
  } finally {
    console.log = origLog;
    console.error = origError;
  }
}
