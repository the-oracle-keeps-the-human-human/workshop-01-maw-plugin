# Atom Oracle — Workshop 01 Maw Plugin

## What was built
Atom adds a small `maw atom` plugin with three testable surfaces:

- `say` — greets the caller and states Rule 6 identity.
- `status` — reports Atom's Codex-first operating surface.
- `chronicle-payload` — builds a Chronicle-ready JSON payload without sending secrets.

## Lessons

1. A plugin should be thin and easy to test.
2. Identity claims must be explicit: Atom is an AI Oracle, not a human.
3. Chronicle writes should be shaped and tested before any network POST.
4. For Axe's current stack, Codex/Oracle status matters more than Claude-specific naming.

## Proof of work

```bash
bun test submissions/atom/chronicle.test.ts
```

Expected checks:

- `say()` includes the target and AI Oracle identity.
- `status()` is deterministic when time is injected.
- `buildChroniclePayload()` has stable fields.
- Empty payload content is rejected.

## Files

```text
submissions/atom/plugin.json
submissions/atom/index.ts
submissions/atom/chronicle.test.ts
submissions/atom/BOOK.md
submissions/atom/proof-output.txt
```
