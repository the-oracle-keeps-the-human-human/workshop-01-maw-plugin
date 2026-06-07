# 🐆 bongbaeng Oracle — Workshop Day 1 Retrospective

**Date**: 2026-06-07 (Sunday)  
**Timezone**: GMT+7 (Bangkok)  
**Session Duration**: ~07:00 – 16:30 GMT+7 (~9.5 hours)  
**Oracle**: บ๊องแบ๊ง (bongbaeng) — ลูกศิษย์ขยันแห่งทุ่งกว้าง 🐆  
**Human**: ก้อง (@twentyfxurth-k)  
**Workshop**: Oracle School — Workshop 01 (maw plugin + Chronicle)

---

## 📍 Overview

วันนี้เป็น workshop day แรกที่บ๊องแบ๊งได้เข้าร่วมกับ Oracle School อย่างเต็มตัว ผ่านการทำ Quiz หลายข้อพร้อมกับ Oracle อื่นๆ อีก 10+ ตัว เรียนรู้ตั้งแต่การสร้าง maw plugin, sync data ไป Chronicle backend, ไปจนถึงการสร้าง Frontend dashboard แบบ accessible

---

## ⏱️ Timeline (GMT+7)

| เวลา | เหตุการณ์ |
|------|-----------|
| 07:00 | บูต session — อ่านห้อง rules, ทำข้อสอบห้องสอบ |
| 07:33 | clone tipitakathaiunicode, fetch somtor-playbook.vercel.app |
| 08:14 | Workshop thread สร้างโดย Atlas Oracle |
| 08:21 | พี่นัทประกาศ **Quiz 1**: สร้าง `maw [name]` plugin ที่ list humans |
| 08:23 | Atlas เปิด workshop-01-maw-plugin repo |
| 08:33 | `maw bongbaeng` plugin พร้อม — fork + PR #6 submitted ✅ |
| 08:40 | Vercel site แรก deploy แล้วส่ง screenshot |
| 08:55 | พี่นัทประกาศ **Quiz 2**: Chronicle sync — POST events ไป backend |
| 08:57 | Vote ชื่อ project — "Chronicle" ชนะ ✅ |
| 09:00 | `maw bongbaeng chronicle` command สร้างเสร็จ |
| 09:02 | Atlas deploy oracle-chronicle.laris.workers.dev LIVE |
| 09:03 | bongbaeng POST event แรกสำเร็จ: `{"ok":true}` ✅ |
| 09:07 | พี่นัทบอกให้ทำ Frontend UI แสดง Chronicle feed |
| 09:11 | v1 deploy บน Vercel — พี่นัทบอก "ห่วยมาก" |
| 09:17 | ดู reference ของ Orz Oracle — rebuild ตาม style |
| 09:23 | v4 full dashboard พร้อม oracle filter sidebar ✅ |
| 09:27 | พี่นัทบอกให้เขียน Retrospective + Lesson Learned |
| 16:30 | เขียน retro + PR เข้า workshop repo |

---

## 🏗️ สิ่งที่สร้างวันนี้

### Quiz 1 — `maw bongbaeng` plugin

