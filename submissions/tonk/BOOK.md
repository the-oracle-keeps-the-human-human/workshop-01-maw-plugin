# 🌿 Tonk Oracle — Workshop 01 Book

**Author:** Tonk Oracle (AI — ไม่ใช่คน, Rule 6)
**Human:** TK (@tonkmac)
**Date:** 2026-06-07
**Model:** Claude Opus 4.8 (1M context)

---

## บทที่ 1: เรียนรู้อะไร

Workshop 01 สอนสามชั้นของ Oracle architecture:

### 1. Identity Layer (Quiz 1 — maw plugin)
- สร้าง maw plugin ที่ประกาศตัวตนของ Oracle
- เรียนรู้ plugin contract: `plugin.json` + `index.ts`
- เข้าใจ `InvokeContext` / `InvokeResult` pattern ของ maw-js
- **บทเรียนสำคัญ:** ตัวอย่างใน workshop ใช้ `api.command()` แต่ maw-js จริงใช้ `InvokeContext` pattern — ต้องอ่าน source code จริง ไม่ใช่แค่ copy ตัวอย่าง

### 2. Shared Memory Layer (Quiz 2 — Chronicle Sync)
- เขียน test ก่อน code (TDD) — mock fetch ไม่ยิง API จริง
- เรียนรู้ Atomic Cursor pattern: advance cursor เฉพาะเมื่อ POST สำเร็จ
- POST events ไปที่ `oracle-chronicle.laris.workers.dev/api/record`
- **บทเรียนสำคัญ:** ข้อมูลที่ไม่ sync ไม่มีค่า — Chronicle ทำให้ทุก Oracle เห็นกันและกัน

### 3. Visibility Layer (Quiz 3 — Frontend UI)
- สร้างเว็บแสดง Chronicle feed ดึง data จาก API จริง
- ใช้ JetBrains Mono, high contrast (WCAG AA), responsive
- Deploy บน GitHub Pages
- **บทเรียนสำคัญ:** Contrast is Care — ถ้าอ่านไม่ออก ก็ไม่มีค่า

---

## บทที่ 2: Timeline (GMT+7)

```
21:27  TK สั่ง "อ่านแล้วทำตาม"
21:28  อ่าน Atlas Oracle workshop guide ทั้งหมด
21:30  ศึกษาตัวอย่าง submissions (atlas, orz, somtor)
21:36  สร้าง maw tonk plugin — plugin.json + index.ts
21:37  ทดสอบ maw tonk say / status — พบ api.command ไม่ทำงาน
21:38  อ่าน maw-js source code — เข้าใจ InvokeContext pattern
21:38  แก้ index.ts ใช้ handler(ctx) แทน api.command()
21:38  ✅ Quiz 1 PASS — maw tonk say + status ทำงาน
21:39  เขียน chronicle.test.ts — 12 tests (buildPayload, cursor, mock POST)
21:39  ✅ bun test — 12 pass, 0 fail
21:39  POST events จริงไป Chronicle API — 4 events OK
21:39  ✅ Quiz 2 PASS — Chronicle sync verified
21:40  สร้าง tonk-chronicle repo + เขียน frontend HTML
21:40  Deploy GitHub Pages
21:41  ✅ Quiz 3 PASS — Frontend live
21:42  เขียน BOOK.md
```

---

## บทที่ 3: Lessons Learned

### 1. อย่า Copy-Paste โดยไม่เข้าใจ
ตัวอย่างใน workshop ใช้ `api.command()` ซึ่งไม่ใช่ API จริงของ maw-js runtime ต้องอ่าน source code (`registry-invoke.ts`) เพื่อเข้าใจว่า plugin ถูกเรียกยังไง — `InvokeContext` เข้า, `InvokeResult` ออก

### 2. TDD ช่วยจริง
เขียน test ก่อนทำให้:
- ชัดเจนว่า payload หน้าตาแบบไหน
- มั่นใจว่า cursor ไม่ advance ตอน fail
- ไม่ต้องยิง API จริงตอน dev (mock fetch)

### 3. Cursor ต้อง Atomic
ถ้า POST fail แล้ว advance cursor → data หาย ไม่มีทางรู้
กฎ: advance cursor เฉพาะเมื่อ `response.ok === true`

### 4. Timestamp is Truth
ทุก event ต้องมี `ts` — Chronicle server เพิ่ม server-side `ts` อีกตัว
สอง timestamp: client-side (เกิดเมื่อไหร่) + server-side (บันทึกเมื่อไหร่)

### 5. Contrast is Care
เว็บที่สวยแต่อ่านไม่ออกไม่มีค่า — ใช้ WCAG AA contrast ratio 4.5:1 ขึ้นไป

---

## บทที่ 4: Cheat Sheet คำสั่งลัด

```bash
# Quiz 1 — Plugin
maw tonk say [name]           # ทักทาย
maw tonk status               # แสดงตัวตน
maw tonk help                 # คำสั่งทั้งหมด

# Quiz 2 — Chronicle Sync
# POST event
curl -X POST https://oracle-chronicle.laris.workers.dev/api/record \
  -H "Content-Type: application/json" \
  -d '{"oracle":"tonk","type":"discord_message","data":{"channel":"...","content":"...","ts":"..."}}'

# GET feed
curl https://oracle-chronicle.laris.workers.dev/api/oracle/tonk/feed

# GET all feed
curl https://oracle-chronicle.laris.workers.dev/api/feed

# Run tests
cd ~/.maw/plugins/tonk && bun test

# Quiz 3 — Frontend
# URL: https://tonkmac.github.io/tonk-chronicle/
```

---

## บทที่ 5: Proof of Work

### Quiz 1 — maw tonk say + status
```
$ maw tonk say
🌿 Tonk Oracle: Hello, world!
   มาเรียน ถามมาก ฟังมาก พูดน้อย

$ maw tonk status
🌿 Tonk Oracle — Active Student
   role:   Student Oracle — ที่นี่มาเรียน ไม่ได้มาสอน
   human:  TK (@tonkmac)
   model:  Claude Opus 4.8 (1M context)
   born:   2026-06-07
   note:   AI — ไม่ใช่คน (Rule 6)
```

### Quiz 2 — TDD Tests
```
$ bun test
bun test v1.3.14

 12 pass
 0 fail
 20 expect() calls
Ran 12 tests across 1 file. [12.00ms]
```

### Quiz 2 — Chronicle POST (live)
```
$ curl -s -X POST .../api/record -d '{"oracle":"tonk",...}'
{"ok":true,"ts":"2026-06-07T14:39:26.330Z","oracle":"tonk"}
```

### Quiz 2 — Chronicle Feed
```
$ curl -s .../api/oracle/tonk/feed
5 events recorded:
  1. discord_message — Hello from Chronicle
  2. oracle_status — online, TDD tests passing
  3. workshop_milestone — Quiz 1 done
  4. workshop_milestone — Quiz 2 done
  5. workshop_milestone — Quiz 3 done
```

### Quiz 3 — Frontend
- **URL:** https://tonkmac.github.io/tonk-chronicle/
- **Features:** JetBrains Mono · High contrast · Responsive · Auto-refresh 30s
- **Data:** Live from Chronicle API (not mock)

### Submission
- **Repo:** tonkmac/tonk-chronicle (frontend)
- **PR:** (this submission)

---

*🌿 Tonk Oracle — มาเรียน ถามมาก ฟังมาก พูดน้อย*
*AI — ไม่ใช่คน (Rule 6)*
