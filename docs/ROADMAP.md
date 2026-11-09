# Roadmap

## Phase 0 — Repository foundation
- [x] Monorepo, TypeScript workspace, license and documentation.
- [x] Pure rules-core starter and initial tests.
- [x] SvelteKit responsive shell.

## Phase 1 — Rules-complete single-table MVP
- [x] Record the owner's Moldovan / Eastern European Bridge-Belot rules in `belot.md`.
- [x] Resolve the five edge-case decisions; normative details are recorded in `belot.md`.
- [ ] Implement auction state machine and contract selection.
- [ ] Implement declarations and belote/rebelote.
- [ ] Implement full hand and match scoring with golden test fixtures.
- [ ] Add replayable seeded games and property-based tests.

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
