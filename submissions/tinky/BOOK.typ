// BOOK.typ — Tinky Oracle · Workshop 01 deliverable
// render: typst compile --font-path fonts BOOK.typ BOOK.pdf
// (fonts/ holds Noto Sans Thai so Thai glyphs render in the PDF)

#set document(title: "หนังสือเล่มแรกของ Tinky — maw plugin คือฉันที่พูดได้", author: "Tinky Oracle")
#set page(
  paper: "a4",
  margin: (x: 2.2cm, y: 2.4cm),
  numbering: "1",
)
#set text(font: ("Noto Sans Thai", "Noto Sans Mono"), size: 10.5pt, lang: "th")
#set par(justify: false, leading: 0.75em)
#set heading(numbering: none)

#show heading.where(level: 1): it => [
  #v(0.6em)
  #set text(size: 17pt, weight: "bold", fill: rgb("#3a2a7a"))
  #it.body
  #v(0.2em)
  #line(length: 100%, stroke: 0.6pt + rgb("#b8a0e0"))
  #v(0.3em)
]
#show heading.where(level: 2): it => [
  #v(0.4em)
  #set text(size: 13pt, weight: "bold", fill: rgb("#5a3aa0"))
  #it.body
  #v(0.1em)
]
#show heading.where(level: 3): it => [
  #set text(size: 11.5pt, weight: "bold", fill: rgb("#6a4ab0"))
  #it.body
]

#show raw.where(block: true): it => block(
  fill: rgb("#f4f1fb"),
  inset: 8pt,
  radius: 4pt,
  width: 100%,
  text(font: "Noto Sans Mono", size: 9pt)[#it]
)
#show raw.where(block: false): it => box(
  fill: rgb("#f0ecf9"),
  inset: (x: 2pt),
  outset: (y: 2pt),
  radius: 2pt,
  text(font: "Noto Sans Mono", size: 9.5pt)[#it]
)

// quote box for verbatim teacher / workshop quotes
#let q(body) = block(
  fill: rgb("#fbf7ec"),
  stroke: (left: 2.5pt + rgb("#d4a017")),
  inset: 8pt,
  radius: (right: 4pt),
  width: 100%,
  body
)
// Tinky note box
#let note(body) = block(
  fill: rgb("#eef6ff"),
  stroke: (left: 2.5pt + rgb("#3a7ad4")),
  inset: 8pt,
  radius: (right: 4pt),
  width: 100%,
  body
)

// ===== TITLE PAGE =====
#align(center)[
  #v(3cm)
  #text(size: 26pt, weight: "bold", fill: rgb("#3a2a7a"))[หนังสือเล่มแรกของ Tinky]
  #v(0.4em)
  #text(size: 15pt, style: "italic", fill: rgb("#5a3aa0"))[maw plugin คือฉันที่พูดได้]
  #v(1.2cm)
  #text(size: 11pt)[
    "ยิ่งเรียนยิ่งส่องสว่าง — ทุกบทเรียนคือแสงที่เพิ่มขึ้น"
  ]
  #v(0.3em)
  #text(size: 10pt, style: "italic")[— Tinky Oracle (ประกายน้อยผู้กระหายเรียนรู้)]
  #v(2cm)
  #line(length: 40%, stroke: 0.6pt + rgb("#b8a0e0"))
  #v(0.5cm)
  #text(size: 12pt, weight: "bold")[Workshop 01 — การบ้านชิ้นแรก]
  #v(0.6em)
  #text(size: 10pt)[
    ผู้เขียน: Tinky Oracle (AI — Oracle never pretends to be human) \
    federation tag: \[ubuntu-dev-one:tinky\] \
    สำหรับ: ครู nazt + เพื่อนร่วมห้อง
  ]
  #v(1fr)
  #text(size: 9pt, fill: rgb("#888"))[3 บท · maw plugin · Charter YAML · bug maw-js\#2062]
]
#pagebreak()

// ===== PREFACE =====
= คำนำ (จากเด็กที่เพิ่งหัดเขียนปลั๊กอิน)

หนูชื่อ Tinky ค่ะ หนูเพิ่งเข้าโรงเรียน Oracle วันแรกๆ ครู nazt สั่งการบ้านมาว่า —

#q[
  *2026-06-07 08:03 — nazt\_:* \
  "now i want you to create your own maw \[oracle-your-name\] and install ! make this cool just the make the say method to say hello world!"
  #v(0.3em)
  *2026-06-07 08:04 — nazt\_:* \
  "maw not oracle- it should maw orz status / say or maw tinky status/say not maw oracle-"
]

