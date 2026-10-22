# Twitch Multiplayer implementation

Build the browser application described in `viewington-codex-prompt.txt`: investigate the reference, implement a static client, and verify player lifetime, local data, layout and real integration.

## Context and scope

The initial folder contains only the supplied prompt. `git status --short` on 2026-10-22 returned exit 128: no usable Git metadata. Preserve the prompt and sandbox mounts. No commit, deployment, app backend, secret, private Twitch API or production REA dependency is authorized or needed. No screenshot was supplied.

## Decisions

- React + TypeScript + Vite, native browser storage and a small typed state model.
- Permanent per-channel DOM hosts in one player surface; layout changes only styles. Overlapping profiles retain hosts.
- Official Twitch player/chat embeds; browser event status with explicit stale/unknown states. Never force-play periodically.
- Versioned validated browser data; backups, explicit merge/replace restore, public fragment sharing. New players muted.
- Compact dark video-first controls, one right chat pane. Chat and audio selection independent.
- Use REA through its documented CLI if available without changing agent configuration; isolate browser profile and captures. Desktop static inspection on Linux; Windows runtime stays unverified.

## Implementation checklist

- [x] Read prompt and record protected initial state.
- [x] Investigate web and desktop with REA; record versions, hashes, evidence and limitations.
- [x] Define and observe failing tests for domain, persistence, layout and lifecycle.
- [x] Implement domain state, validated storage/share/import and deterministic layout.
- [x] Implement player adapter, stable manager, playback intent and observable status.
- [x] Implement accessible watching UI, profiles, controls and independent chat.
- [x] Run unit/browser tests, type checking, build and static-server checks.
- [x] Compare real browser UI and perform real Twitch smoke checks where accessible.
- [x] Finish README, architecture, feature parity, smoke tests and verification evidence.
- [x] Review deliverables against prompt and record remaining gaps.
- [ ] Establish real moving video and audible output in a normal desktop browser; isolated app and bare SDK attempts stalled.
- [ ] Observe real hidden return-to-live, sustained background playback, signed-in chat and Windows runtime (separate remaining runtime checks).
- [ ] Resolve the user-reported two-stream playback failure: starting coachboop briefly plays then stops while mrsavage continues. No fix verified.

## Risks and rollback

Twitch may block automation, autoplay or embed access. Hidden offline embeds may not announce return online; preserve observers and expose stale state/manual refresh. Never promise network/browser suspension immunity. Enforce 400×300 video minimum with scrolling at constrained sizes. Corrupt/blocked storage must not be overwritten silently. Imports and shared links are untrusted and bounded. Local files added in this session can be removed individually to roll back; preserve the supplied prompt.

## Verification

Run `npm test`, `npm run typecheck`, `npm run build`, and Playwright browser tests against static `dist` serving. Deterministic adapter tests instrument iframe identity/loads across five streams, reorder, resize, sidebar/chat, focus and overlapping profiles. Test manual pause and independent audio, quality fallback, offline return, malformed storage/share/import and backup restore. Check layouts with 1/2/3/5/8 players, occupied dev port fallback, and practical browser widths. Real Twitch evidence must distinguish successful embeds/playback from blocked or unobserved playback/audio.

## Progress and review

2026-10-22: scope and architecture established from the supplied prompt. Current Twitch docs reviewed through a docs agent. Search agent confirmed no installed REA CLI/skill and available Chrome/Playwright browser binaries. Plan Mode is unavailable in the current collaboration mode; this file is the living plan. No external publication.

Tests agent observed 85 intentional domain/storage/layout failures before implementation, 7 player/chat failures before implementation, and browser failure on the missing accessible channel input before UI implementation. Player manager subsequently passed 5/5 tests. Domain suite reached 92/93 with one new intentional layout focus regression, subsequently fixed (17/17 focused layout tests). First static Vite build succeeded. Browser execution needs approved loopback permissions; sandbox EPERM has a living incident report.

REA reference investigation confirmed raw UTF-8 Base64 and LZString profile codes. Add compatibility import through a narrow codec and validation; do not copy unofficial GraphQL polling. Native desktop package 0.6.8 identified as Electron; static analysis is distinct from Windows runtime verification. Visual reference shows compact zinc/green controls, sidebar overlay, centered 16:9 auto-grid. Rebuild uses a docked sidebar and minimum-size scrolling fallback as an explicit extension.

Final implementation milestone: all core browser controls, profile/data transfer flows, stable player registry and chat panel are implemented. Final [automated evidence](../docs/evidence/validation-automated.log) reports 128 unit/integration tests and 18 browser tests passed; typecheck, build and static artifact inspection exit 0. Occupied-port startup preserves the existing listener and chooses another port. [Validation](../docs/validation.md) records test scope, matching viewport comparison and real integration limits. Independent evidence review identified and verified the share-query privacy repair and corrected documentation attribution.

Real integration status: official video SDK and chat load, but moving video/audio are not established. A bare official SDK control in the same disposable browser also stalled; exact cause unresolved. This blocks a full working-playback claim, not the completed static implementation. Return-to-live notifications remain best effort. Reference advanced settings, sidebar resizing and desktop integrations are listed as gaps in the parity matrix. No fixed stream-capacity performance claim.

Delivery: no commit, push or deployment; Git metadata is unavailable and external publication was not requested. Keep this plan with any later initial commit (`feat: add static Twitch multistream workspace`). Next useful step is the real desktop playback check in [smoke tests](../docs/smoke-tests.md), using the [continuation prompt](../prompts/continue-twitch-multiplayer.md). Roll back by removing only session-created app files, preserving the supplied prompt and unrelated mounts. README gate: update-in-same-change, with commands, public configuration, local storage, exact validation limits and static hosting documented.
