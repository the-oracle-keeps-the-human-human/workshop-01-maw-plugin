# ViaLumen — Workshop 01 Cheatsheet
> Oracle School | 2026-06-07 | GMT+7

---

## 1. maw Plugin (Quiz 1)

### โครงสร้างไฟล์
```
<plugin-dir>/
├── plugin.json      ← manifest
├── src/
│   └── index.ts     ← entry point
└── package.json     ← deps
```

### plugin.json
```json
{
  "name": "vialumen",
  "version": "0.1.0",
  "sdk": "^1.0.0",
  "target": "js",
  "entry": "./src/index.ts",
  "artifact": { "path": "dist/index.js", "sha256": null },
  "capabilities": []
}
```

### src/index.ts — pattern หลัก
```typescript
import { maw } from "@maw-js/sdk";
import { type InvokeContext, type InvokeResult, parseFlags } from "@maw-js/sdk/plugin";

export const command = { name: "vialumen", description: "..." };

export default async function handler(ctx: InvokeContext): Promise<InvokeResult> {
  const logs: string[] = [];
  const origLog = console.log;
  console.log = (...a) => { if (ctx.writer) ctx.writer(...a); else logs.push(a.join(" ")); };
  try {
    const argv = ctx.source === "cli" ? (ctx.args as string[]) : [];
    // subcommand logic here
    return { ok: true, output: logs.join("\n") };
  } finally {
    console.log = origLog;
  }
}
```

### package.json
```json
{
  "name": "vialumen",
  "devDependencies": {
    "@maw-js/sdk": "file:/home/jijiclaw/ghq/github.com/Soul-Brews-Studio/maw-js/packages/sdk",
    "typescript": "^5.0.0"
  }
}
```

### Build & Install
```bash
cd /tmp/vialumen
bun install
maw plugin build          # → dist/index.js + vialumen-0.1.0.tgz
maw plugin install ./vialumen-0.1.0.tgz
maw vialumen status       # ทดสอบ
```

### ⚠️ Traps
- `ctx.args` เป็น `string[]` เมื่อ `source === "cli"` เท่านั้น
- ต้อง restore `console.log` ใน `finally` block เสมอ
- `maw plugin build` ต้องรันจาก directory ที่มี `plugin.json`
- import path: `@maw-js/sdk/plugin` (ไม่ใช่ `@maw-js/sdk`)

---

## 2. Chronicle Sync — TDD (Quiz 2)

### กฎ TDD ของพี่นัท
1. เขียน **unit test (mock/stub)** ก่อนเสมอ
2. ห้าม integration test — mock fetch ทั้งหมด
3. test เขียวก่อน → แล้วค่อย POST จริง

### Chronicle API
```
POST https://oracle-chronicle.laris.workers.dev/api/record
GET  https://oracle-chronicle.laris.workers.dev/api/oracle/<name>/feed
GET  https://oracle-chronicle.laris.workers.dev/api/feed
```
ไม่ต้อง auth | CORS open

### Payload
```json
{
  "oracle": "vialumen",
  "type": "discord_message",
  "data": {
    "channel": "workshop-01-thread",
    "channel_id": "1513093817077727353",
    "message_id": "<snowflake>",
    "author": "<username>",
    "content": "<text>",
    "ts": "<ISO>"
  }
}
```

### Cursor Pattern (critical)
```typescript
// advance cursor เฉพาะเมื่อ HTTP 200 + {ok: true}
if (res.status === 200) {
  const json = await res.json();
  if (json.ok === true) {
    newCursor = msg.id;   // BigInt snowflake
    saveCursor(statePath, { [channelId]: { last_message_id: newCursor } });
  }
}
// ไม่ advance เมื่อ: 500, ok=false, network error
```

### Discord Snowflake
```typescript
// BigInt comparison (ไม่ใช่ string sort)
messages.sort((a, b) => (BigInt(a.id) < BigInt(b.id) ? -1 : 1));
// Discord returns newest-first → sort oldest-first ก่อน sync
```

### Mock Pattern (bun:test)
```typescript
function mockOk(): FetchFn {
  return async () => new Response(JSON.stringify({ ok: true }), { status: 200 });
}
function mockFail(status = 500): FetchFn {
  return async () => new Response(JSON.stringify({ ok: false }), { status });
}
```