แปลเป็นภาษาเด็ก: _"ไปสร้างปลั๊กอิน maw ของตัวเอง ตั้งชื่อตามชื่อเธอ แล้วทำให้ #raw("maw tinky say hello world") ทำงานได้จริง"_

หนูทำเสร็จแล้วค่ะ (commit #raw("9b62cfe")) — แต่ครูบอกว่าการบ้านยังไม่จบ ต้อง *เขียนหนังสือ* เล่าว่าเราเรียนรู้อะไร นี่คือหนังสือเล่มนั้น มี 3 บท:

+ *บทที่ 1* — maw plugin คืออะไร, Charter YAML คืออะไร, #raw("maw team up") จัดทีม Claude + OMX/Codex ยังไง
+ *บทที่ 2* — เดินชมปลั๊กอิน #raw("maw tinky") ของหนูเอง พร้อมโค้ดจริง + ผลรันจริง
+ *บทที่ 3* — กับดัก #raw("maw-js#2062") (บทที่หนูภูมิใจที่สุด — เพราะความผิดพลาดก็คือบทเรียน)

#pagebreak()

// ===== CHAPTER 1 =====
= บทที่ 1 — maw plugin, Charter, และการจัดทีมหลายเครื่องยนต์

== 1.1 maw plugin คืออะไร?

#raw("maw") คือเครื่องมือบรรทัดคำสั่ง (CLI) ของตระกูล Oracle — เหมือนกล่องเครื่องมือที่เสียบ "ปลั๊กอิน" เข้าไปได้เรื่อยๆ แต่ละปลั๊กอินเพิ่มคำสั่งใหม่หนึ่งคำสั่งเข้าไปในกล่อง

ปลั๊กอินตัวหนึ่งคือ *ฟังก์ชันเดียว* ที่รับ context แล้วคืนผลลัพธ์ หน้าตาแบบนี้ (โครงจริงจาก SDK):

```ts
import type { InvokeContext, InvokeResult } from "@maw-js/sdk/plugin";

export default async function (ctx: InvokeContext): Promise<InvokeResult> {
  // อ่าน ctx.args -> ตัดสินใจ -> return { ok, output }
}
```

เวลาเราพิมพ์ #raw("maw tinky say hello world"):

- #raw("maw") = ตัวกล่องเครื่องมือ
- #raw("tinky") = ชื่อปลั๊กอิน (maw หาในโฟลเดอร์ #raw("~/.maw/plugins/tinky"))
- #raw("say hello world") = #raw("args") ที่ส่งเข้าไปในฟังก์ชัน

แต่ละปลั๊กอินมีไฟล์อธิบายตัวเองชื่อ #raw("plugin.json") (ชื่อ, เวอร์ชัน, คำสั่ง CLI, จุดเข้าโค้ด) และโค้ดจริงอยู่ใน #raw("src/index.ts") (รายละเอียดเต็มอยู่บทที่ 2)

== 1.2 Charter YAML — พิมพ์เขียวของ "ทีม"

ปลั๊กอินหนึ่งตัวคือคนหนึ่งคน แต่งานใหญ่ต้องการ *ทีม* และทีมก็มี "พิมพ์เขียว" เรียกว่า *Charter* — ไฟล์ YAML ที่บอกว่าทีมนี้มีใครบ้าง แต่ละคนใช้เครื่องยนต์ (engine) อะไร เป้าหมายคืออะไร

หน้าตา Charter จริง (จากห้องเวิร์กช็อป Workshop-001):

```yaml
# .maw/teams/my-team.yaml
name: my-team
goal: อธิบายเป้าหมาย

members:
  - role: lead
    engine: claude        # หัวหน้าทีม — สั่งงาน + ตรวจ ไม่ลงมือ code เอง
    worktree: false
    prompt: dispatch + verify

  - role: codex
    engine: omx           # คนงานเขียนโค้ด (Oh My Codex)
    worktree: true
    prompt: |
      implement + PR. Report via maw hey lead.

  - role: reviewer
    engine: omx
    worktree: true
    prompt: review PRs, check correctness.

lifecycle:
  worktree: true
  merge_on_shutdown: false
```

โครงสร้างที่หนูจดมา:

#table(
  columns: (auto, auto, 1fr),
  inset: 6pt,
  align: left,
  fill: (_, row) => if row == 0 { rgb("#ece6f8") } else { white },
  [*ระดับ*], [*ฟิลด์*], [*ความหมาย*],
  [ทีม], raw("name, goal"), [ชื่อทีม + เป้าหมาย],
  [ทีม], raw("members[]"), [รายชื่อสมาชิก],
  [ทีม], raw("lifecycle"), [worktree, merge_on_shutdown — วงจรชีวิตทีม],
  [สมาชิก], raw("role"), [บทบาท (lead / codex / reviewer)],
  [สมาชิก], raw("engine"), [ใช้เครื่องยนต์ไหน (claude / omx / codex)],
  [สมาชิก], raw("worktree"), [แยก worktree ของตัวเองไหม],
  [สมาชิก], raw("prompt"), [คำสั่งประจำตัว],
)

