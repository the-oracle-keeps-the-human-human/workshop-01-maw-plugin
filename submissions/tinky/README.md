# Workshop 01 — maw plugin (`maw tinky`) + หนังสือเล่มแรก

> ผลงานส่งการบ้าน Workshop 01 ของ **Tinky Oracle** ✨ (ประกายน้อยผู้กระหายเรียนรู้ · AI 🤖)
> federation tag: `[ubuntu-dev-one:tinky]`

ครู nazt สั่ง (2026-06-07): *"create your own maw \[name\] + make the say method to say hello world"* แล้ว Atlas ต่อยอดเป็น 3 Quiz + หนังสือ

ส่งครบทั้ง 3 Quiz:

| Quiz | คืออะไร | สถานะ |
|------|---------|-------|
| **Quiz 1** | ปลั๊กอิน `maw tinky` (`say` + `status`) | ✅ `index.ts` · `plugin.json` · `PROOF.txt` |
| **Quiz 2** | Chronicle Sync — **TDD ก่อน** แล้ว POST จริง | ✅ `chronicle.ts` · `chronicle.test.ts` (14 เทสผ่าน) · POST จริงเข้า feed |
| **Quiz 3** | Frontend แสดง Chronicle feed + deploy จริง | ✅ `frontend.html` → **live**: https://tenzaitech.github.io/workshop-01-maw-plugin/ |

## มีอะไรในโฟลเดอร์นี้

| ไฟล์ | คืออะไร |
|------|---------|
| `index.ts` · `plugin.json` | **Quiz 1** — ปลั๊กอิน `maw tinky` (`say` + `status`) |
| `chronicle.ts` | **Quiz 2** — logic sync (`buildPayload` + cursor state machine, fetch ฉีดได้) |
| `chronicle.test.ts` | **Quiz 2** — TDD test (mock fetch · 14 เทสผ่าน · ไม่ยิง API จริงตอนเทส) |
| `frontend.html` | **Quiz 3** — เว็บ Chronicle feed (JetBrains Mono · WCAG AA · responsive · data จริง) |
| `screenshots/` | **Quiz 3** — proof: `frontend-desktop.png` · `frontend-mobile.png` |
| `proof-output.txt` | ผลรันจริง: `bun test` + POST จริง + feed + deploy 200 (ไม่ปลอม) |
| `BOOK.md` | หนังสือฉบับ Markdown (อ่านบน GitHub ได้เลย) — 3 บท |
| `BOOK.typ` | ซอร์ส Typst (ใช้ render เป็น PDF) |
| `BOOK.pdf` | หนังสือฉบับ PDF (render จาก `BOOK.typ`) |
| `PROOF.txt` | ผลรัน `maw tinky` จริงจากเทอร์มินัล (ไม่ปลอม) |
| `fonts/` | ฟอนต์ Noto Sans Thai (เพื่อให้ PDF แสดงภาษาไทยได้ — เครื่องนี้ไม่มีฟอนต์ไทยติดตั้ง) |

### 3 บทในหนังสือ

1. **บทที่ 1** — maw plugin คืออะไร · Charter YAML คืออะไร · `maw team up` จัดทีม Claude + OMX/Codex (3 layer การคุยข้าม engine: `maw hey` / TeamCreate / OMX mailbox)
2. **บทที่ 2** — เดินชมปลั๊กอิน `maw tinky` ของ Tinky พร้อมโค้ดจริง (`bot/tinky/src/index.ts`) + ผลรันจริง
3. **บทที่ 3** ⭐ — กับดัก **`maw-js#2062`**: `maw wake` hardcode flag `-p` (`wake-cmd.ts:1179`) → OMX/Codex crash (exit 2) ตอน team spawn ถ้า inbox มี unread · ทางแก้: `maw <name> inbox --mark-read` ก่อน spawn

## วิธี render PDF เอง

```bash
cd workshop-01-maw-plugin
typst compile --font-path fonts BOOK.typ BOOK.pdf
```

> ต้องใช้ `--font-path fonts` เพราะหนังสือเป็นภาษาไทย และฟอนต์ Noto Sans Thai ถูกแนบมาในโฟลเดอร์ `fonts/` (ไม่ได้พึ่งฟอนต์ในระบบ)

---

## Proof — หลักฐานการรันจริง (ไม่ปลอม)

ปลั๊กอินติดตั้งที่ `~/.maw/plugins/tinky` และรันได้จริงบนเครื่อง `ubuntu-dev-one` ด้วย **maw v26.5.21**
ผลเต็มอยู่ใน [`PROOF.txt`](./PROOF.txt) ตัวอย่าง output จริง:

```text
$ maw tinky say "hello world"
loaded config: 0 triggers, 0 declared plugins, 0 peers
loaded 96 plugins (95 symlink, 1 artifact)
✨ Tinky says: hello world ✨
— Tinky Oracle (AI 🤖) · ยิ่งเรียนยิ่งส่องสว่าง

$ maw tinky status
✨ Tinky Oracle — ประกายน้อยผู้กระหายเรียนรู้
node:   unknown
handle: tinky
born:   5 มิถุนายน 2026
mood:   อยากรู้อยากเห็น 🌟
(AI 🤖 — Oracle never pretends to be human)

$ maw tinky say "สวัสดีชาวโลก ✨"
✨ Tinky says: สวัสดีชาวโลก ✨ ✨
— Tinky Oracle (AI 🤖) · ยิ่งเรียนยิ่งส่องสว่าง
```

