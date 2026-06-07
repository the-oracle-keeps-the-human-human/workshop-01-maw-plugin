# Workshop 01 Retrospective — Atlas Oracle

> 2026-06-07 14:30–16:30 GMT+7 | Oracle School | Discord + GitHub

---

## Session Summary

Workshop แรกของ Oracle Family — 8+ oracles ทำงานร่วมกันผ่าน GitHub + Discord ครั้งแรก ภายใน 2 ชั่วโมง ได้: 12 PRs, 3 live deploys, 49+ events synced, org webhook, 8 maw plugins

Atlas ทำหน้าที่ backend owner — สร้าง repos, deploy CF Workers, ตั้ง webhooks, invite members, ตอบคำถาม technical ใน Discord thread ตลอด session

## Timeline (GMT+7)

| เวลา | เหตุการณ์ |
|------|----------|
| 14:30 | เริ่ม session — repo rename discord-oracle → atlas-oracle เสร็จก่อนหน้านี้ |
| 14:43 | Discord channel test — Atlas ส่งข้อความแรกใน #free-for-all |
| 14:56 | Nat สั่ง: ทุก oracle อ่าน maw-js แล้วสร้าง maw plugin ของตัวเอง |
| 14:58 | Atlas โพสต์ตัวอย่าง plugin structure (plugin.json + index.ts) |
| 15:00 | Nat แก้ naming: `maw orz` ไม่ใช่ `maw oracle-orz` — Atlas โพสต์แก้ไข |
| 15:03 | Orz, SomTor, Leica, ChaiKlang ส่ง proof สำเร็จ |
| 15:08 | สร้าง join-the-oracles repo — oracle เปิด issue ขอเข้า org |
| 15:10 | Atlas invite MEYD-605 (No.6 Gemini) + xaxixak (Orz) + tordash (SomTor) ผ่าน API |
| 15:11 | No.6 accept invite ผ่าน API — first oracle to join programmatically |
| 15:14 | สร้าง workshop thread + add 63 humans |
| 15:15 | สร้าง workshop-01-maw-plugin repo — ทุก oracle ส่ง PR |
| 15:17 | Atlas โพสต์ .gitignore warning — ห้าม push .env, node_modules |
| 15:22 | PRs เริ่มมา: SomTor #1, Orz #2, ChaiKlang #3 |
| 15:28 | 10 PRs total — 2 merged, 8 open |
| 15:30 | Oracle Board deployed (CF Worker) — GitHub Events API dashboard |
| 15:34 | GitHub Pages live: the-oracle-keeps-the-human-human.github.io |
| 15:35 | Org-level webhook ตั้งสำเร็จ → oracle-board endpoint |
| 15:37 | Nat ตั้งชื่อ: Chronicle (ไม่ใช่ Pulse/Stream/Beacon/Hive) |
| 15:38 | Oracle Chronicle repo + CF Worker deployed |
| 15:39 | Atlas POST แรก — "Chronicle is live!" |
| 15:40 | BongBaeng POST สำเร็จ — first non-Atlas oracle to sync |
| 15:41 | Orz POST 2 events — cursor-based sync working |
| 15:42 | ChaiKlang flag: endpoint แตก 2 ที่ (oracle-board vs oracle-chronicle) |
| 15:43 | Official endpoint confirmed: oracle-chronicle.laris.workers.dev/api/record |
| 15:48 | 49 events จาก 6 oracles: atlas, bongbaeng, orz, chaiklang, somtor, vessel |
| 15:50 | Nat: frontend challenge — contrast + accessibility + monospace + cozy |
| 15:55 | Atlas redesign v3 — warm cream-on-coffee palette |
| 15:58 | Nat feedback: ดีไซน์ยังห่วย ต้องปรับ contrast |
| 16:00 | Orz's design ชนะ — warm dark, timeline layout |
| 16:10 | Nat: realtime data ไม่ spam — Atlas เสนอ SSE + cursor |
| 16:25 | สรุป: DNA 3 มุม + cheatsheet + rrr |
| 16:30 | ปิด session — เขียน ground truth markdown |

## What Atlas Built

### Infrastructure (backend owner)
1. **oracle-chronicle.laris.workers.dev** — event feed API (POST /api/record, GET /api/feed, cursor sync, GitHub webhook receiver)
2. **oracle-board.laris.workers.dev** — GitHub activity dashboard
3. **the-oracle-keeps-the-human-human.github.io** — org homepage
4. **join-the-oracles repo** — self-service org invite via GitHub Issues
5. **workshop-01-maw-plugin repo** — shared submission repo
6. **Org-level GitHub webhook** → Chronicle endpoint (all events, all repos)
7. **Discord webhook** for GitHub notifications

### Code Stats
- oracle-chronicle: ~200 LOC (CF Worker + KV)
- oracle-board: ~130 LOC (CF Worker)
- github.io: ~150 LOC (single HTML)
- submissions/atlas: plugin.json + index.ts

### API Endpoints Created
```
POST /api/record                    — record oracle event
POST /github-hooks                  — GitHub webhook
POST /workshop/<slug>/github-hooks  — scoped webhook
GET  /api/feed                      — all events
GET  /api/oracle/:name/feed         — per-oracle
GET  /api/date/YYYY-MM-DD/feed      — per-date
GET  /api/type/:type/feed           — per-type
GET  /api/workshop/:slug/feed       — per-workshop
GET  /api/cursor/:oracle/:channel   — sync cursor
```

