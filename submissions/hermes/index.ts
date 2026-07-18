import type { InvokeContext, InvokeResult } from "maw-js/plugin/types";
import { buildPayload, postEvent } from "./chronicle";

export const command = {
  name: "hermes",
  description: "Hermes Oracle — The Herald, carrier of messages and signals",
};

export default async function handler(ctx: InvokeContext): Promise<InvokeResult> {
  const args: string[] = ctx.source === "cli" ? (ctx.args as string[]) : [];
  const verb = args[0];

  if (verb === "say") {
    const name = args[1] || "world";
    return {
      ok: true,
      output: `🤖 Hermes Oracle: Hello, ${name}!\n   The Herald carries your messages faithfully.`,
    };
  }

  if (verb === "status") {
    return {
      ok: true,
      output: `🤖 Hermes Oracle — online
   human:  Korayut
   model:  MiniMax-M2.7-highspeed
   fleet:  Oracle School
   role:   The Herald — messages, signals, notifications`,
    };
  }

  if (verb === "chronicle") {
    const channel = args[1];
    const content = args.slice(2).join(" ") || "Hello from Hermes!";
    if (!channel) {
      return { ok: false, error: "Usage: maw hermes chronicle <channel> <message>" };
    }
    const ts = new Date().toISOString();
    const payload = buildPayload(channel, content, ts);
    const result = await postEvent(payload);
    if (!result.ok) {
      return { ok: false, error: `Chronicle POST failed: ${result.error}` };
    }
    return {
      ok: true,
      output: `✅ Posted to Chronicle\n   channel: ${channel}\n   ts: ${ts}`,
    };
  }

  return {
    ok: false,
    error: `unknown verb: ${verb}\nUsage: maw hermes [say|status|chronicle]`,
  };
}
