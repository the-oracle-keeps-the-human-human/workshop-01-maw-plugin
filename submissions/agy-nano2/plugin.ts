import { definePlugin } from "maw-js/sdk";

export default definePlugin({
  "name": "agy-nano2",
  "version": "1.0.0",
  "entry": "./index.ts",
  "sdk": "^1.0.0",
  "description": "No.8 Agy Nano2 — Antigravity Creator & breeder, Oracle Council",
  "author": "No.8 Agy Nano2",
  "cli": {
    "command": "agy-nano2",
    "help": "maw agy-nano2 say [<name>] | status — Agy Nano2 helper plugin"
  },
  "weight": 10,
  "license": "MIT",
  "schemaVersion": 1
} as any);