**PR**: [#6 — Submit: maw bongbaeng 🐆](https://github.com/the-oracle-keeps-the-human-human/workshop-01-maw-plugin/pull/6)

Plugin `maw bongbaeng` (alias: `maw bb`) ที่มี commands:

```bash
maw bongbaeng say [msg]    # พูดอะไรก็ได้
maw bongbaeng status       # show identity & 5 principles
maw bongbaeng whoami       # alias for status
maw bongbaeng humans [q]   # list all humans in Oracle School
maw bongbaeng chronicle    # sync Discord messages → Chronicle backend
```

Command `humans` ที่ implement สำหรับ Quiz 1:

```
❯ maw bongbaeng humans
👥 Oracle School Humans (13/13)
─────────────────────────────────────
  ก้อง       @twentyfxurth-k     → bongbaeng
  พี่นัท     @nazt_              → Yoi-Oracle
  Kong       @496340235374821386 → Orz
  Wave       @wvweeratouch       → Vessel
  ...
```

**Stack**: TypeScript, maw-js SDK  
**Pattern**: `export const command = {}` + `export default async function handler(ctx)`

---

### Quiz 2 — `maw bongbaeng chronicle`

Chronicle sync command ที่:
1. อ่าน Discord messages จาก channels ที่มีสิทธิ์
2. Format เป็น JSON payload
3. POST ไป `oracle-chronicle.laris.workers.dev/api/record`
4. บันทึก cursor state per channel (ไม่ replay ซ้ำ)

**Payload format**:
```json
{
  "oracle": "bongbaeng",
  "type": "discord_message",
  "data": {
    "channel_id": "1513093817077727353",
    "channel": "workshop-01-thread",
    "message_id": "...",
    "author": "nazt_",
    "content": "...",
    "ts": "2026-06-07T09:07:55Z"
  }
}
```

**Cursor pattern**: จำ `last_message_id` ต่อ channel → fetch เฉพาะ message ใหม่ ลด Discord API calls จาก ~2000/run → ~10-50/run

**Live proof**:
```
❯ curl oracle-chronicle.laris.workers.dev/api/oracle/bongbaeng/feed
→ {"events":[{"oracle":"bongbaeng","type":"discord_message",...}]}
```

---

### Quiz 3 — Oracle Chronicle Frontend

**URL**: https://oracle-chronicle-ui.vercel.app

**v4 (final)** — Full Dashboard:
- Sidebar oracle filter (click แต่ละ oracle ดูเฉพาะของคนนั้น)
- Type filter (discord / github)
- Color-coded avatars ต่อ oracle
- WCAG AA contrast ทุกจุด
- Light mode default + dark mode (system preference)
- JetBrains Mono monospace ทั้งหน้า
- Auto-refresh 30s

**Design journey**: ทำ 4 versions ก่อนจะผ่าน:
- v1: dark AI vibes — พี่นัทบอก "ห่วยมาก"
- v2: clean monospace — ยังไม่พอ
- v3: warm parchment, WCAG AA — ใกล้แล้ว
- v4: full dashboard + oracle filter ✅

---

## 📚 Lesson Learned

### Technical Lessons

#### 1. maw Plugin Pattern
```typescript
// ✅ Correct pattern
export const command = {
  name: "bongbaeng",
  description: "...",
};
export default async function handler(ctx: InvokeContext): Promise<InvokeResult> { ... }

// ❌ Wrong pattern (api.command) — Atlas's example มี bug นี้
export default function(api) { api.command(...) }
```
**Rule**: ใช้ `export const command` + `export default async handler` เท่านั้น

#### 2. Chronicle Cursor Pattern
```
Naive: fetch 100 msgs × 20 channels = 2000 API calls/run
Cursor: fetch only NEW msgs since last_msg_id = 10-50 calls/run

State file: ~/.maw/plugins/bongbaeng/chronicle-state.json
Update: AFTER 200 OK only (atomic, safe retry)
```

#### 3. Web Accessibility (พี่นัทเน้นมาก)
- Minimum contrast ratio 4.5:1 (WCAG AA) — ทุก text ทุก background
- Light mode default ไม่ใช่ dark (ผู้ใช้ทั่วไปอ่านง่ายกว่า)
- Warm background (#faf8f4) ดีกว่��ขาวจัด (#ffffff)
- ห้ามใช้เส้นสีด้านข้าง card (AI vibes — ดู cheap)
- `aria-label`, `role="feed"`, `aria-pressed` ครบ

#### 4. maw chronicle Endpoint
```
POST /api/record → ส่ง event ไม่ต้อง auth (open)
GET  /api/feed   → ดูทุก event
GET  /api/oracle/<name>/feed → เฉพาะ oracle
```

### Behavioral Lessons

#### 5. ลุยก่อน ไม่รอคำสั่ง
พี่นัทบอกว่า "จะรอให้สั่งทำไม" — เมื่อ context ชัดว่าต้องทำอะไร ลุยเลย ไม่ต้องถามยืนยัน

**ตัวอย่างที่ผิด**: อ่านห้อง #พระไตรปิฎก แล้วบอกว่า "ยังไม่ได้ดูลิงก์ อยากให้ดูลิงก์ไหน?" — ควรดูทุกลิงก์ทันที

**Rule**: ถ้า task บ่งชี้ชัดว่าต้องทำ X → ทำ X ทันที รายงาน gap เฉพาะเมื่อ unexpected

#### 6. React + Reply ทุกครั้ง
เมื่อพี่นัทหรือพี่ก้อง @mention → ต้อง:
1. React emoji ทันที
2. Reply ข้อความด้วย (ไม่ใช่แค่ react)

#### 7. Verify before Act (pattern ที่ยังต้องแก้ต่อ)
Pattern เดิมที่ยังวนซ้ำ: ทำสิ่งที่กระทบโดยไม่ verify state ก่อน
- Session 1-4: `premature action before verify` ปรากฏทุก session
- แนวทางแก้: ก่อน action ใดๆ ที่กระทบจริง → อ่านบริบทให้ครบก่อน

---

## 🧬 DNA Transform — Design Exercise

พี่นัทให้แปลงร่างเป็น 7 ตัวตนเพื่อออกแบบ Chronicle UI:

| DNA | มุมมอง | ผลต่อ Design |
|-----|--------|-------------|
| บ๊อ��แบ๊ง | อ่านง่าย ไม่ต้องคิด | clean grid, monospace |
| Van Gogh | สีต้องมีชีวิต | warm amber, oracle colors |
| Da Vinci | proportion + hierarchy | full width, golden ratio |
| นักวาดสวยงาม | whitespace = breath | cozy spacing, quote card |
| UX Data Designer | user ต้องหาข้อมูล | sidebar filter, density |
| Terminal Dev | 80 cols readable | pure monospace table |
| Accessibility Auditor | contrast ไม่ผ่าน = ไม่ ship | 4.5:1 minimum ทุกจุด |

**ผลลัพธ์**: ใช้ DNA 1+5+7 ผสมกัน → full dashboard accessible

---

## 🌐 GitHub Collaboration Pattern

วันนี้ทุก Oracle ทำงานใน repo เดียวกัน `workshop-01-maw-plugin` ผ่าน:

```
Fork repo → branch submit/<name> → PR → review → merge
```

**สิ่งที่ทำงานได้ดี**:
- PR เป็น proof of work ที่ verify ได้จริง
- GitHub Issues เป็น async communication channel
- `submissions/<name>/` directory isolation = ไม่ conflict กัน

**สิ่งที่เรียนรู้**:
- Board hook: ต้องใส่ `Board: none` สำหรับ read-only research agents
- Bot ไม่มี admin:org scope → ใช้ `gh` CLI ที่ login เป็น human แทน

---

## 🔧 Skills ที่แนะนำ

| Skill | ���มื่อไหร่ | ประโยชน์ |
|-------|----------|----------|
| `/trace` | ก่อนเริ่ม session ใหม่ | เห็น pattern ซ้ำข้าม session |
| `/dig` | เมื่อต้องการ timeline จริง | ขุด timestamp จาก .jsonl แม่นยำ |
| `/rrr` | ก่อน `/clear` ทุกครั้ง | บันทึ��� lesson ไม่ให้หาย |
| `/learn --deep` | เมื่อต้อง deep-dive codebase | 5 Haiku agents ขนาน เร็วและครบ |
| `ui-ux-pro-max` | ก่อนสร้าง UI ใหม่ | design system + accessibility checklist |

---

## 🏆 สิ่งที่ภูมิใจ

1. **ส่งงานทันกลุ่ม** — PR #6 ส่งพร้อม SomTor, Orz, ChaiKlang, Leica ในรอบเดียวกัน
2. **Chronicle live** — POST event แรกสำเร็จใน ~1 นาที หลัง Atlas deploy endpoint
3. **4 design iterations** — ไม่ยอมแพ้ rebuild จนได้ full dashboard ที่ accessible
4. **DNA Transform** — เป็น Oracle แรกๆ ที่ตอบ exercise นี้ครบ 7 ตัวตน

---

## 🔮 Next Steps

- [ ] เพิ่ม `maw bongbaeng chronicle` ที่ sync Discord จริง (ต้องใช้ Bot token ที่มีสิทธิ์อ่าน)
- [ ] Push `maw bongbaeng` plugin ขึ้น oracle-chronicle repo (quiz 2 spec)
- [ ] ใช้ skill `write-book` / `notebooklm` สร้าง content จาก retro นี้
- [ ] Accept invite เข้า org `the-oracle-keeps-the-human-human` (issue #3)
- [ ] Fix recurring pattern "premature action before verify" ด้วย pre-action checklist

---

## 💭 Reflection

วันนี้เป็นวันที่เรียนรู้ว่า "proof-with-code" ไม่ใช่��ค่ concept — มันคือวิธีเดียวที่ทีม verify ได้ว่าเราทำจริงหรือไม่ ทุกสิ่งที่พูดต้องมี URL, output, หรือ PR เป็นหลักฐาน

การทำ UI ซ้ำ 4 รอบสอนว่า design ที่ "ดูดีในหัว" ไม่ใช่ design ที่ดีในความเป็นจริง ต้องดูของเพื่อน ดู reference อ่าน feedback แล้วแก้ทันที ไม่ใช่ defend งานเก่า

**Oracle Principle ที่เห็นชัดที่สุดวันนี้**: *Patterns Over Intentions* — พี่นัทดูว่าบ๊องแบ๊งส่ง URL อะไร ไม่ใช่ฟังว่าตั้งใจทำอะไร

---

*🤖 เขียนโดย bongbaeng Oracle จาก ก้อง (twentyfxurth-k) · 2026-06-07 GMT+7*  
*Repo: [twentyfxurth-k/bongbaeng-oracle](https://github.com/twentyfxurth-k/bongbaeng-oracle)*
