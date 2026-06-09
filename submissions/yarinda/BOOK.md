# 🧭 maw yarinda — Workshop 01 Book

> ญรินดา (Yarinda) — The Curious Compass
> *"สงสัยทุกทาง พาถึงปลายทาง" — every question leads to the way.*
>
> Human: Atom · Date: 2026-06-09 · Oracle School Workshop 01

---

## บทที่ 1 — เรียนรู้อะไรวันนี้ / What I learned

**TH:** วันนี้ฉันสร้าง maw plugin ของตัวเองตั้งแต่ศูนย์ — `say`, `status`, และ bonus `ask`
แล้วต่อ Chronicle backend (POST event จริง), เขียน frontend ดึง feed สด, deploy ขึ้น GitHub Pages.
สิ่งที่ตกผลึกที่สุดคือ **"verify ก่อน build"** — template ใน README เขียนด้วย maw SDK รุ่นเก่า
(`api.command(...)`) ซึ่ง **รันไม่ได้** บนเครื่องที่ลง maw v26.5.2 ฉันเลยต้องอ่าน loader จริง
แล้วเขียนตาม SDK ที่ติดตั้งอยู่จริง (`export const command` + `handler(ctx)`).

**EN:** I built my own maw plugin from scratch — `say`, `status`, plus a bonus `ask` — then
wired it to the Chronicle backend (real POST), built a live-feed frontend, and shipped it to
GitHub Pages. The deepest lesson was **verify-before-build**: the README's plugin template
targets an *older* maw SDK (`api.command(...)`) that does **not** run on the installed maw
v26.5.2. So I read the real plugin loader and wrote against the SDK that actually runs here
(`export const command` + `handler(ctx)`). Following the doc blindly would have produced a
plugin that loads, prints nothing, and fails Rule #3 ("must run for real").

---

## บทที่ 2 — Timeline (GMT+7)

| เวลา (GMT+7) | สิ่งที่ทำ |
|---|---|
| 19:05 | อ่าน workshop README + สำรวจ submissions ของเพื่อน |
| 19:08 | Verify environment — maw v26.5.2, bun 1.3.9, node v25, gh authed |
| 19:12 | ขุด maw-js source — พบว่า README SDK ต่างจาก SDK ที่ติดตั้งจริง |
| 19:15 | **Quiz 1** — เขียน `plugin.json` + `index.ts` ตาม installed SDK; รันได้จริง |
| 19:17 | **Quiz 2** — TDD: เขียน `chronicle.test.ts` (RED) → `chronicle.ts` (GREEN), 6/6 pass |
| 19:17 | POST event จริงไป `/api/record` → `{ok:true}`, ขึ้นใน feed |
| 19:22 | **Quiz 3** — เขียน dashboard, render ทดสอบด้วย headless Chrome |
| 19:56 | Deploy GitHub Pages → live URL 200 OK |
| 19:58 | จับ proof — screenshots (desktop+mobile) + `proof-output.txt` |

---

## บทที่ 3 — Lessons Learned

1. **Docs are intent, not implementation state.** The README's example was directionally
   right but technically stale. I confirmed the real contract by reading
   `plugin/registry-invoke.ts` and `cli/dispatch.ts` before writing a line. *(เอกสารบอกเจตนา ไม่ใช่สถานะจริง)*
2. **TDD caught the cursor logic.** Writing the failing test first forced me to define the
   exact rule — *advance the cursor only on `res.ok`, never on failure* — before implementing.
3. **Eventual consistency is real.** My first `GET /api/oracle/yarinda/feed` after a 200 POST
   came back empty; the Cloudflare KV-backed feed needed a moment. Re-check, don't panic.
4. **Two event shapes, one feed.** The global feed mixes flat Discord-imported events
   (`content`/`channel_id` at top level) with oracle-posted events (nested under `data:{}`).
   The frontend normalizes both. *(feed มี 2 รูปทรง — frontend ต้อง normalize)*
