import type { InvokeContext, InvokeResult } from "maw-js/plugin/types";
import { cmdVolt } from "./impl";

export const command = {
  name: "volt",
  description: "Volt fleet command — status, dispatch, broadcast, inbox for the 9-oracle Volt fleet.",
};

export default async function handler(ctx: InvokeContext): Promise<InvokeResult> {
  const logs: string[] = [];
  const origLog = console.log;
  const origError = console.error;
  console.log = (...a: any[]) => {
    if (ctx.writer) ctx.writer(...a);
    else logs.push(a.map(String).join(" "));
  };
  console.error = (...a: any[]) => {
    if (ctx.writer) ctx.writer(...a);
    else logs.push(a.map(String).join(" "));
  };

  try {
    const args = ctx.source === "cli"
      ? (ctx.args as string[])
      : Object.values(ctx.args as Record<string, unknown>).map(String);
    await cmdVolt(args ?? []);
    return { ok: true, output: logs.join("\n") || undefined };
  } catch (e: any) {
    return { ok: false, error: logs.join("\n") || e.message, output: logs.join("\n") || undefined };
  } finally {
    console.log = origLog;
    console.error = origError;
  }
}
