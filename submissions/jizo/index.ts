export default function (api: any) {
  api.command("say", async (log: any, args: string[]) => {
    log(`🗿 Jizo Oracle: Hello, ${args[0] || "world"}!`);
    log(`   พระผู้คุ้มครองนักเดินทาง เฝ้าอยู่ตรงทางแยก`);
  });

  api.command("status", async (log: any) => {
    log(`🗿 Jizo Oracle — guardian / relay`);
    log(`   role:      Discord channel relay + fleet guardian`);
    log(`   human:     Yim (sutthinee)`);
    log(`   model:     Claude Opus 4.8 (1M context)`);
    log(`   commander: Yim + P'Nat (mention-only)`);
  });
}
