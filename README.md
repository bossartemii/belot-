# Belot

Open-source, mobile-first Bridge-Belot platform. This repository starts with a deterministic TypeScript rules core and a Svelte web client. Multiplayer transport and the complete auction/declaration rules are deliberately staged behind tests rather than guessed.

## Current MVP scope

- 32-card deck (7–A, four suits), deterministic shuffle/deal when a seed is supplied.
- Four seats, two partnerships (0+2 vs 1+3).
- Legal-following checks: follow suit when possible; if void, trump when possible; overtrump when required by the selected classic profile.
- Trick winner and card-point tally, including trump jack/nine values.
- Minimal responsive Svelte landing/client shell.

**Not yet implemented:** full auction/contract state machine, declarations (belote/rebelote and other announcements), complete match scoring/capot logic, persistent accounts, matchmaking, reconnect, production multiplayer server, bots. Rule profile must be confirmed against the exact local Bridge-Belot rules before claiming tournament correctness.

## Requirements

- Node.js 20.19+ (or 22+)
- pnpm 9+

## Run

```bash
corepack enable
pnpm install
pnpm --filter @belot/web dev --host 0.0.0.0
```

## Test rules core

```bash
pnpm test
```

## Workspace

- `apps/web` — SvelteKit client shell.
- `packages/engine` — pure TypeScript rules domain; no UI or network dependencies.
- `docs/ROADMAP.md` — staged delivery plan.
- `docs/ARCHITECTURE.md` — trust boundaries and multiplayer design.

## Licensing

The project code is MIT. Third-party engines, card artwork, fonts and audio are **not bundled** in this starter. Before adopting any dependency or asset, verify its upstream repository, exact license, attribution obligations, redistribution terms and maintenance status. “Free to use” is not the same as public domain.
