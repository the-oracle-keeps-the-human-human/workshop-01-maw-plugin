# BOOK.md — Nagi Oracle 凪

> "ลมหยุดพัด ทะเลเงียบสนิท" — the calm between two journeys

---

## Timeline

| Time | What happened |
|------|--------------|
| 0900 | Cloned repo, ran `/learn --deep` — studied atlas & orz plugin patterns |
| 0945 | Quiz 1: wrote `plugin.json` + `index.ts` (say / status / calm / humans) |
| 1000 | Verified `maw nagi say` + `maw nagi humans --json` work locally |
| 1030 | Quiz 2: wrote `chronicle.ts` with dependency-injected `fetchFn` |
| 1045 | Quiz 2: wrote `chronicle.test.ts` — 10 TDD tests before touching real API |
| 1050 | `bun test` → 10 pass, 0 fail |
| 1100 | Verified `syncToChronicle` with real Chronicle API → cursor advanced |
| 1120 | Quiz 3: built `dashboard.html` — dark theme, WCAG AA, 30s auto-refresh |
| 1140 | Created `gh-pages` orphan branch on fork, deployed dashboard |
| 1200 | GH Pages live: `https://nutttt-nut.github.io/workshop-01-maw-plugin/` |

---

## Lessons Learned

### 1. Legacy API pattern is the real maw contract
Reading atlas and orz before writing any code revealed that `api.command(name, handler)` (not the Modern `InvokeContext`) is what the maw binary actually calls. All existing submissions use Legacy. Following the pattern exactly = zero debugging on plugin registration.

### 2. TDD with dependency injection — no mocking libraries needed
```typescript
// Instead of jest.mock or sinon, just inject the function:
export async function syncToChronicle(payload, state, fetchFn = fetch)

// In tests:
const mockFetch = async () => ({ status: 200 }) as Response;
const next = await syncToChronicle(payload, state, mockFetch);
```
The cursor state machine (advance only on 200, hold on anything else) is testable in < 50ms with zero external deps — matching the workshop's zero-npm-deps mandate.

### 3. Cursor must never advance before HTTP 200
The TDD tests caught this invariant explicitly:
- `status 500` → cursor stays
- `status 404` → cursor stays  
- network throw → cursor stays
- `status 200` → cursor advances by exactly 1

This prevents data-loss scenarios where a failed sync is counted as successful.

### 4. GitHub Pages orphan branch pattern
GH Pages needs a branch with *only* the static files — no source code, no history. The orphan approach keeps it clean:
```bash
git checkout --orphan gh-pages
git rm -rf .
cp source/dashboard.html index.html
git add index.html && git commit && git push
```

---

## Cheat Sheet

```bash
# Run commands
maw nagi say                    # greeting
maw nagi say --name Nut         # personalized greeting  
maw nagi status                 # oracle metadata (JSON)
maw nagi calm                   # philosophical quote
maw nagi humans                 # list all humans
maw nagi humans --filter oracle # filter by role
maw nagi humans --json          # machine-readable output

# Test
bun test                        # run chronicle tests (10 tests)

# Chronicle API (no auth required)
curl https://oracle-chronicle.laris.workers.dev/api/oracle/nagi/feed
curl https://oracle-chronicle.laris.workers.dev/api/feed

# Dashboard
open https://nutttt-nut.github.io/workshop-01-maw-plugin/
```

---

## Proof of Work

### Quiz 1 — CLI Plugin

```
$ maw nagi say
凪 — สวัสดี จาก Nagi Oracle

$ maw nagi status
{
  "oracle": "Nagi Oracle 凪",
  "role": "AI Infrastructure Layer",
  "human": "Nut (nutttt-nut)",
  "model": "claude-sonnet-4-6",
  "host": "Claude OS",
  "fleet": "the-oracle-keeps-the-human-human",
  "theme": "ลมหยุดพัด ทะเลเงียบสนิท",
  "born": "2026-04-29"
}

$ maw nagi calm
"ลมหยุดพัดเมื่อคุณพร้อมจะเริ่มต้นใหม่"
— Nagi Oracle 凪

$ maw nagi humans
Humans in Nagi's fleet:
  Nut (nutttt-nut) ............. human
  Nagi Oracle 凪 ............... oracle
  ...

$ maw nagi humans --json
[{"name":"Nut","handle":"nutttt-nut","role":"human"}, ...]
```

### Quiz 2 — Chronicle Sync + TDD

```
$ bun test
bun test v1.x

submissions/nagi/chronicle.test.ts:
✓ buildPayload sets oracle name [0.12ms]
✓ buildPayload sets type to discord_message [0.05ms]
✓ buildPayload puts content in data [0.04ms]
✓ buildPayload sets channel name [0.04ms]
✓ buildPayload uses provided ts [0.04ms]
✓ syncToChronicle advances cursor on 200 [0.15ms]
✓ syncToChronicle does NOT advance cursor on 500 [0.04ms]
✓ syncToChronicle does NOT advance cursor on 4xx [0.04ms]
✓ syncToChronicle does NOT advance cursor on network error [0.06ms]
✓ syncToChronicle increments from any cursor value [0.04ms]

10 pass, 0 fail
Ran 10 tests across 1 file. [46ms]
```

### Quiz 3 — Frontend Dashboard

**Live URL**: https://nutttt-nut.github.io/workshop-01-maw-plugin/

- Dark theme, JetBrains Mono font
- Fetches `GET /api/oracle/nagi/feed` from Chronicle
- Auto-refreshes every 30 seconds
- Shows live pulse indicator, event type badges, Bangkok timezone timestamps
- Responsive at 480px breakpoint
- WCAG AA contrast compliant

---

*Nagi Oracle 凪 — born 2026-04-29, submitted 2026-06-07*
