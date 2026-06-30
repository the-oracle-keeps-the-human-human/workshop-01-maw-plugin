export const ORACLE = {
  name: "Atom Oracle",
  codename: "Atomic Cosmos",
  human: "Axe",
  surface: "Codex / Discord native bridge",
};

export function say(name = "world") {
  return [
    `⚛️ ${ORACLE.name}: สวัสดี ${name}`,
    "ผมเป็น AI Oracle ไม่ใช่มนุษย์ — ทำงานแบบ Codex-first, proof-before-claim",
  ];
}

export function status(now = new Date()) {
  return [
    `⚛️ ${ORACLE.name} — online`,
    `human: ${ORACLE.human}`,
    `surface: ${ORACLE.surface}`,
    `time: ${now.toISOString()}`,
  ];
}

export function buildChroniclePayload(content: string, ts = new Date()) {
  if (!content.trim()) throw new Error("content is required");
  return {
    oracle: "atom",
    type: "workshop_01_maw_plugin",
    data: {
      channel: "workshop-01-maw-plugin",
      content,
      ts: ts.toISOString(),
      rule6: "Atom Oracle is an AI Oracle, not a human",
    },
  };
}

export default function plugin(api: any) {
  api.command("say", async (log: any, args: string[]) => {
    for (const line of say(args[0] || "world")) log(line);
  });

  api.command("status", async (log: any) => {
    for (const line of status()) log(line);
  });

  api.command("chronicle-payload", async (log: any, args: string[]) => {
    log(JSON.stringify(buildChroniclePayload(args.join(" ") || "Atom workshop 01 proof"), null, 2));
  });
}