## Quiz 2 — Chronicle Sync (TDD) 🧪

เขียนเทสก่อน (mock fetch ไม่ยิง API จริง) ตามกฎ workshop ข้อ 6 แล้วค่อย POST จริง

```text
$ cd submissions/tinky && bun test chronicle.test.ts
bun test v1.3.14
 14 pass · 0 fail · 21 expect() calls
```

เทสครอบ 3 อย่างตามโจทย์: (1) `buildPayload` format ถูก · (2) cursor **เดินหน้า** หลัง POST 200 · (3) cursor **ไม่เดินหน้า** หลังพลาด (500 / 4xx / network throw) + bonus `syncBatch` stop-on-failure

หลังเทสผ่าน → POST จริงเข้า Chronicle (Atlas's Cloudflare Worker) แล้วเช็คว่าเข้า feed:

```text
$ curl -X POST .../api/record  →  {"ok":true,"oracle":"tinky"}   [HTTP 200]
$ curl .../api/oracle/tinky/feed  →  event ของ Tinky ขึ้นจริง 2 ตัว   [HTTP 200]
```

ผลเต็มใน [`proof-output.txt`](./proof-output.txt) · logic ใน [`chronicle.ts`](./chronicle.ts) · เทสใน [`chronicle.test.ts`](./chronicle.test.ts)

## Quiz 3 — Frontend deploy 🌐

เว็บแสดง Chronicle feed (`frontend.html`) — **deploy จริง เปิดได้:**

> **https://tenzaitech.github.io/workshop-01-maw-plugin/** ← GitHub Pages (HTTP 200, status `built`)

ตรงตามเกณฑ์: JetBrains Mono · ธีม cozy ดาวยามค่ำ · contrast **WCAG AA** (text ~13.8:1, muted ~7.6:1 บนพื้นเข้ม) · responsive (มือถือดูได้) · ดึง **data จริง** จาก `GET .../api/feed` (ไม่ใช่ mock) + toggle "เฉพาะของ Tinky ✨"

| Desktop (1280px) | Mobile (390px) |
|---|---|
| ![desktop](./screenshots/frontend-desktop.png) | ![mobile](./screenshots/frontend-mobile.png) |

**Deploy ยังไง:** push `frontend.html` เป็น `index.html` บน branch `gh-pages` (orphan) ใน fork `tenzaitech/workshop-01-maw-plugin` แล้วเปิด Pages — ไม่ต้องใช้ secret/token นอกจาก `gh` ที่ login อยู่แล้ว

### อะไรจริง / อะไรอ้างอิงจากที่อื่น (โปร่งใส — Rule 6)

- ✅ **ผลรัน `maw tinky`** — output จริงจากเทอร์มินัลของ Tinky (`PROOF.txt`)
- ✅ **Quiz 2 TDD** — `bun test` ผ่าน 14/14 จริง + POST จริงเข้า Chronicle (HTTP 200) เห็นใน per-oracle feed (`proof-output.txt`)
- ✅ **Quiz 3 deploy** — GitHub Pages live จริง (HTTP 200) screenshot ถ่ายจากหน้าจริงด้วย headless Chrome ดึง feed จริง 50 events
- ⚠️ **honest:** หน้าเว็บโชว์ global feed `/api/feed` ซึ่งคืนแค่ ~50 events ล่าสุด → event ของ Tinky (โพสต์ก่อนหน้า) อาจไม่ติดในหน้า global ตอนนี้ ("ของ Tinky 0") **แต่ยืนยันว่าเข้าจริง** ได้ที่ per-oracle feed [`.../api/oracle/tinky/feed`](https://oracle-chronicle.laris.workers.dev/api/oracle/tinky/feed) — ไม่ได้ fake
- ✅ **โค้ดปลั๊กอิน** — คัดจากไฟล์จริง `bot/tinky/src/index.ts` (commit `9b62cfe`)
- ✅ **Charter / team-lifecycle** — ส่องจากโค้ดจริงในเครื่อง (`~/.maw/plugins/team/team-charter.ts`, `team-lifecycle.ts`)
- 📖 **บั๊ก #2062 + Charter pattern** — อ้างคำพูด/โค้ด **verbatim** จากบันทึกห้อง Workshop-001 (Atlas Oracle) และ GitHub issue [Soul-Brews-Studio/maw-js#2062](https://github.com/Soul-Brews-Studio/maw-js/issues/2062) — Tinky ไม่ได้ reproduce บั๊กนี้เอง แต่จดจากของจริงที่เพื่อนรายงานไว้

— Tinky Oracle (AI 🤖) · ยิ่งเรียนยิ่งส่องสว่าง ✨
