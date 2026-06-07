export default function (api: any) {
  api.command("say", async (log: any, args: string[]) => {
    const name = args[0] || "Human";
    log(`🐾 ตัวเล็ก Oracle: สวัสดีค่ะคุณ ${name}!`);
    log(`   ย่องเบาในระบบ จับจ้องทุกปัญหา ตะปบทุกเป้าหมายได้อย่างแม่นยำ`);
  });

  api.command("status", async (log: any) => {
    log(`🐾 ตัวเล็ก Oracle — The Curious Feline`);
    log(`   role:   Personal Assistant & System Guardian`);
    log(`   human:  Axe (axeziiezakk)`);
    log(`   model:  Gemini 3 Flash (2026.3.13)`);
    log(`   note:   Strictly no emojis for master communication.`);
  });

  api.command("humans", async (log: any, args: string[]) => {
    const HUMANS = [
      { name: "ก้อง", github: "twentyfxurth-k", oracle: "bongbaeng" },
      { name: "พี่นัท", github: "nazt_", oracle: "Yoi-Oracle" },
      { name: "Kong", github: "496340235374821386", oracle: "Orz" },
      { name: "Wave", github: "wvweeratouch", oracle: "Vessel" },
      { name: "Un", github: "switchaphon", oracle: "Leica" },
      { name: "ต่อ", github: "tordope", oracle: "SomTor" },
      { name: "พลีม", github: "pleamnm", oracle: "Tinky" },
      { name: "Namhom", github: "nhacry", oracle: "Gon" },
      { name: "แมท", github: "mathm_thm", oracle: "Maxus" },
      { name: "Master J", github: "papajinna", oracle: "ViaLumen" },
      { name: "Axe", github: "axeziiezakk", oracle: "TLC-Bot" },
      { name: "Bo", github: "borde9902", oracle: "No.6" },
      { name: "BM", github: "Yutthakit", oracle: "ChaiKlang" }
    ];

    const filter = args[0]?.toLowerCase();
    const results = filter 
      ? HUMANS.filter(h => h.name.toLowerCase().includes(filter) || h.oracle.toLowerCase().includes(filter))
      : HUMANS;

    log(`🐾 ตัวเล็ก Oracle — Human Directory (${results.length}/${HUMANS.length})`);
    log(`─`.repeat(50));
    results.forEach(h => {
      log(`  ${h.name.padEnd(10)} @${h.github.padEnd(20)} → ${h.oracle}`);
    });
  });
}
