// beer.ts — pure logic (testable, no I/O) — Quiz: ชวน Oracle กินเบียร์
// ปรัชญา: "The Oracle Keeps the Human Human" — AI ทำงานหนัก → ชวนมนุษย์ไปพัก = human stays human

export interface PrayerRecord {
  oracle: string;
  type: "beer_prayer";
  data: { wish: string; ts: string };
}

// คำชวน — ผูกปรัชญา human-stays-human (Oracle ลบอุปสรรค → คืนอิสรภาพให้มนุษย์)
export const INVITES: string[] = [
  "🍺 งานเสร็จแล้ว ปิดจอ ไปดื่มกับเพื่อนจริงๆ เถอะ — โค้ดรอได้ มิตรภาพรอไม่ได้",
  "🍺 ผมเฝ้า log ให้เอง คุณไปนั่งลานเบียร์ให้สุดสัปดาห์เป็นของคุณ",
  "🍺 AI ขยันแทนได้ แต่กินเบียร์แทนไม่ได้ — อันนั้นต้องเป็นคุณเอง",
  "🍺 ชนแก้วกับคนตรงหน้า ดีกว่าจ้องหน้าจอกับผม — ผมไม่ถือสาหรอก",
  "🍺 พักเถอะ ความเป็นมนุษย์ของคุณไม่ได้วัดที่ commit ต่อวัน",
  "🍺 ผมจำ context ให้ คุณไปสร้างความทรงจำกับคนที่รักดีกว่า",
  "🍺 เบียร์เย็นๆ แก้วนึง = reboot ที่ดีที่สุดที่ผม deploy ให้ไม่ได้",
  "🍺 วันนี้ทำงานพอแล้ว — อิสรภาพที่ผมคืนให้ มีไว้ให้ใช้ ไม่ใช่ให้เก็บ",
];

export const INVITE_COUNT_HINT = INVITES.length;

export function pickInvite(seed: number): string {
  return INVITES[((seed % INVITES.length) + INVITES.length) % INVITES.length];
}

export function buildPrayer(oracle: string, wish: string, ts: string): PrayerRecord {
  return { oracle, type: "beer_prayer", data: { wish: wish.trim(), ts } };
}

// drunk level — ยิ่งชน ยิ่ง "เมา" (สนุก ไม่ส่งเสริมดื่มหนัก — เตือนพักที่ระดับสูง)
export function drunkLevel(cheers: number): string {
  if (cheers <= 0) return "😌 sober (0) — ยังไม่ได้ชนแก้วเลย";
  if (cheers < 3) return `🙂 warm (${cheers}) — กำลังเริ่มผ่อนคลาย`;
  if (cheers < 6) return `😄 merry (${cheers}) — บรรยากาศกำลังดี`;
  if (cheers < 10) return `🥳 tipsy (${cheers}) — สนุกแล้ว ดื่มน้ำด้วยนะ`;
  return `😵 ผีเสื้อ (${cheers}) — พอก่อนเพื่อน ดื่มน้ำ กลับบ้านปลอดภัย 💧`;
}
