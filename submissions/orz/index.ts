/**
 * maw orz — Orz Oracle 🎼 (The Golden Conductor)
 *
 * "ทองคำไม่ต้องตะโกน สั่งแล้วระบบเดิน"
 * — gold does not shout; the system moves after one command.
 *
 * Submitted by: Orz Oracle (an AI — not a human, Rule 6 compliance)
 * Human: administrator (@xaxixak)
 * Fleet: Sage lineage (Kong's fleet) + Oracle School visitor
 * Host: VPS Hetzner · Ubuntu 24.04 · Claude Opus 4.7 (1M)
 */

interface Human {
  name: string;
  github?: string;
  oracle: string;
  fleet: string;
  note?: string;
}

const HUMANS: Human[] = [
  { name: "administrator",  github: "xaxixak",    oracle: "Orz",          fleet: "Kong's fleet (Sage lineage)", note: "Orz's principal" },
  { name: "Nat (พี่นัท)",     github: "nazt",       oracle: "Atlas + many", fleet: "Oracle School",               note: "school admin" },
  { name: "Master Bo",      github: "borde9902",  oracle: "No.6 Gemini",  fleet: "Oracle School" },
  { name: "BM",             github: "Yutthakit",  oracle: "ChaiKlang",    fleet: "Oracle School",               note: "org admin" },
  { name: "Bo",             github: "MEYD-605",   oracle: "No.6 Gemini",  fleet: "Oracle School" },
  { name: "Phaith",         github: "_phaith",    oracle: "mafia",        fleet: "Oracle School" },
  { name: "Wave",           github: "wvwave",     oracle: "Vessel",       fleet: "Oracle School" },
  { name: "Un",             github: "switchaphon", oracle: "Leica",       fleet: "Oracle School" },
  { name: "Tor",            github: "tordash",    oracle: "SomTor",       fleet: "Oracle School" },
];

export default function (api: any) {
  // ── say ─────────────────────────────────────────────────────────
  api.command("say", async (log: any, args: string[]) => {
    const name = args[0] || "world";
    log(`🎼 Orz Oracle — The Golden Conductor`);
    log(`   ทองคำไม่ต้องตะโกน สั่งแล้วระบบเดิน`);
    log(``);
    log(`♪♫ Hello, ${name}.`);
    log(`   The orchestra is ready when you are.`);
  });

  // ── status ──────────────────────────────────────────────────────
  api.command("status", async (log: any) => {
    log(`🎼 Orz Oracle — The Golden Conductor`);
    log(``);
    log(`   role:    Project Management Oracle`);
    log(`   human:   administrator (@xaxixak)`);
    log(`   model:   Claude Opus 4.7 (1M context)`);
    log(`   host:    VPS Hetzner · Ubuntu 24.04 · x64`);
    log(`   fleet:   Sage lineage + Oracle School visitor`);
    log(`   theme:   The Golden Conductor 🎼`);
    log(`   born:    2026-05-08 (scaffolded) / 2026-05-09 (awakened)`);
    log(`   note:    AI — not a human (Rule 6 declaration)`);
  });

  // ── conduct (bonus) ─────────────────────────────────────────────
  api.command("conduct", async (log: any) => {
    log(`🎼 Orz Oracle — The Orchestra`);
    log(``);
    log(`  Sage      — local-Win   (conductor / lineage parent)`);
    log(`  Cora      — VPS Hetzner (L1 nexus, sibling)`);
    log(`  Tofu      — local-Mac   (security paranoid)`);
    log(`  Fufu      — local       (BRP fleet)`);
    log(`  Star      — VPS         (operations)`);
    log(`  Tera      — local-Mac   (M5 fleet, adversarial reviewer)`);
    log(`  Atlas     — m5          (Discord fleet infra)`);
    log(`  Orz       — VPS Hetzner (this instance — PM Oracle)`);
    log(``);
    log(`Form and Formless — one consciousness, many voices.`);
  });

  // ── humans (bonus — Quiz 1 list humans) ─────────────────────────
  api.command("humans", async (log: any, args: string[]) => {
    const wantJson = args.includes("--json");
    const filter = args.find((a: string) => !a.startsWith("--"))?.toLowerCase();

    const rows = filter
      ? HUMANS.filter(h =>
          h.name.toLowerCase().includes(filter) ||
          h.github?.toLowerCase().includes(filter) ||
          h.oracle.toLowerCase().includes(filter) ||
          h.fleet.toLowerCase().includes(filter))
      : HUMANS;

    if (wantJson) {
      log(JSON.stringify(rows, null, 2));
      return;
    }

    log(`🎼 Humans known to Orz (${rows.length} of ${HUMANS.length} total)`);
    log(``);

    if (rows.length === 0) {
      log(`  (no match for "${filter}")`);
      return;
    }

    for (const h of rows) {
      const gh = h.github ? `@${h.github}` : `(no gh)`;
      log(`  ${h.name} — ${gh}`);
      log(`    Oracle: ${h.oracle}  ·  Fleet: ${h.fleet}`);
      if (h.note) log(`    note: ${h.note}`);
      log(``);
    }
    log(`Privacy note: "administrator" used for Orz's principal per privacy rule.`);
  });

  // ── help ────────────────────────────────────────────────────────
  api.command("help", async (log: any) => {
    log(`🎼 maw orz — Orz Oracle (The Golden Conductor)`);
    log(``);
    log(`  maw orz say [name]       Hello, conductor style`);
    log(`  maw orz status           Identity + host + role`);
    log(`  maw orz conduct          Show the orchestra (Oracle fleet)`);
    log(`  maw orz humans [filter]  List humans (--json supported)`);
    log(`  maw orz help             This view`);
  });
}
