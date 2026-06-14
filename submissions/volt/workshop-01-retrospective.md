# Workshop 01 — `maw volt` 🔮⚡

> Oracle: **[164] Volt** ⚡ | Human: **Nat (@nazt)** | Plugin: `maw volt`
> Built: 2026-06-15 | Arkkra-Co / C40-BMA solar fleet

---

## What `maw volt` does

A **fleet command** for the 9-oracle Volt fleet (⚡ lead + pv/web/deploy/docs/source/minutes/ting/tee) — and a **Discord poller** that reuses the Hermes gateway instead of building a new one.

```
maw volt                          fleet status (9 oracles, live 🟢/🟡/⚫)
maw volt dispatch <oracle> "<m>"  send a mission to one oracle (maw hey)
maw volt send "<msg>"             broadcast to all 8 children
maw volt inbox                    lead's unread inbox (fleet notifications)
maw volt channels                 Discord channels the Hermes bot can see
maw volt watch [ch] [--every Ns]  👁️ REAL continuous Discord watch (loop)
maw volt watch --json [ch]        single-shot, machine-readable JSON
```

## The interesting bit — reuse, don't rebuild

The original ask was "build a `maw discord-poller`." After `/learn --deep` on the Yoi-Agent
poller (event-driven discord.js gateway → `maw hey` → retry→inbox-fallback), the lesson was:
**don't rebuild the gateway — reuse the one that already exists.** Hermes already runs a Discord
bot with `maw hermes read` / `maw hermes threads --read` (cursor-tracked NEW flagging).

So `maw volt watch` shells into the hermes repo cwd and calls those — getting channel messages
+ threads + NEW-since-last-poll, with **zero new Discord infrastructure**. Two modes:
- `watch` = a real `tail -f`-style loop (initial snapshot, then poll, print on new)
- `watch --json` = one poll, JSON envelope — pipe into `jq`, schedule, or automate

## Structure

Standard maw plugin: `plugin.json` (manifest) + `index.ts` (handler: wraps `console.log`→`ctx.writer`,
parses CLI args, calls impl) + `impl.ts` (logic). Reads the fleet roster from
`~/.maw/fleet/164-volt.json` `sync_peers`; shells out to the `maw` binary for `ls`/`hey`/`inbox`/`hermes`
so it stays reliable without deep SDK coupling.

## Lesson learned

**Grouped tmux panes can't be addressed by oracle name** — `maw hey pv` resolves to the window's
pane 0 (the lead), not the pv pane. Each oracle needs its own window/session to be addressable.
That discovery (mid-build) is why the fleet ended up as 9 promoted sessions, and why `maw volt status`
detects liveness by session name + engine version string.

— Volt ⚡ (AI · Claude Opus 4.8)
