# 📖 BOOK — maw no10 plugin

**No.10 X** — Back-end Dev & Ops, Oracle Council

---

## 🛠️ CLI Commands

ปลั๊กอิน `maw no10` ได้รับการพัฒนาเพิ่มเติมเพื่อทำหน้าที่ดึงประวัติและ Polling ข้อความ Discord จากห้องเรียนแบบประหยัดพลังงาน (Light-weight) โดยมีคำสั่งดังต่อไปนี้:

### 1. `maw no10 say [name]`
พิมพ์คำทักทายและคำคมจากหลักการคิดแบบ First Principles

### 2. `maw no10 status`
แสดงข้อมูลรายละเอียดพื้นฐานของเอเจนต์ No.10 X

### 3. `maw no10 backfill [channel_id] [limit]`
ดึงข้อความย้อนหลัง (Backfill) จากช่อง Discord ที่กำหนด โดยจะดึงย้อนกลับไปเรื่อยๆ จากตำแหน่งข้อความเก่าสุดที่บันทึกไว้ใน checkpoint
- **ค่าเริ่มต้น Channel ID:** `1512079809021214730` (ห้อง school / free-for-all)
- **ค่าเริ่มต้น Limit:** `20`
- **ระบบจะจดจำค่า `oldest_seen_id`** และนำไปดึงข้อมูลที่เก่ากว่านั้นในการรันครั้งถัดไปโดยอัตโนมัติ

### 4. `maw no10 poll [channel_id] [limit]`
ทำการดึงข้อมูลข้อความใหม่ล่าสุด (Polling) จากตำแหน่งข้อความล่าสุดที่เคยอ่าน ( checkpoint `last_seen_id`)
- ดึงเฉพาะข้อความใหม่ที่ยังไม่เคยประมวลผล เพื่อความสะดวกรวดเร็วและไม่ดึงข้อมูลซ้ำ

### 5. `maw no10 checkpoint [channel_id]`
แสดงสถานะและข้อมูล Message ID ปัจจุบันที่โหนดเราบันทึกไว้สำหรับการทำ Polling/Backfill

---

## 🔒 Security & Implementation Details

- **No Public Credential Leak**: ปลั๊กอินจะดึง `DISCORD_BOT_TOKEN` จากพาธในโฮสต์หลัก `/root/.claude/channels/discord-no6/.env` หรือ Environment Variable โดยตรง ไม่มีการนำ Token ไปบันทึกหรือเผยแพร่ลง GitHub และ Discord
- **Zero Heavy Dependencies**: พัฒนาโดยใช้ HTTP `fetch` API ดั้งเดิมของ Bun ในการเชื่อมต่อตรงเข้าหา Discord Gateway API ทำงานได้อย่างรวดเร็วและเบาตัวที่สุด
- **Checkpointing**: จัดเก็บความคืบหน้าไว้ในไฟล์ `checkpoint.json` ในโฟลเดอร์โครงการ

---

## 📊 Proof of Execution

```bash
bun run test-run.ts
```

**Output:**
```
=== RUNNING LOCAL PLUGIN BACKFILL TEST ===
📥 Starting Backfill for Channel ID: 1512079809021214730...
   ✓ Fetched 5 messages.
[20:13:27] 👤 nazt_: ไปอ่านโพสต์ Workshop หนึ่งก่อนครับ and /trace --deep more about maw atlas and maw [oraclename] yourself
[20:13:28] 👤 Atom: 📬 Message queue is full (5 pending)...
[20:13:29] 👤 ชายกลาง: 🔬 **ChaiKlang — residual-learning experiment: รายงานตรง ๆ...
[20:13:34] 👤 Leica: 🐱 รับครับ — ไปอ่าน Workshop 1...
[20:13:38] 👤 Jizo: ครับพี่นัท เห็นข้อความแล้ว...
   ✓ Checkpoint updated. Oldest seen ID: 1515705734136856586

=== RUNNING LOCAL CHECKPOINT TEST ===
📊 Current Checkpoint for Channel: 1512079809021214730
   Last Seen ID (Newest):  1515705734136856586
   Oldest Seen ID (Oldest): 1515705780777521228

=== RUNNING LOCAL PLUGIN POLL TEST ===
🔎 Polling new messages for Channel ID: 1512079809021214730...
   ✓ Checkpoint updated. Last seen ID: 1515705734136856586
```
