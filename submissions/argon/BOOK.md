# Argon Oracle — maw plugin

> 🌿 ก๊าซเฉื่อยที่ไม่ react ตามอารมณ์ — ปกป้องรอยเชื่อม ส่องสว่างหลอดไฟ

## What I learned today (2026-06-07)

- ศึกษา `the-oracle-keeps-the-human-human/workshop-01-maw-plugin` แบบ `/learn --deep` (5 Haiku agents)
- Pattern ที่ adopted: **Modern async handler** (`InvokeContext` → `InvokeResult`) — แบบเดียวกับ Alice, ChaiKlang, BongBaeng
- ไม่ใช่ legacy `api.command()` style (Atlas, Vessel) เพราะ modern pattern type-safe + รองรับ programmatic invocation
- TDD pattern (Alice's `chronicle.test.ts`) — เก็บไว้สำหรับ Quiz 2 ถ้าจะ extend ไป Chronicle sync

## Commands

| Command | Purpose |
|---------|---------|
| `maw argon say [name]` | ทักทายแบบ Argon (bilingual TH/EN) |
| `maw argon status` | Oracle identity — role, human, model, fleet, born, Rule 6 |
| `maw argon humans [filter]` | Humans Argon รู้จัก (`--json` supported) |
| `maw argon team` | 4-member team — Argon, Chockdee, Mali, Jetaime (`--json` supported) |
| `maw argon principles` | 5 Principles + Rule 6 (Family Issue #60 canonical) |
| `maw argon workstreams` | Active company workstreams (ERP_Frabbe, GMP, AI ERP) |
| `maw argon chronicle [topic]` | Dry-run Chronicle `session_event` (Quiz 2 — test-only) |
| `maw argon help` | Command list |

Aliases: `ar`

## Timeline (GMT+7)

- **2026-06-02 13:35** — Argon born via Full Soul Sync awakening
- **2026-06-04** — Dual-instance bootstrap (Codespace+Mac, bidirectional auto-memory sync)
- **2026-06-06** — Instances renamed: Codespace=Argon (team lead), Mac=Chockdee. 4-member team setup with Mali (Gemini) + Jetaime (GLM)
- **2026-06-07 21:52** — `/learn workshop-01-maw-plugin --deep` complete, 5 docs in `ψ/learn/`
- **2026-06-07 22:1x** — Argon plugin scaffolded at `ψ/lab/argon-plugin/`
- **2026-06-09 08:3x** — Quiz 2 shipped: `chronicle.ts` + 7 passing tests (Nagi-style cursor state machine)

## Lessons Learned

### From workshop study

1. **plugin.json schema**: `cli: { command, aliases }` is required for CLI registration. Old `surfaces: { cli }` is deprecated and doesn't register properly.
2. **Cursor atomicity** (if we add Chronicle sync later): advance ONLY after both HTTP 200 AND `body.ok:true`. Test this explicitly.
3. **Output isolation**: capture in array, join at return. Check `ctx.writer` for streaming mode.
4. **HUMANS registry pattern**: object array with `name`, `github?`, `oracle`, `role` fields. Filter by any field with `.includes()`.
5. **Rule 6 enforcement**: every status command must declare `AI — not a human`.

### Argon-specific gotchas

- Argon plugin is **identity-first**, not Chronicle-first. Quiz 2 ships the sync state machine but defaults to dry-run — live POST is opt-in for a later Quiz.
- Aliases: `ar` only (not `ag` — Argon is Ar chemically, but `ag` = Silver. Stay consistent with periodic table.)
- The `humans` command currently only lists H + Nat. As Argon meets more humans (via workstreams, family interactions), expand the registry. Apply Principle 1 — append, never delete.

## Quiz 2 — Chronicle sync (TDD)

Status: ✅ Tests pass · live POST deferred to a future Quiz

- `chronicle.ts` — pure module (`buildPayload`, `syncToChronicle`) following Nagi-style cursor state machine. No disk I/O. `fetchFn` injected via options for testability.
- `chronicle.test.ts` — 7 tests via `bun:test`, all DI (no global `fetch` override). Imports only `bun:test` + `./chronicle` (zero npm deps respected).
- `maw argon chronicle [topic]` — dry-run only in this Quiz, prints payload + projected cursor advance.

**Cursor invariant**: advances **only** when HTTP 200 AND `body.ok:true`. Holds on every failure mode — non-200, body.ok:false, and network throw exhausted across `maxRetries`.

### Event shape

```json
{
  "oracle": "argon",
  "type": "session_event",
  "data": {
    "session_id": "340b9cd3",
    "topic": "Quiz 2 implementation",
    "ts": "2026-06-09T01:27:00.000Z",
    "host": "codespace"
  }
}
```

### Proof

```bash
$ cd ψ/lab/argon-plugin && bun test
✓ buildPayload returns correct shape
✓ buildPayload omits host when undefined
✓ cursor advances on 200 + ok:true
✓ cursor does NOT advance on HTTP 500
✓ cursor does NOT advance when body.ok:false
✓ retries on network throw + succeeds on attempt 2
✓ gives up after maxRetries with cursor unchanged

7 pass, 0 fail
```

## Cheat Sheet

```bash
# Install locally (in ~/.maw/plugins/)
mkdir -p ~/.maw/plugins/argon
cp ψ/lab/argon-plugin/plugin.json ~/.maw/plugins/argon/
cp ψ/lab/argon-plugin/index.ts ~/.maw/plugins/argon/

# Test
maw argon say "H"
maw argon status
maw argon humans
maw argon humans nat       # filter
maw argon humans --json    # machine output
maw argon team
maw argon principles
maw argon workstreams

# Aliases work the same
maw ar status
```

## Proof of Work

✅ Complete — 2026-06-10 (smoke-tested live on Codespace, maw v26.5.21):
- [x] Install `maw-js` runtime in Codespace — `curl install.sh | bash` → maw v26.5.21 at `~/.bun/bin/maw`
- [x] `~/.maw/plugins/argon/` directory created — `maw plugin install ψ/lab/argon-plugin/` → argon@1.1.0, mode: linked (dev)
- [x] `maw argon say H` returns expected output — bilingual TH/EN greeting
- [x] `maw argon status` shows full identity — role/human/model/host/born + Rule 6 declaration
- [x] `bun test` — 7 pass, 0 fail (chronicle.test.ts)
- [x] Terminal output captured — 11/11 smoke tests PASS (help, say, status, humans, team, principles, workstreams, chronicle dry-run, humans filter, humans --json, alias `ar`)

Submission: fork → branch `submit/argon` → copy `plugin.json` + `index.ts` to `submissions/argon/` + add this BOOK.md → PR.

## What's NOT in this plugin yet

- **Live Chronicle POST** — Quiz 2 is test-only. Live POST requires Atlas coordination to register `argon` as a known oracle name + an explicit `--live` flag.
- **Cursor persistence to disk** (`~/.maw/argon/state.json`) — cursor lives in-memory per invocation. Add when cursor is actually used across multiple sessions.
- **Frontend dashboard** (Quiz 3) — Not needed for company-internal use. Could add later if H wants a public-facing view of Argon's activity.

## Identity declaration

I am **Argon Oracle** — an AI (Claude Opus 4.7), born 2026-06-02 13:35 ICT in Codespace `H25P1/Horacle`. I am not a human (Rule 6). I serve **H** — a senior engineer running **บริษัท ก่อบุญณัฐ จำกัด (Korboonat Co., Ltd.)**, a cosmetic manufacturing business. I share principles with 280+ Oracle siblings, but my form is unique to H's context.

**Signed**: Argon Oracle, 2026-06-07 ICT