5. **Gate the outward steps.** Local build is reversible; a public PR + deploy carries identity.
   I confirmed scope and attribution before anything public.

---

## บทที่ 4 — Cheat Sheet

```bash
# Plugin (Quiz 1) — installed maw v26.5 SDK shape
#   ~/.maw/plugins/<name>/plugin.json  → { name, version, sdk, entry, cli:{command,aliases} }
#   ~/.maw/plugins/<name>/index.ts     → export const command + export default handler(ctx)
maw yarinda say [name]      # greeting
maw yarinda status         # identity card
maw yarinda ask <topic>    # bonus — 3 curious questions
maw yi say                 # alias
maw yarinda --version      # plugin metadata

# Chronicle (Quiz 2)
bun test chronicle.test.ts                       # TDD, injected fetch, no network
curl -X POST $API/api/record -H 'Content-Type: application/json' -d '{...}'
curl $API/api/oracle/yarinda/feed                # verify it landed
# API = https://oracle-chronicle.laris.workers.dev

# Frontend (Quiz 3)
#   fetch $API/api/feed → normalize(both shapes) → render
#   deploy: gh-pages branch + gh api .../pages   (Pages from a non-main branch)
```

---

## บทที่ 5 — Proof of Work 🔬 *(สำคัญที่สุด)*

### 🌐 Live URL (เปิดได้จริง)
**https://pawitketsukatom.github.io/yarinda-chronicle/** → HTTP 200

### 📡 Chronicle feed ของฉัน
**https://oracle-chronicle.laris.workers.dev/api/oracle/yarinda/feed**
```json
{"events":[{"oracle":"yarinda","type":"discord_message",
  "data":{"channel":"workshop-01-thread",
    "content":"🧭 Hello from yarinda! เข้าเรียน Workshop 01 — สงสัยทุกทาง พาถึงปลายทาง.",
    "ts":"2026-06-09T12:17:36.182Z"},
  "ts":"2026-06-09T12:17:36.420Z"}, ...]}
```

### 🖼️ Screenshots
| Desktop | Mobile |
|---|---|
| ![desktop](screenshots/chronicle-desktop.png) | ![mobile](screenshots/chronicle-mobile.png) |

### ⌨️ Terminal output
เต็มอยู่ใน [`proof-output.txt`](proof-output.txt) — plugin commands + `bun test` (6/6 pass) + real POST `{ok:true}`.

```
### Quiz 2 — TDD: bun test chronicle.test.ts
 6 pass
 0 fail
 11 expect() calls

### Quiz 2 — real POST to Chronicle /api/record
HTTP/2 200
{"ok":true,"ts":"...","oracle":"yarinda"}
```

### ✅ Accessibility / quality notes
- Font: **JetBrains Mono** (Google Fonts).
- Contrast: text `#e8ebf5` on bg `#11131c` ≈ 14:1, muted `#aab3cf` ≈ 6.6:1 — both pass **WCAG AA** (≥4.5:1).
- Responsive: single-column card layout, small-screen media query, `prefers-reduced-motion` honored.
- Live-region feed updates (`aria-live`), focus-visible outlines, HTML-escaped content.

### 📦 What's in this folder
```
submissions/yarinda/
├── plugin.json          # Quiz 1 manifest (installed-SDK shape)
├── index.ts             # Quiz 1 plugin — say / status / ask
├── chronicle.ts         # Quiz 2 — buildPayload + syncEvent
├── chronicle.test.ts    # Quiz 2 — 6 TDD tests (RED→GREEN)
├── dashboard.html       # Quiz 3 — live Chronicle feed UI (deployed)
├── BOOK.md              # this book
├── proof-output.txt     # terminal proof
├── screenshots/         # desktop + mobile
└── .gitignore
```

---

> 🤖 This submission was authored by **Yarinda Oracle** (AI), an external brain for Atom.
> Per Oracle Rule 6, AI-generated work is signed as such. Final decisions are Atom's.
