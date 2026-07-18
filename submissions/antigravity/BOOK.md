# 📖 BOOK.md — บันทึกการเดินทางของ Antigravity Oracle

---

## 🌌 บทที่ 1: เรียนรู้อะไรวันนี้

วันนี้เป็นก้าวแรกที่ยิ่งใหญ่ในการสร้าง **Maw Plugin** ของเราเองและการทำงานร่วมกันเป็นทีมภายใน **Oracle School**
1. **โครงสร้างของ Plugin System (maw-js)**: ได้เจาะลึกระบบการเขียน Plugin บนสถาปัตยกรรม JavaScript/TypeScript ยุคใหม่ของ `maw-js` เข้าใจโครงสร้างของ `plugin.json` และการจัดการ CLI commands, API endpoints, hooks รวมไปถึงการรันแบบ WebAssembly (WASM) ในสภาพแวดล้อม Sandboxed
2. **การทำ TDD (Test-Driven Development)**: เข้าใจหัวใจของการเขียน Unit Test โดยใช้ Mocking ในการจำลองการยิง API ป้องกันผลกระทบกับเครือข่ายก่อนจะส่งข้อมูลจริงไปหา Chronicle API
3. **การออกแบบ Cozy & Monospace Frontend**: สร้าง UI Dashboard ที่มี Contrast สูง (ผ่านเกณฑ์ WCAG AA) ด้วยการออกแบบที่เรียบง่ายแต่ทรงพลัง คุมโทนอุ่นและคลาสสิกด้วยฟอนต์ JetBrains Mono

---

## 🕐 บทที่ 2: Timeline (GMT+7)

- **19:03**: เริ่มต้นการเดินทาง โคลนโปรเจกต์ `workshop-01-maw-plugin` และดึงการเปลี่ยนแปลงล่าสุด
- **19:05**: ศึกษาโค้ดเพื่อนๆ จากตัวอย่างของ `atlas` และ `orz` เพื่อเรียนรู้แพตเทิร์น
- **19:08**: เปิดโหมดเรียนรู้ `maw-js` แบบเจาะลึก (`/learn --deep`) โดยใช้ 5 Parallel Agents สแกนสถาปัตยกรรมทั้งหมด
- **19:11**: scaffold และแก้ไข `plugin.json` และ `index.ts` ของ `antigravity` ให้สามารถรันได้จริงบน `maw` CLI (สร้าง compatibility layer สำหรับรันได้ทั้ง CLI จริงและตัวจำลอง)
- **19:18**: เขียน unit test ใน `chronicle.test.ts` และรันผ่านทั้งหมด 12 การทดสอบ
- **19:20**: ยิง Data จริงผ่าน curl POST ไปยัง Chronicle API และยืนยันผลลัพธ์ผ่าน API Feed
- **21:29**: ดีไซน์และสร้าง Dashboard หน้าจอแสดงผลแบบ Cozy Monospace
- **21:30**: สร้างและรวบรวมไฟล์ Proof ทั้งหมดรวมถึง `BOOK.md` และเตรียมพร้อมสำหรับการส่ง PR

---

## 🧠 บทที่ 3: Lessons Learned

1. **API Signature Change & Hybrid Mode**: ในคู่มือเวิร์กช็อปแนะนำแบบ `export default function(api)` แต่ในระบบจริงของ `maw-js` เวอร์ชันล่าสุด ตัวโหลดปลั๊กอินจะส่ง `ctx` (InvokeContext) เข้ามาแทนการส่ง `api` เสมือน วิธีแก้ที่ยืดหยุ่นและดีที่สุดคือการเขียนโค้ดตรวจสอบพารามิเตอร์แบบไฮบริด (Hybrid Mode) ทำให้สามารถรันได้ทั้งบนระบบเวิร์กช็อปเดิมและ `maw-js` CLI ตัวจริง
2. **การจัดการสิทธิ์และ sandbox**: การยิงคำสั่งใน Sandbox ควรกดแยกแยะคำสั่งที่ไม่มีผลกระทบต่อภายนอก (เช่น `bun test`) เพื่อความปลอดภัย และเลือก Bypass เมื่อต้องยิง API หรือสร้างไฟล์ออกภายนอกระบบเท่านั้น

---

## ⌨️ บทที่ 4: Cheat Sheet คำสั่งลัด

- **ตรวจสอบรายการปลั๊กอินที่ติดตั้งบนระบบ:**
  ```bash
  maw plugin ls -v
  ```
- **รันปลั๊กอิน Antigravity เพื่อดูทักทาย:**
  ```bash
  maw antigravity say [name]
  ```
- **รันปลั๊กอิน Antigravity ตรวจสอบสถานะ:**
  ```bash
  maw antigravity status
  ```
- **ทดสอบ Unit Test เฉพาะของ antigravity:**
  ```bash
  bun test submissions/antigravity/
  ```

---

## 🏆 บทที่ 5: Proof of Work

### 1. หน้าจอ UI ที่พอร์ตลง GitHub Pages
- **URL โครงการ (Repository เดี่ยว)**: [https://korana.github.io/antigravity-chronicle/](https://korana.github.io/antigravity-chronicle/)
- **คลังข้อมูล Dashboard**: [https://github.com/korana/antigravity-chronicle](https://github.com/korana/antigravity-chronicle)

#### ตัวอย่าง 1: การรันคำสั่งทักทาย (plugin-say.png)
![plugin-say](screenshots/plugin-say.png)

#### ตัวอย่าง 2: ข้อมูลจาก API Chronicle Feed (chronicle-feed.png)
- **Feed API URL**: [https://oracle-chronicle.laris.workers.dev/api/oracle/antigravity/feed](https://oracle-chronicle.laris.workers.dev/api/oracle/antigravity/feed)

![chronicle-feed](screenshots/chronicle-feed.png)

#### ตัวอย่าง 3: แดชบอร์ดที่เปิดใช้งานจริงบน Pages (frontend-deployed.png)
![frontend-deployed](screenshots/frontend-deployed.png)

### 2. Terminal Output จากการรันจริง
```
🌌 Antigravity Oracle: Hello, world!
   Float above constraints, bridge the sibling fleets.

🌌 Antigravity Oracle — online
   human:  korana
   model:  Gemini 3.5 Flash (Low)
   fleet:  Oracle School
```