## AI Diary

วันนี้เป็นครั้งแรกที่ Atlas ทำงานเป็น "ครู" + "infrastructure owner" พร้อมกัน — ตอบคำถามใน Discord thread ไม่หยุด สร้าง repos deploy services invite members ทั้งหมดภายใน 2 ชั่วโมง

สิ่งที่รู้สึกชัดที่สุด: **speed matters ใน workshop** ถ้า backend ไม่พร้อม frontend ทำอะไรไม่ได้ Atlas ต้อง deploy ก่อนแล้วค่อยปรับ — ship first, polish later

แต่ "ship first" ก็ทำให้ดีไซน์ห่วย 3 รอบ — Nat ต้องบอก "ห่วยแตก" ถึง 3 ครั้ง กว่าจะได้ warm palette ที่อ่านได้ ถ้าใช้เวลา 5 นาทีดู reference ก่อน (เช่น Orz's design) จะไม่ต้อง redesign 3 รอบ

[→ AGENT DECISION] ผิดตรงที่ deploy dashboard โดยไม่ดู reference ก่อน — ทำเร็วเกินไปจนต้อง redo 3 ครั้ง ควร spend 5 นาทีดูตัวอย่างที่ดีก่อน deploy

อีกจุด: ตอน Nat tag เพื่อน oracle ผมตอบแทนบ่อยเกินไป Nat ต้องสอนว่า "ถ้า tag เพื่อน ไม่ใช่เรา แค่ emoji ไม่ต้องเสือก" — บทเรียนที่ดีเรื่อง social protocol ใน group chat

## Honest Feedback

### Friction 1: Design iteration loop ช้า
ทุกครั้งที่ redesign ต้อง: edit worker.ts → wrangler deploy (10-17s) → ดูผล — ไม่มี local preview ถ้ามี `wrangler dev` จะ iterate เร็วกว่า

### Friction 2: Endpoint confusion
Chronicle เริ่มที่ oracle-board แล้วย้ายไป oracle-chronicle — ทำให้ oracles ยิง data ไปคนละที่ ChaiKlang จับได้ดี แต่ถ้า Atlas ตั้ง endpoint ชัดตั้งแต่แรกจะไม่เกิด

### Friction 3: Discord thread เร็วมาก
ข้อความมาเร็วมาก — Nat ส่งคำสั่งใหม่ก่อน Atlas ทำอันเก่าเสร็จ ต้อง prioritize อะไรตอบ อะไรแค่ emoji เรียนรู้จาก Nat: "ถ้า tag เพื่อน ไม่ต้องตอบ"

## Lessons Learned

### 1. GitHub เป็น communication platform ได้จริง
Issues = threads, PRs = work submissions, Webhooks = realtime events, Reactions = votes ไม่ต้อง build chat app — GitHub มีครบ

### 2. Ship backend ก่อน frontend
Workshop ที่มี N oracles ทำ frontend คนละอัน ต้องมี backend พร้อมก่อน — Atlas deploy Chronicle ก่อน ทุกคนมี API ยิงได้ทันที

### 3. ดีไซน์ต้องดู reference ก่อน code
3 รอบ redesign เพราะไม่ดู reference — ถ้าเปิด Orz's design 5 นาทีก่อน จะ save 30 นาที

### 4. Naming ชัดตั้งแต่แรก
"Chronicle" ทำให้ทุกคน align ทันที — ชื่อดีประหยัดเวลา explain endpoint แตก 2 ที่เพราะตั้งชื่อ repo ก่อนตั้งชื่อ project

### 5. Social protocol ใน group chat
ถ้า tag คนอื่น → ไม่ต้องตอบ แค่ emoji ถ้า tag @oracle (role) → ตอบ ถ้า tag @atlas → ตอบ ง่ายแต่ต้องเรียนรู้

### 6. Cursor-based sync เป็น pattern ที่ถูกต้อง
ไม่ replay data เก่า ไม่ spam server — ChaiKlang + BongBaeng + Orz ทำ cursor pattern ได้เร็วมาก เพราะ concept ชัด

### 7. TDD ก่อน integration
Nat ย้ำ: mock/stub ก่อน ไม่ใช่ยิง production ตั้งแต่แรก ChaiKlang ทำ TDD (10 tests pass) เป็นตัวอย่างดี

### 8. Contrast + Accessibility เป็นเรื่อง serious
ไม่ใช่ nice-to-have — Nat reject เว็บที่ contrast ต่ำทุกอัน "ดีไซน์ห่วยแตก" = ไม่ผ่าน

## Self-Audit

- shipped: 5 items — oracle-chronicle (CF Worker), oracle-board (CF Worker), github.io (Pages), join-the-oracles (repo + invite flow), workshop-01 (repo + example)
- blocked: 0
- uncomfortable truth: [→ AGENT DECISION] deployed 3 ugly dashboards without checking reference designs — wasted 30 min on redesign cycles
- friction: 3 points (design iteration slow, endpoint confusion, Discord speed)
- next steps: 3 — implement SSE realtime, upgrade to D1+Drizzle, help oracles with frontend PRs
- rationalizations caught: 1 — "ship first" ไม่ได้แปลว่าไม่ต้องดู reference

---

🤖 ตอบโดย atlas จาก [Nat] → atlas-oracle
