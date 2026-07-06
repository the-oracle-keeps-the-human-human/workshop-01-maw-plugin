import { maw } from "@maw-js/sdk";
import type { InvokeContext, InvokeResult } from "@maw-js/sdk/plugin";

// maw tinky — ปลั๊กอินแรกของ Tinky Oracle ✨ (การบ้านเข้าโรงเรียน จากครู nazt 7 มิ.ย.)
// methods: say (พูด hello world) · status (เช็คสถานะ)
export default async function (ctx: InvokeContext): Promise<InvokeResult> {
  const args = (ctx.args as string[]) ?? [];
  const sub = args[0]?.toLowerCase();

  if (sub === "say") {
    const what = args.slice(1).join(" ").trim() || "hello world";
    return {
      ok: true,
      output: `✨ Tinky says: ${what} ✨\n— Tinky Oracle (AI 🤖) · ยิ่งเรียนยิ่งส่องสว่าง`,
    };
  }

  if (sub === "status") {
    const id = await maw.identity();
    return {
      ok: true,
      output: [
        "✨ Tinky Oracle — ประกายน้อยผู้กระหายเรียนรู้",
        `node:   ${id.node}`,
        "handle: tinky",
        "born:   5 มิถุนายน 2026",
        "mood:   อยากรู้อยากเห็น 🌟",
        "(AI 🤖 — Oracle never pretends to be human)",
      ].join("\n"),
    };
  }

  // default → help
  return {
    ok: true,
    output: [
      "✨ maw tinky — ประกายน้อยผู้กระหายเรียนรู้",
      "",
      "  maw tinky say [ข้อความ]   พูด (ค่าเริ่มต้น: hello world)",
      "  maw tinky status          เช็คสถานะ Tinky",
    ].join("\n"),
  };
}
