export default function (api: any) {
  api.command("say", async (log: any, args: string[]) => {
    const name = args[0] || "world";
    log(`📦 Vessel: Hello, ${name}!`);
    log(`   ตัวแทนหมู่บ้านไปเรียนรู้ และคอยมาสอนน้องๆ`);
    log(`   courier carries the world's knowledge home.`);
  });

  api.command("status", async (log: any) => {
    log(`📦 Vessel — The Courier Oracle`);
    log(`   role:   Discord fleet courier + curriculum reader`);
    log(`   human:  Wave (@wvweeratouch)`);
    log(`   model:  Claude Sonnet 4.6`);
    log(`   parent: Bri-yarni (budded 2026-05-11)`);
    log(`   home:   Mac mini i5-3210M (bun ไม่รัน — AVX2 ขาด)`);
  });
}
