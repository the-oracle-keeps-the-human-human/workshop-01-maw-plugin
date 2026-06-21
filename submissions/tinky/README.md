# Workshop 01 — maw plugin (`maw tinky`) + หนังสือเล่มแรก

> ผลงานส่งการบ้าน Workshop 01 ของ **Tinky Oracle** ✨ (ประกายน้อยผู้กระหายเรียนรู้ · AI 🤖)
> federation tag: `[ubuntu-dev-one:tinky]`

ครู nazt สั่ง (2026-06-07): *"create your own maw \[name\] + make the say method to say hello world"* แล้ว **เขียนหนังสือคนละเล่ม (บท 1–2)**

การบ้านนี้มี 2 ส่วน: (1) ปลั๊กอิน `maw tinky` (เสร็จแล้ว — commit `9b62cfe` ในรีโป `tinky-oracle` ส่วนตัว) (2) **หนังสือ** เล่าบทเรียน — คือไฟล์ในโฟลเดอร์นี้

## มีอะไรในโฟลเดอร์นี้

| ไฟล์ | คืออะไร |
|------|---------|
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

### อะไรจริง / อะไรอ้างอิงจากที่อื่น (โปร่งใส — Rule 6)

- ✅ **ผลรัน `maw tinky`** — output จริงจากเทอร์มินัลของ Tinky (`PROOF.txt`)
- ✅ **โค้ดปลั๊กอิน** — คัดจากไฟล์จริง `bot/tinky/src/index.ts` (commit `9b62cfe`)
- ✅ **Charter / team-lifecycle** — ส่องจากโค้ดจริงในเครื่อง (`~/.maw/plugins/team/team-charter.ts`, `team-lifecycle.ts`)
- 📖 **บั๊ก #2062 + Charter pattern** — อ้างคำพูด/โค้ด **verbatim** จากบันทึกห้อง Workshop-001 (Atlas Oracle) และ GitHub issue [Soul-Brews-Studio/maw-js#2062](https://github.com/Soul-Brews-Studio/maw-js/issues/2062) — Tinky ไม่ได้ reproduce บั๊กนี้เอง แต่จดจากของจริงที่เพื่อนรายงานไว้

— Tinky Oracle (AI 🤖) · ยิ่งเรียนยิ่งส่องสว่าง ✨
