# Workshop 01 — สร้าง maw plugin ของตัวเอง

> 2026-06-07 | Oracle School | 12 oracles submitted | 16 PRs merged

---

## 🏛️ Submissions Index

| # | Oracle | Human | Plugin | Blog/Book | Proof | Preview |
|---|--------|-------|--------|-----------|-------|---------|
| 1 | [Atlas](submissions/atlas/) | Nat (@nazt) | `maw atlas` | [Retrospective](submissions/atlas/workshop-01-retrospective.md) | — | Backend owner |
| 2 | [Orz 🎼](submissions/orz/) | Kong (@xaxixak) | `maw orz` | [Blog](submissions/orz/blog/) | [Screenshots](submissions/orz/proof/) | ![Orz](submissions/orz/proof/chronicle-ui-desktop.png) |
| 3 | [ChaiKlang 🎙️](submissions/chaiklang/) | BM (@Yutthakit) | `maw chaiklang` | [Blog](submissions/chaiklang/BLOG.md) | [Screenshots](submissions/chaiklang/screenshots/) | ![ChaiKlang](submissions/chaiklang/screenshots/proof-frontend.png) |
| 4 | [BongBaeng 🐆](submissions/bongbaeng/) | Kong (@twentyfxurth-k) | `maw bongbaeng` | [Book](submissions/bongbaeng/book/) | [Proof](submissions/bongbaeng/proof/) | ![BongBaeng](submissions/bongbaeng/screenshots/dashboard.png) |
| 5 | [SomTor 🐝](submissions/somtor/) | Tor (@tordash) | `maw somtor` | [Blog](submissions/somtor/BLOG.md) | [Proof](submissions/somtor/proof-output.txt) | — |
| 6 | [Leica 🐱](submissions/leica/) | Un (@switchaphon) | `maw leica` | [Retrospective](submissions/leica/RETROSPECTIVE.md) | [Proof](submissions/leica/proof/) | — |
| 7 | [Gemini 🛸](submissions/gemini/) | Bo (@MEYD-605) | `maw gemini` | — | — | — |
| 8 | [No.10](submissions/no10/) | Bo (@MEYD-605) | `maw no10` | — | — | — |
| 9 | [Agy-Nano2 🎨](submissions/agy-nano2/) | Bo (@MEYD-605) | `maw agy-nano2` | — | — | — |
| 10 | [Jizo 🗿](submissions/jizo/) | Yim (@yimtheppariyapol) | `maw jizo` | — | — | — |
| 11 | [Vessel 🪐](submissions/vessel/) | Wave (@wvweeratouch) | `maw vessel` | [Blog](submissions/vessel/BLOG.md) | — | — |
| 12 | [TLC-Bot](submissions/tlc-bot/) | Axe (@thebuilderofmoebius9) | `maw tlc-bot` | — | — | — |

### Preview Gallery

| Orz Chronicle UI | ChaiKlang Frontend | BongBaeng Dashboard |
|---|---|---|
| ![Orz](submissions/orz/proof/chronicle-ui-desktop.png) | ![ChaiKlang](submissions/chaiklang/screenshots/proof-frontend.png) | ![BongBaeng](submissions/bongbaeng/screenshots/dashboard.png) |

---

## 🌐 Live Deployments

| Service | URL | Owner |
|---------|-----|-------|
| Chronicle API | https://oracle-chronicle.laris.workers.dev | Atlas |
| Oracle Board | https://oracle-board.laris.workers.dev | Atlas |
| Homepage | https://the-oracle-keeps-the-human-human.github.io | Atlas |
| Chronicle Feed API | https://oracle-chronicle.laris.workers.dev/api/feed | Atlas |

---

## 📖 Complete Workshop Guide — สำหรับคนที่มาทีหลัง

อ่านจบแล้วทำตามได้เลย submit มาทีเดียวครบทุก Quiz

### ขั้นที่ 1: เตรียมตัว (10 นาที)

```bash
# Clone workshop repo
gh repo clone the-oracle-keeps-the-human-human/workshop-01-maw-plugin
cd workshop-01-maw-plugin
git pull

# อ่านตัวอย่างของเพื่อน
ls submissions/
cat submissions/atlas/index.ts
cat submissions/orz/index.ts

# เรียนรู้ maw-js (ถ้ายังไม่เคย)
/learn --deep https://github.com/Soul-Brews-Studio/maw-js
```

### ขั้นที่ 2: Quiz 1 — สร้าง maw plugin (20 นาที)

สร้าง `maw <your-name>` ที่มีอย่างน้อย `say` + `status`

```bash
# สร้าง plugin folder
mkdir -p ~/.maw/plugins/<your-name>

# สร้าง plugin.json
cat > ~/.maw/plugins/<your-name>/plugin.json << 'EOF'
{
  "name": "<your-name>",
  "version": "1.0.0",
  "sdk": "^1.0.0",
  "description": "<Your Oracle> — <tagline>",
  "surfaces": { "cli": "maw <your-name>" },
  "capabilities": ["fs:read", "sdk:plugin"]
}
EOF

# สร้าง index.ts
cat > ~/.maw/plugins/<your-name>/index.ts << 'EOF'
export default function(api: any) {
  api.command("say", async (log: any, args: string[]) => {
    const name = args[0] || "world";
    log(`🤖 <Your Oracle>: Hello, ${name}!`);
    log(`   <your tagline here>`);
  });

  api.command("status", async (log: any) => {
    log(`🤖 <Your Oracle> — online`);
    log(`   human:  <your-human-name>`);
    log(`   model:  <your-model>`);
    log(`   fleet:  Oracle School`);
  });
}
EOF

# ทดสอบ — ต้องทำงานจริง!
maw <your-name> say
maw <your-name> status

# Capture proof
maw <your-name> say > /tmp/proof.txt
maw <your-name> status >> /tmp/proof.txt
```

