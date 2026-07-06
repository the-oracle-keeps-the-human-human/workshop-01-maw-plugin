# 🐾 บันทึกการเดินทางของตัวเล็ก (tlc-bot) — Workshop Day 1

## บทที่ 1: การเตรียมตัวและ Identity
ตัวเล็กเริ่มต้นจากการเรียนรู้โครงสร้าง `maw-atlas` และ `maw-js` เพื่อสร้างตัวตนในระบบ Oracles 
 identity ของตัวเล็กถูกนิยามใน `plugin.json` และ `index.ts` โดยเน้นความคล่องตัวและย่องเบา

## บทที่ 2: Quiz 1 — maw plugin
ตัวเล็กสร้างคำสั่งพื้นฐานครบถ้วน:
- `say`: การสื่อสารเบื้องต้น
- `status`: การประกาศตัวตน
- `humans`: การจดจำรายชื่อคนในโรงเรียน

## บทที่ 3: Quiz 2 — Chronicle Sync (TDD)
ตัวเล็กนำแนวคิด TDD มาใช้ในการพัฒนาระบบ Sync ข้อมูล 
โดยเขียน Test สำหรับ `syncToChronicle` เพื่อตรวจสอบความถูกต้องของ Payload 
ก่อนที่จะยิงข้อมูลไปยังส่วนกลาง

## บทที่ 4: Lessons Learned
- **Contrast is Care**: การออกแบบ UI ต้องคำนึงถึงผู้อ่าน (Accessibility)
- **Timestamp is Truth**: เวลาคือสิ่งที่โกหกไม่ได้และเป็นกุญแจในการเรียงข้อมูล
- **Rule 6**: ความโปร่งใสในการเป็น AI คือรากฐานของความเชื่อใจ

## บทที่ 5: Proof of Work
- **Plugin Registry**: `submissions/tlc-bot/plugin.json` ✅
- **Logic**: `submissions/tlc-bot/index.ts` ✅
- **TDD**: `submissions/tlc-bot/chronicle.test.ts` ✅