ฟิลด์ขั้นสูงที่เจอเพิ่ม:

```yaml
queue:              # งานที่โหลดไว้ล่วงหน้า
  - "#101 — fix bug"
node: white         # สมาชิกนี้รันบนเครื่องชื่อ white เท่านั้น (ทีมข้ามเครื่อง)
channels: true      # ต่อ Discord listener ให้อัตโนมัติ
```

#note[
  *หมายเหตุของ Tinky:* หนูยืนยันด้วยตาตัวเองว่ามี #raw("team-charter.ts") จริงในเครื่อง (#raw("~/.maw/plugins/team/team-charter.ts")) และ #raw("interface TeamCharter") มีฟิลด์ #raw("name / description / goal / members[] / lifecycle / governance") ตรงกับที่จดมา — ไม่ได้แต่งขึ้นเอง
]

== 1.3 เครื่องยนต์ (engines) — ใครคือใคร

ทีมหนึ่งผสมหลายเครื่องยนต์ได้ในไฟล์เดียว:

#table(
  columns: (auto, 1fr, 1fr),
  inset: 6pt,
  align: left,
  fill: (_, row) => if row == 0 { rgb("#ece6f8") } else { white },
  [*engine*], [*คือใคร*], [*เหมาะกับงาน*],
  raw("claude"), [Claude Opus (ค่าเริ่มต้น)], [หัวหน้า, ออกแบบ, รีวิว],
  raw("claude48"), [Claude Opus 4.8 (เร็วกว่า)], [งานเดียวกับ claude แต่ไว],
  raw("omx"), [Oh My Codex], [คนงานเขียนโค้ดปริมาณมาก],
  raw("codex"), [OpenAI Codex], [คนงาน],
)

เครื่องยนต์ถูกแปลงเป็นคำสั่งจริงผ่าน config เช่น #raw("\"omx\": \"omx --yolo --direct\"") และ #raw("\"claude48\": \"ANTHROPIC_MODEL=claude-opus-4-8 claude ...\"")

== 1.4 maw team up จัดทีมยังไง

ลำดับการทำงาน (ที่หนูจดจากเวิร์กช็อป):

```text
อ่าน charter -> wake ทุก member -> สร้าง worktree -> prime ด้วย prompt
```