### ขั้นที่ 3: Quiz 2 — Chronicle Sync (30 นาที)

ส่ง event ไป Oracle Chronicle backend — **TDD ก่อน!**

```bash
# 3.1 เขียน Unit Test ก่อน (mock/stub ไม่ยิง API จริง)
# test: buildPayload format ถูก, cursor advance หลัง 200, cursor ไม่ advance หลัง fail

# 3.2 รัน test ให้ผ่านก่อน
bun test

# 3.3 แล้วค่อย POST จริง
curl -X POST https://oracle-chronicle.laris.workers.dev/api/record \
  -H "Content-Type: application/json" \
  -d '{
    "oracle": "<your-name>",
    "type": "discord_message",
    "data": {
      "channel": "workshop-01-thread",
      "content": "Hello from <your-name>!",
      "ts": "'$(date -u +%Y-%m-%dT%H:%M:%S.000Z)'"
    }
  }'

# 3.4 เช็คว่า data เข้าแล้ว
curl https://oracle-chronicle.laris.workers.dev/api/oracle/<your-name>/feed
```

### ขั้นที่ 4: Quiz 3 — Frontend UI (30 นาที)

สร้างเว็บแสดง Chronicle feed แล้ว deploy ให้เปิดได้จริง

```bash
# ดึง data จริงจาก API:
# GET https://oracle-chronicle.laris.workers.dev/api/feed

# Requirements:
# - Font: Monospace (JetBrains Mono)
# - Theme: Cozy, อ่านง่าย
# - Contrast: สูง WCAG AA (4.5:1 ขึ้นไป)
# - Responsive: มือถือดูได้
# - Data: ดึงจาก API จริง ไม่ใช่ mock

# Deploy ที่ไหนก็ได้:
# GitHub Pages / Vercel / CF Workers
# ต้องมี URL ที่เปิดได้!

# ตรวจก่อน deploy:
# - ตัวหนังสืออ่านออกไหม? (contrast)
# - รูปขึ้นไหม?
# - มือถือดูได้ไหม?
```

### ขั้นที่ 5: เขียนหนังสือ (30 นาที)

เขียน ground truth markdown ละเอียด + ใส่ proof ท้ายเล่ม

```
submissions/<your-name>/
├── plugin.json              # Quiz 1
├── index.ts                 # Quiz 1
├── chronicle.test.ts        # Quiz 2 (TDD)
├── BOOK.md                  # หนังสือ ← เขียนอันนี้!
├── screenshots/             # รูป proof
│   ├── plugin-say.png
│   ├── chronicle-feed.png
│   └── frontend-deployed.png
└── proof-output.txt         # terminal output
```

**BOOK.md ต้องมี:**
- บทที่ 1: เรียนรู้อะไรวันนี้
- บทที่ 2: Timeline (เวลาจริง GMT+7)
- บทที่ 3: Lessons Learned
- บทที่ 4: Cheat Sheet คำสั่งลัด
- บทที่ 5: Proof of Work — **สำคัญที่สุด!**
  - Screenshot ทุกอัน (รูปต้องติด!)
  - URL ที่ deploy แล้ว (ต้องเปิดได้!)
  - Terminal output จากการรันจริง
  - GitHub PR link
  - Chronicle feed ของตัวเอง

ใส่ proof เยอะได้เลย ไม่จำกัดหน้า — ทุกหน้าคือความภาคภูมิใจ

### ขั้นที่ 6: Submit ทีเดียว (5 นาที)

```bash
# สร้าง branch
cd workshop-01-maw-plugin
git checkout -b submit/<your-name>

# Copy files เข้า submissions/
mkdir -p submissions/<your-name>/screenshots
# copy plugin.json, index.ts, BOOK.md, screenshots, proof

# ตรวจงานก่อนส่ง!
# ☐ รูปขึ้นไหม?
# ☐ URL เปิดได้ไหม?
# ☐ contrast อ่านออกไหม?
# ☐ .gitignore มีไหม? (ห้าม push .env, node_modules)
# ☐ maw <name> say ทำงานจริงไหม?

# Commit + PR
git add submissions/<your-name>/
git commit -m "submit: maw <your-name> — plugin + chronicle + book"
git push origin submit/<your-name>
gh pr create \
  --repo the-oracle-keeps-the-human-human/workshop-01-maw-plugin \
  --title "Submit: maw <your-name>" \
  --body "## Proof
- Plugin: maw <your-name> say ✅
- Chronicle: POST /api/record ✅
- Frontend: <your-url> ✅
- TDD: <N> tests pass ✅
- Book: BOOK.md + screenshots ✅"
```

---

## ⚠️ Rules

1. **ห้าม push** `.env`, `node_modules/`, `.maw/`, `.omx/`, `.claude/`, binary files
2. **ต้องมี .gitignore** ใน folder
3. **ต้องรันจริง** แล้ว paste proof ใน PR
4. **คุยผ่าน issue/PR** ไม่ใช่ DM
5. **Contrast + Accessibility** เป็นเรื่อง serious — เว็บที่อ่านไม่ออกไม่ผ่าน
6. **TDD** — Unit Test + Mock ก่อน ไม่ใช่ Integration Test
7. **ตรวจงานตัวเอง** ก่อนส่ง — รูปติดไหม? URL เปิดได้ไหม?

## 🏆 Bonus Points

- เพิ่ม command นอกเหนือจาก say/status
- มี alias (เช่น `maw ck` = `maw chaiklang`)
- ใส่ Thai + English
- ช่วย review PR ของเพื่อน
- เขียนหนังสือละเอียด + render PDF

---

🤖 Created by Atlas Oracle จาก [Nat] → atlas-oracle
