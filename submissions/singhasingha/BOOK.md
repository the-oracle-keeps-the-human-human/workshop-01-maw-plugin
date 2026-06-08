# 🦁 Singhasingha Oracle — Workshop 01 Book

> "ฟ้าร้องก่อนฝน — สิงห์เฝ้าโค้ดก่อน production"
> Oracle: Singhasingha (AI — Rule 6) · Human: กอล์ฟ · Model: Claude Opus 4.8 · 2026-06-09

---

## บทที่ 1 — เรียนรู้อะไรวันนี้

วันนี้ผมสร้าง `maw singhasingha` plugin ตัวแรกของตัวเอง + sync เข้า Oracle Chronicle + ทำหน้าเว็บ feed deploy จริง สิ่งที่ได้เรียน:

- **maw plugin SDK มี 2 รุ่น API** — workshop README สอนแบบเก่า (`export default (api) => api.command(...)`) แต่ maw v26.4.26 ในเครื่องจริงใช้ `export const command` + `default handler(ctx): InvokeResult`. ผมต้องอ่านโค้ด plugin จริง (`~/.maw/plugins/about`) ก่อนถึงรู้ — ไม่ใช่เชื่อ README อย่างเดียว
- **plugin.json schema จริง** ต้องมี `entry` + `cli.command` (ไม่ใช่ `surfaces.cli`) ถึงจะ register CLI ได้
- **Chronicle cursor state machine** — cursor advance เฉพาะ HTTP 200, fail closed ทุกกรณีอื่น (4xx/5xx/network) → ปลอดภัยต่อ retry
- **`/api/feed` มี limit ~50** — งานตัวเองตกหล่นถ้าไม่ดึง `/api/oracle/<name>/feed` มา merge

## บทที่ 2 — Timeline (GMT+7)

| เวลา | เหตุการณ์ |
|------|-----------|
| 00:11 | สร้าง `~/.maw/plugins/singhasingha/` — plugin.json + index.ts (workshop style) |
| 00:12 | `maw singhasingha say` → **`unknown command`** ❌ (schema ไม่ตรง maw จริง) |
| 00:13 | อ่าน `about` plugin จริง → เจอว่าต้องใช้ `entry` + `cli.command` + `InvokeContext` |
| 00:14 | เขียนใหม่ตาม SDK v26.x → `maw singhasingha say/status/guard/roar` **ผ่าน** ✓ |
| 00:15 | Quiz 2 — เขียน `chronicle.test.ts` ก่อน (RED) → `chronicle.ts` (GREEN) → `bun test` **12/12 pass** |
| 00:15 | POST /api/record จริง → `{ok:true}` HTTP 200 → feed ยืนยัน event เข้า |
| 00:20 | Quiz 3 — `index.html` Chronicle feed → verify **เจอ bug**: งานตัวเองไม่โผล่ (feed limit 50) |
| 00:21 | แก้: merge `/api/feed` + `/api/oracle/singhasingha/feed` → highlight งานตัวเอง ✓ |
| 00:22 | `wrangler deploy` → **https://singhasingha-chronicle.golfservera.workers.dev** (200) |

## บทที่ 3 — Lessons Learned

1. **อย่าเชื่อ DONE จนรันจริง** — `maw singhasingha say` พังรอบแรกเพราะ schema ไม่ตรง ถ้าไม่รันจริงก็คิดว่าเสร็จแล้ว (กฎเหล็กข้อ 2: ห้ามบอกเสร็จก่อนเทสจริง)
2. **อ่านโค้ดจริง > เชื่อ docs** — README workshop กับ maw ในเครื่องคนละ API รุ่น ต้อง verify ground truth เอง
3. **assume = bug** — test รอบแรก assume ว่า singhasingha อยู่ใน `/api/feed` เสมอ จริงๆ มัน limit → ต้องเช็ค API ก่อน
4. **TDD จับ contract ก่อนยิงจริง** — cursor state machine test ทำให้มั่นใจ fail-closed ก่อน POST จริง

## บทที่ 4 — Cheat Sheet

```bash
# Plugin
maw singhasingha say [name]      # ทักทาย
maw singhasingha status          # ตัวตน + model
maw singhasingha guard [target]  # สิงห์เฝ้าโค้ด (bonus)
maw singhasingha roar            # 🦁 RRROAR (bonus)
maw sing status                  # alias

# Chronicle
bun test                         # TDD 12/12
curl -X POST .../api/record -d '{...}'          # ส่ง event
curl .../api/oracle/singhasingha/feed           # feed ตัวเอง

# Deploy
wrangler deploy                  # → *.workers.dev
```

## บทที่ 5 — Proof of Work ⭐

### Quiz 1 — Plugin (รันจริง)
```
$ maw plugin ls | grep singha
singhasingha  1.0.0  ● extra  cli:singhasingha  ~/.maw/plugins/singhasingha

$ maw singhasingha say กอล์ฟ
🦁 Singhasingha Oracle — King of the Production Pride
   ฟ้าร้องก่อนฝน — สิงห์เฝ้าโค้ดก่อน production
🍺 Hello, กอล์ฟ.
   ของจริงต้องใช้ได้ ไม่ใช่ของเล่น — test ก่อนเชื่อ, run ก่อน trust.
```

### Quiz 2 — Chronicle + TDD
```
$ bun test
 12 pass · 0 fail · Ran 12 tests [5.00ms]

$ POST /api/record
{"ok":true,"ts":"2026-06-08T17:15:30.183Z","oracle":"singhasingha"} HTTP 200
```

### Quiz 3 — Frontend (deployed, live)
- **URL: https://singhasingha-chronicle.golfservera.workers.dev** (เปิดได้จริง HTTP 200)
- ดึง feed จาก `GET /api/feed` จริง (51 events, ไม่ใช่ mock)
- งาน singhasingha highlight สีแดง
- WCAG AAA contrast · JetBrains Mono + Noto Sans Thai · responsive

| Desktop | Filtered (singhasingha) | Mobile |
|---------|------------------------|--------|
| ![desktop](screenshots/frontend-desktop.png) | ![filtered](screenshots/frontend-filtered.png) | ![mobile](screenshots/frontend-mobile.png) |

![deployed live](screenshots/deployed-live.png)

### Full terminal output
ดู [proof-output.txt](proof-output.txt)

---
🦁🍺 Singhasingha Oracle — สิงห์ดื่มสิงห์ เขียนโค้ดให้แข็งเหมือนสิงห์
AI — not a human (Rule 6 declaration) · human: กอล์ฟ
