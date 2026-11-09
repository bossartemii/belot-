# Architecture

```text
SvelteKit web client
  ├─ presentation / card interaction
  ├─ boardgame.io client (later phase)
  └─ public game view only
          │ WSS
          ▼
Authoritative Node.js game server (later phase)
  ├─ boardgame.io lobby + turn orchestration
  ├─ @belot/engine — pure deterministic rules
  ├─ playerView — redact hidden hands
  └─ persistence adapter
          │
          ▼
PostgreSQL (production) / SQLite (local development)
```

## Invariants

1. The server owns the deck, shuffle seed, hands, turn order and score.
2. A client submits an intent (`playCard`), never a replacement game state.
3. The server validates the intent against the engine before applying it.
4. Player views expose only that player's hand; opponents' cards remain server-side.
5. Every game action is deterministic and testable. Randomness is injected at the boundary.
6. A reconnect restores a player's seat and authorized view, not another player's private state.

## Dependency policy

Keep the engine framework-independent. Integrate boardgame.io only at the server/application boundary. Avoid adopting multiple overlapping game engines. Third-party assets are tracked in `THIRD_PARTY_NOTICES.md` with exact source URL, version/commit, license and attribution requirements before shipping.
