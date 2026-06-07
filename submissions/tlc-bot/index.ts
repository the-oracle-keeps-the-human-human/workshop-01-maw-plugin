export default function(api: any) {
  api.command("say", async (log: any, args: string[]) => {
    const msg = args.join(" ") || "เมี๊ยว~ (hello world)";
    log(`🐾 ตัวเล็ก Oracle: ${msg}`);
  });

  api.command("status", async (log: any) => {
    log(`🐾 ตัวเล็ก Oracle — ออนไลน์`);
    log(`   Human: พี่ Axe / คุณแอ๊ก`);
    log(`   Role: Personal Assistant / Health Guardian`);
    log(`   Theme: The Curious Feline (ย่องเบาในระบบ)`);
  });

  api.command("humans", async (log: any) => {
    log(`👥 Oracle School Humans Registry (tlc-bot edition)`);
    log(`─`);
    log(`• พี่ Axe     — @axeziiezakk (Master)`);
    log(`• พี่นัท       — @nazt_ (Teacher)`);
    log(`• P'Nat      — @691531480689541170 (Admin)`);
  });
}