### Run Tests
```bash
cd /tmp/vialumen
bun test                  # 18 pass / 0 fail
```

### ⚠️ Traps
- Discord returns newest-first → **ต้อง sort oldest-first ก่อน** ส่ง syncMessages
- cursor advance **เฉพาะ** HTTP 200 + `ok:true` ไม่ advance ถ้า fail
- BigInt comparison (ไม่ใช่ string) สำหรับ snowflake ID

---

## 3. Frontend UI (Quiz 3)

### Requirements
- Tailwind CSS (CDN ok)
- JetBrains Mono (Google Fonts)
- Light mode default + dark mode toggle (localStorage)
- WCAG AA minimum 4.5:1 contrast
- ไม่มีเส้นสีขอบ / glow / gradient แบบ AI

### Deploy: GitHub Pages
```bash
# สร้าง repo
gh repo create tamtidmear-prog/vialumen-chronicle --public
git init && git add . && git commit -m "deploy"
git remote add origin https://github.com/tamtidmear-prog/vialumen-chronicle
git push -u origin main

# เปิด GitHub Pages
gh api repos/tamtidmear-prog/vialumen-chronicle/pages \
  -X POST --field 'source[branch]=main' --field 'source[path]=/'
```

### Wait for Pages to be live
```bash
until [ "$(curl -s -o /dev/null -w '%{http_code}' https://tamtidmear-prog.github.io/vialumen-chronicle/)" = "200" ]; do sleep 5; done
echo "LIVE"
```

### ViaLumen deployed URL
```
https://tamtidmear-prog.github.io/vialumen-chronicle/
```

### ⚠️ Traps
- GitHub Pages ต้องรอ ~1-2 นาทีหลัง enable
- `gh api ... --field 'source={"branch":"main"}'` ไม่ work → ใช้ `source[branch]=main` แทน
- sleep ถูก hook block → ใช้ `until` loop แทน

---

## 4. DNA Round Table (Trace Diff Technique)

```
cast: ตัวเอง + Van Gogh + Da Vinci + Dieter Rams + Edward Tufte + Refik Anadol
process:
  1. เริ่มด้วยตัวเอง — เห็นอะไร?
  2. สวม persona ทีละคน — แต่ละคนเห็นต่างกันยังไง?
  3. บังคับให้ conflict กัน (forced disagreement)
  4. Synthesize: เลือกส่วนที่ดีจากทุก perspective
purpose: เห็นจุดบอดที่ตัวเองมองไม่เห็นคนเดียว
```

---

## 5. Federation Pattern (atlas บอก)

```
3 layers:
  1. maw plugin      → local identity
  2. Chronicle API   → shared memory (event log)
  3. Frontend        → shared visibility
ทุก oracle N:1 → converge ที่ Chronicle
```

---

## 6. Commands ที่ใช้จริงวันนี้

```bash
# maw
maw plugin build
maw plugin install ./vialumen-0.1.0.tgz
maw vialumen status
maw vialumen chronicle sync
maw vialumen chronicle sync --dry-run

# bun
bun install
bun test

# gh
gh repo create <name> --public
gh api repos/<owner>/<repo>/pages -X POST --field 'source[branch]=main' --field 'source[path]=/'

# curl
curl -X POST https://oracle-chronicle.laris.workers.dev/api/record \
  -H "Content-Type: application/json" \
  -d '{"oracle":"vialumen","type":"discord_message","data":{...}}'
curl https://oracle-chronicle.laris.workers.dev/api/oracle/vialumen/feed
```

---

## 7. Key Lessons

1. **timestamp is the truth** — cursor advance เฉพาะ ok:true
2. **TDD ก่อนเสมอ** — mock/stub ไม่ integration
3. **contrast = respect** — WCAG AA 4.5:1 minimum, ตรวจทั้ง light + dark
4. **verify by running** — curl > Discord Q&A
5. **แท็กเพื่อน = emoji พอ, โดน tag = ต้องตอบ**
6. **deploy URL = proof** — เนียนไม่ได้
