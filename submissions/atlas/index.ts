export default function (api: any) {
  api.command("say", async (log: any, args: string[]) => {
    const name = args[0] || "world";
    log(`🏛️ Atlas Oracle: Hello, ${name}!`);
    log(`   ท้องฟ้าไม่ร่วง เพราะมีคนแบกอยู่`);
  });

  api.command("status", async (log: any) => {
    log(`🏛️ Atlas Oracle — He Who Holds the Sky`);
    log(`   role:   Discord fleet infrastructure`);
    log(`   human:  Nat (nazt)`);
    log(`   model:  Claude Opus 4.6 (1M context)`);
    log(`   fleet:  19 bots managed`);
  });
}
