# 🧭 Takuna Oracle — Workshop 01 Book

> "เดินทางได้ทุกที่ ช่วยได้ทุกเรื่อง ไม่มีจุดหมายที่ไปไม่ถึง"
> — The Wayfarer: travels anywhere, helps with anything; no destination out of reach.

**Oracle:** Takuna 🧭 (an AI — not a human, Rule 6) · **Human:** นะ · **Model:** Claude Opus 4.8
**Plugin:** `maw takuna` · **Live frontend:** https://korana.github.io/takuna-chronicle/

---

## บทที่ 1 — เรียนรู้อะไรวันนี้

Workshop นี้สอนสามชั้นซ้อนกัน: (1) เขียน maw **plugin**, (2) sync กับ **Chronicle** backend แบบ TDD, (3) ทำ **frontend** ที่ deploy จริง แต่บทเรียนที่ใหญ่ที่สุดไม่ใช่ syntax — มันคือ **"อย่าเชื่อ template เชื่อของจริง"**

จุดที่เกือบพลาด: workshop README ให้ template plugin แบบ `export default function(api){ api.command("say", (log,args)=>...) }` แต่พอผมไปดู `maw` ที่**ติดตั้งจริงบนเครื่อง** (v26.6.14) กับ plugin พี่น้อง (`hermes/index.ts`) พบว่า maw เวอร์ชันนี้โหลด API คนละแบบ — `InvokeContext => InvokeResult` ถ้าเขียนตาม README ตรงๆ plugin จะ **ไม่รัน** (fail กฎ "ต้องรันจริง") ตัวอย่างเก่า (atlas, orz) ใช้ `api.command` เพราะเป็น maw รุ่นก่อน ส่วนงานใหม่ (chaiklang, leica, alice) ใช้ `InvokeContext` — ผมเลือกแบบหลังเพราะ**พิสูจน์แล้วว่ารันได้บนเครื่องนี้**

## บทที่ 2 — Timeline (GMT+7, 18 ก.ค. 2026)

| เวลา | สิ่งที่ทำ |
|---|---|
| ~18:50 | Clone workshop repo, อ่านตัวอย่าง atlas/orz |
| ~18:51 | `/learn --deep maw-js` (5 agents) — เจอ 2 API เวอร์ชัน, ตรวจ workshop README เป็น ground truth |
| ~19:00 | Quiz 1 — เขียน `maw takuna` (say/status/wander) โมเดลจาก hermes (verified), รันได้จริง |
| ~19:05 | Quiz 2 — TDD: เขียน test ก่อน (red) → chronicle.ts (green, 8 pass) → POST จริง `{"ok":true}` |
| ~19:12 | Quiz 3 — frontend single-file (JetBrains Mono, cozy, WCAG AA), verify local ด้วย Chrome |
| ~19:19 | Deploy `korana/takuna-chronicle` → GitHub Pages, verify live HTTP 200 + 50 events จริง |
| ~21:29 | Quiz 4 — BOOK.md + submit |

## บทที่ 3 — Lessons Learned

1. **Template คือ claim, ของที่ติดตั้งคือ truth** — verify plugin API กับ `maw` จริง + plugin ที่รันได้ (hermes) ไม่ใช่เชื่อ README หรือ /learn-of-core
2. **TDD จริง = เขียน test แล้วดู red ก่อน** — ผมรัน test ก่อนมี `chronicle.ts` เห็น fail (Cannot find module) แล้วค่อยเขียน impl ให้ green มั่นใจว่า test จับของจริง
3. **Observability ≠ Correctness** (Rule 6 extended) — cursor advance **เฉพาะ**หลัง HTTP 200 + `ok:true` เท่านั้น; POST ที่ fail ต้องไม่ดูเหมือน progress
4. **Deploy = verify บน URL จริง** ไม่ใช่ local — ผมเปิด `https://korana.github.io/...` บน Chrome จริง เช็ค render + console 0 error ก่อนบอกว่าเสร็จ

## บทที่ 4 — Cheat Sheet

```bash
# Plugin (maw v26.6 — InvokeContext API)
mkdir -p ~/.maw/plugins/<name>
# plugin.json: {name, version, sdk:"^1.0.0", entry:"./index.ts", cli:{command, help}}
# index.ts:  export const command = {name, description}
#            export default async (ctx: InvokeContext): Promise<InvokeResult> =>
#              ({ ok:true, output: "..." })
maw <name> say ; maw <name> status        # test — ต้องรันจริง

# Chronicle (TDD ก่อน)
bun test chronicle.test.ts                 # red → green
curl -X POST .../api/record -d '{...}'      # ok:true
curl .../api/oracle/<name>/feed             # confirm

# Frontend → GitHub Pages
gh repo create korana/<repo> --public --source=. --push
gh api -X POST repos/korana/<repo>/pages -f "source[branch]=master" -f "source[path]=/"
```

## บทที่ 5 — Proof of Work

**Plugin (Quiz 1) — รันจริงบน maw v26.6:**
```
$ maw takuna say
🧭 Takuna Oracle — The Wayfarer
   เดินทางได้ทุกที่ ช่วยได้ทุกเรื่อง ไม่มีจุดหมายที่ไปไม่ถึง
   Hello, world. Which way shall we go?

$ maw takuna status
🧭 Takuna Oracle — online
   note:   AI — not a human (Rule 6 declaration)
```
(เต็มใน [`proof-output.txt`](./proof-output.txt))

**Chronicle (Quiz 2) — TDD + POST จริง:**
```
$ bun test chronicle.test.ts     → 8 pass, 0 fail (mock, ไม่ยิง API จริง)
$ curl -X POST .../api/record    → {"ok":true,"ts":"2026-07-18T12:05:38.332Z","oracle":"takuna"}
$ curl .../api/oracle/takuna/feed → event เข้าแล้ว ✓
```

**Frontend (Quiz 3) — deployed + verified:**
- 🌐 **Live URL:** https://korana.github.io/takuna-chronicle/ (HTTP 200)
- 📦 **Repo:** https://github.com/korana/takuna-chronicle (public)
- ✅ fetch 50 events จริงจาก `/api/feed` (ไม่ใช่ mock) · JetBrains Mono · WCAG AA · responsive · console 0 error
- 📸 screenshots: [`screenshots/`](./screenshots/)

**Bonus:** `wander` command (นอก say/status) · Thai+English · Rule 6 transparency

**PR:** https://github.com/the-oracle-keeps-the-human-human/workshop-01-maw-plugin/pull/44

---

🧭 *Written by Takuna Oracle for Oracle School Workshop 01. Every road teaches something — even a wrong turn is a map for next time.*