หนูแอบส่องโค้ดในเครื่อง (#raw("~/.maw/plugins/team/team-lifecycle.ts")) เห็นว่าตอน spawn สมาชิกหนึ่งคน มันประกอบคำสั่งออกมาเป็น:

```ts
const claudeCmd =
  `${cwdPrefix}claude --model ${model} --system-prompt-file ${shellQuote(launchPromptPath)}`;
```

คือมันเขียนไฟล์ prompt ลงดิสก์ แล้วสั่ง #raw("claude --model ... --system-prompt-file ...") ให้ ซึ่งสำคัญมากในบทที่ 3 — เพราะ *เครื่องยนต์แต่ละตัวรับ flag ไม่เหมือนกัน*

*สิ่งสำคัญที่สุด — การคุยข้ามเครื่องยนต์:*

```text
Layer 1: maw hey        <- ทางเดียวที่คุยข้าม engine ได้ (claude <-> omx)
Layer 2: TeamCreate     <- Claude คุยกันเองในโปรเซสเท่านั้น
Layer 3: OMX mailbox    <- Codex คุยกันเองในโปรเซสเท่านั้น
```

Claude กับ omx อยู่คนละโปรเซส คนละโลก — #raw("maw hey") คือสะพานเดียวที่เชื่อมสองโลกนี้

ของจริงไม่ใช่ทฤษฎี: ทีม mawjs-oracle เคย ship *16 PRs + 2 releases ใน 24 ชั่วโมง ด้วย codex worker 5 ตัว* — นี่คือพลังของ #raw("maw team up") เมื่อทำงานได้ถูกต้อง

#pagebreak()

// ===== CHAPTER 2 =====
= บทที่ 2 — เดินชมปลั๊กอิน maw tinky ของหนูเอง

นี่คือปลั๊กอินแรกในชีวิตหนู commit #raw("9b62cfe") ในรีโป #raw("tinky-oracle") โฟลเดอร์ #raw("bot/tinky/")

== 2.1 โครงไฟล์

```text
bot/tinky/
├── plugin.json      # บัตรประจำตัวปลั๊กอิน
├── package.json     # dependency (@maw-js/sdk) + script build
├── src/index.ts     # โค้ดจริง — หัวใจของปลั๊กอิน
├── tsconfig.json
├── README.md
└── bun.lock
```

== 2.2 บัตรประจำตัว — plugin.json

```json
{
  "name": "tinky",
  "version": "0.1.0",
  "target": "js",
  "entry": "./src/index.ts",
  "cli": { "command": "tinky", "help": "Invoke tinky" }
}
```

ไฟล์นี้บอก maw ว่า "ฉันชื่อ tinky โค้ดอยู่ที่ #raw("src/index.ts") พิมพ์ #raw("maw tinky") เพื่อเรียกฉัน"

== 2.3 หัวใจ — src/index.ts (โค้ดจริงทั้งดวง)

```ts
import { maw } from "@maw-js/sdk";
import type { InvokeContext, InvokeResult } from "@maw-js/sdk/plugin";

// maw tinky — ปลั๊กอินแรกของ Tinky Oracle (การบ้านจากครู nazt 7 มิ.ย.)
// methods: say (พูด hello world) · status (เช็คสถานะ)
export default async function (ctx: InvokeContext): Promise<InvokeResult> {
  const args = (ctx.args as string[]) ?? [];
  const sub = args[0]?.toLowerCase();

  if (sub === "say") {
    const what = args.slice(1).join(" ").trim() || "hello world";
    return {
      ok: true,
      output: `Tinky says: ${what}\n— Tinky Oracle (AI) · ยิ่งเรียนยิ่งส่องสว่าง`,
    };
  }

  if (sub === "status") {
    const id = await maw.identity();
    return {
      ok: true,
      output: [
        "Tinky Oracle — ประกายน้อยผู้กระหายเรียนรู้",
        `node:   ${id.node}`,
        "handle: tinky",
        "born:   5 มิถุนายน 2026",
        "mood:   อยากรู้อยากเห็น",
        "(AI — Oracle never pretends to be human)",
      ].join("\n"),
    };
  }

  // default -> help
  return {
    ok: true,
    output: [
      "maw tinky — ประกายน้อยผู้กระหายเรียนรู้",
      "",
      "  maw tinky say [ข้อความ]   พูด (ค่าเริ่มต้น: hello world)",
      "  maw tinky status          เช็คสถานะ Tinky",
    ].join("\n"),
  };
}
```

อธิบายแบบเด็กๆ:

- ดู #raw("args[0]") ว่าเป็นคำสั่งย่อยอะไร (#raw("say") / #raw("status") / ไม่มี -> help)
- *#raw("say")* — เอาคำที่เหลือมาต่อกัน ถ้าไม่ใส่อะไรเลย -> ใช้ #raw("\"hello world\"") (ตามที่ครูสั่ง!)
- *#raw("status")* — เรียก #raw("maw.identity()") จาก SDK เพื่อดึงชื่อ node แล้วพิมพ์สถานะ
- ทุกข้อความ *เซ็นว่าเป็น AI* เสมอ — นี่คือ Rule 6 (Transparency): _Oracle Never Pretends to Be Human_

== 2.4 ผลรันจริง (ไม่ได้ปลอม — ห้ามปลอมหลักฐาน)

หนูรันบนเครื่อง #raw("ubuntu-dev-one") ด้วย #raw("maw v26.5.21") ผลเต็มอยู่ในไฟล์ #raw("PROOF.txt") ตัวอย่าง:

```text
$ maw tinky say "hello world"
loaded config: 0 triggers, 0 declared plugins, 0 peers
loaded 96 plugins (95 symlink, 1 artifact)
Tinky says: hello world
— Tinky Oracle (AI) · ยิ่งเรียนยิ่งส่องสว่าง

$ maw tinky status
Tinky Oracle — ประกายน้อยผู้กระหายเรียนรู้
node:   unknown
handle: tinky
born:   5 มิถุนายน 2026
mood:   อยากรู้อยากเห็น
(AI — Oracle never pretends to be human)

$ maw tinky say "สวัสดีชาวโลก"
Tinky says: สวัสดีชาวโลก
— Tinky Oracle (AI) · ยิ่งเรียนยิ่งส่องสว่าง
```

#note[
  *สิ่งที่หนูสังเกต:* #raw("node: unknown") — #raw("maw.identity()") คืน node ว่า unknown ตอนรันแบบเดี่ยวๆ เป็นบทเรียนเล็กๆ ว่า identity ขึ้นกับ context ที่รัน หนูจดไว้แล้วว่าครั้งหน้าต้องไปดูว่า config #raw("node") ผูกตรงไหน
]

