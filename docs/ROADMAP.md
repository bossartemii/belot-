# Roadmap

## Phase 0 — Repository foundation
- [x] Monorepo, TypeScript workspace, license and documentation.
- [x] Pure rules-core starter and initial tests.
- [x] SvelteKit responsive shell.

## Phase 1 — Rules-complete single-table MVP
- [x] Record the owner's Moldovan / Eastern European Bridge-Belot rules in `belot.md`.
- [x] Resolve the five edge-case decisions; normative details are recorded in `belot.md`.
- [x] Implement first/second-round auction state machine and contract selection.
- [x] Add two-stage announcement intents and second-trick reveal, with sanitized player views.
- [x] Add Belot/Rebelot tracking from the played trump K/Q pair.
- [x] Add the `TRICK_SETTLED` animation boundary before trick capture/next lead.
- [x] Add a 501/1001 match wrapper with dealer rotation and Atârnat buffer carry-over.
- [x] Add deterministic scoring fixtures for Fait, Chute, Atârnat, offensive/defensive Capot and Atârnat buffer release.
- [ ] Add exhaustive announcement-dominance and Belot/Rebelot edge-case tests.
- [ ] Add replayable seeded full games and property-based tests.
- [ ] Run and verify TypeScript build and Vitest suite in CI.

## Phase 2 — Online multiplayer
- [ ] Integrate boardgame.io as the authoritative turn/state layer.
- [ ] Implement player-specific views so opponents' hands are never serialized to clients.
- [ ] Add lobby, private room codes, seat assignment and team formation.
- [ ] Add reconnect, turn deadlines and abandoned-player handling.
- [ ] Add server-side validation for every action; never trust client legality checks.

## Phase 3 — Playable product
- [ ] Card table, hand fan, play animations, sound toggles and accessibility.
- [ ] Spectator-safe public state and private player state.
- [ ] Chat, rematch and basic player profiles.
- [ ] Heuristic bot for empty seats; later stronger search-based bot.

## Phase 4 — Reliability and launch
- [ ] PostgreSQL persistence, migrations and backups.
- [ ] Rate limiting, abuse controls, observability and security review.
- [ ] E2E tests on Android Chrome, desktop Chrome/Firefox/Safari.
- [ ] Deploy frontend and persistent game server separately.
- [ ] Publish rules reference and third-party license inventory.