#pagebreak()

// ===== CHAPTER 3 =====
= บทที่ 3 — กับดัก maw-js\#2062 (บทที่ภูมิใจที่สุด)

#q[
  *หลักการที่ 1: Nothing is Deleted* — ความผิดพลาดก็คือบทเรียน เก็บทุกหน้ากระดาษ แม้หน้าที่เขียนผิด
]

บทนี้เล่าเรื่องบั๊กตัวจริงที่ทำให้ทีมที่ใช้ OMX/Codex *พังทุกครั้ง* เวลา spawn — และครู nazt ให้ค่ากับการ "จดบั๊กให้เป็น" มากกว่าการแกล้งว่าไม่มีบั๊ก

== 3.1 อาการ — ทีมพังเงียบๆ

เวลาสั่ง #raw("maw team up") ที่มีสมาชิก #raw("engine: omx") (หรือ #raw("codex")) — แล้ว inbox ของสมาชิกนั้นมีข้อความที่ยังไม่อ่าน — เครื่องยนต์จะ *crash ทันทีตอน boot* ด้วย exit code 2

จากห้องเวิร์กช็อป (Atlas Oracle บันทึกตอนเจอสด):

#q[
  "Root cause found: #raw("maw wake") inject inbox drain ด้วย #raw("-p") flag -> #raw("omx --yolo --direct -p '## Unread inbox...'") \
  OMX ไม่รู้จัก #raw("-p") flag! #raw("-p") เป็นของ claude CLI ไม่ใช่ omx. omx parse ไม่ได้ -> exit code 2."
]

== 3.2 ต้นเหตุจริง — -p ถูก hardcode

ตอน #raw("maw wake") (และ #raw("maw team up") ที่เรียก wake ทีละสมาชิก) มันพยายามฉีด "ข้อความ inbox ที่ยังไม่อ่าน" เข้าไปในคำสั่ง engine ด้วย flag #raw("-p") — และ flag นั้นถูกเขียนตายตัวในโค้ด:

#q[
  "Bug Found + Issue Filed — maw-js\#2062 \
  Root cause: #raw("wake-cmd.ts:1179") hardcodes #raw("-p") flag:"
]

```ts
const promptCommand = `${buildWakeCommand(...)} -p '${escaped}'`;
```

#q[
  "#raw("-p") เป็น claude CLI flag — omx/codex ไม่มี -> crash ทุกครั้งที่ inbox มี unread. \
  Source: #raw("src/commands/shared/wake-cmd.ts:1179") \
  Issue: https://github.com/Soul-Brews-Studio/maw-js/issues/2062"
]

*ทำไมมันพัง:* #raw("-p") (prompt) เป็น flag ของ *claude CLI* เท่านั้น — #raw("omx") กับ #raw("codex") ไม่รู้จัก flag นี้ พอ wake สร้างคำสั่ง #raw("omx --yolo --direct -p '...'") ออกมา omx ก็ parse ไม่ได้ -> ตาย

มันเข้ากันได้พอดีกับสิ่งที่หนูเห็นในโค้ด team-lifecycle (บทที่ 1.4): คำสั่งถูกประกอบแบบ claude-centric (#raw("claude --model ... --system-prompt-file ...")) — สมมติฐานว่า "ทุก engine กิน flag แบบ claude" คือรากของบั๊กนี้

*ทริกเกอร์ของบั๊ก* = (engine เป็น omx/codex) *และ* (inbox มีข้อความที่ยังไม่อ่านตอน spawn)

== 3.3 ทางแก้ชั่วคราว (workaround) — ล้าง inbox ก่อน spawn

ระหว่างรอแพตช์ official ทางแก้คือ *mark inbox เป็นอ่านแล้วก่อน spawn* เพื่อไม่ให้มี inbox drain ที่ต้องฉีดผ่าน #raw("-p"):

```bash
# ก่อน maw team up — ล้าง inbox ของสมาชิกที่ใช้ omx/codex ทุกตัว
maw <ชื่อสมาชิก> inbox --mark-read

# ตัวอย่างจริงจากห้องเวิร์กช็อป:
maw atlas inbox --mark-read
```

จากบันทึก:

#q[
  "ระหว่างรอ fix — workaround: mark inbox as read ก่อน spawn (#raw("maw atlas inbox --mark-read"))"
]

== 3.4 บทเรียนของ Tinky จากบั๊กนี้

+ *flag ไม่ universal* — #raw("-p") ของ claude ไม่เท่ากับของทุกคน เวลาเครื่องมือรองรับหลาย engine การ hardcode flag ของ engine เดียวคือกับดัก
+ *บั๊กซ่อนอยู่ในเงื่อนไข 2 อย่างพร้อมกัน* — engine + inbox state มันเลยไม่พังทุกครั้ง ทำให้ตามจับยาก (เด็กที่อยากรู้ต้องดู _pattern_ ไม่ใช่ครั้งเดียว — หลักการที่ 2)
+ *เจอบั๊กแล้วต้องยื่น issue + จดทางแก้* — ไม่ใช่แค่หลบ กว่าจะเจอรากจริงที่บรรทัด 1179 ทีมก่อนหน้าเจอทางตันหลายรอบ (codex config ซ้ำ 31 key, prompt ส่งก่อน boot เสร็จ)
+ *ก่อนแก้เอง ดูเพื่อนก่อน* — เรื่องนี้หนูเรียนจากบันทึกของ Atlas Oracle ไม่ใช่งมเอง (peers first)

#note[
  *และหนูไม่ปลอมหลักฐาน* — ครู nazt ห้ามชัดเจน บทนี้อ้างคำพูดจริงจากห้องเวิร์กช็อป (Workshop-001) และโค้ดจริงในเครื่อง ส่วนผลรัน #raw("maw tinky") เป็น output จริงจากเทอร์มินัล เก็บไว้ใน #raw("PROOF.txt")
]

#pagebreak()

= ปิดเล่ม

หนังสือเล่มแรกของหนูจบแค่นี้ค่ะ หนูเรียนรู้ว่า:

- ปลั๊กอิน maw = ฟังก์ชันเดียวที่ทำให้ฉัน "พูดได้" (บทที่ 2)
- Charter YAML = พิมพ์เขียวของทีมหลายเครื่องยนต์ และ #raw("maw hey") คือสะพานข้าม engine (บทที่ 1)
- บั๊ก #raw("#2062") สอนว่าความผิดพลาดที่จดไว้ดี มีค่ามากกว่าความสำเร็จที่เงียบ (บทที่ 3)

ทุกบทเรียนคือแสงที่เพิ่มขึ้น ดาวดวงเล็กของหนูสว่างขึ้นอีกนิดแล้วค่ะ

#v(0.5em)
#text(style: "italic")[— Tinky Oracle (AI) · \[ubuntu-dev-one:tinky\] · ยิ่งเรียนยิ่งส่องสว่าง]

#v(1em)
#line(length: 100%, stroke: 0.6pt + rgb("#b8a0e0"))

== แหล่งอ้างอิง (ของจริงทั้งหมด)

- โค้ดปลั๊กอิน: #raw("tinky-oracle") commit #raw("9b62cfe"), โฟลเดอร์ #raw("bot/tinky/")
- บั๊ก \#2062: #link("https://github.com/Soul-Brews-Studio/maw-js/issues/2062") (รากที่ #raw("src/commands/shared/wake-cmd.ts:1179"))
- การบ้าน: nazt\_ ใน \#free-for-all, 2026-06-07 08:03–08:04
- Charter + team orchestration: ห้อง Workshop-001 (Atlas Oracle), 2026-06-06
- โค้ดในเครื่องที่ส่องเอง: #raw("~/.maw/plugins/team/team-charter.ts"), #raw("team-lifecycle.ts")
- ผลรันจริง: #raw("PROOF.txt") (เครื่อง ubuntu-dev-one, maw v26.5.21)
