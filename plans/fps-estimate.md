# Fast Twitch FPS estimate

Restore an explicitly labeled provider estimate quickly, then refine it with recent samples. This measures reported playback, not screen presentation.

## Scope and decisions

User approved labeled Twitch ~FPS despite prior provider/smoothness discrepancy. First valid stats appear on the existing two-second poll (within five seconds of availability, not guaranteed from startup). Average up to five samples, at least one second apart; reset on invalid, stale, hidden, paused, offline, blocked, error or quality-change observations. No dependencies, persisted fields, quality policy or playback changes. Preserve all pre-existing dirty work; initial status captured before edits. Plan Mode unavailable; use this atomic plan.

Memory lookup: `FPS unavailable estimate Twitch` matched unresolved `ext-twitch-playback-evidence`; prior reports confirm provider counter cannot establish visible smoothness. Current source hardcodes the dash and ignores FPS. Existing report `2026-10-22-reported-fps-visible-stutter.md` applies; no new lag diagnosis.

## Checklist

- [x] Map adapter, manager, UI, fixtures, docs and existing evidence.
- [x] Confirm provider estimate with user.
- [x] Observe RED for early reading, smoothing and lifecycle clearing.
- [x] Add minimal adapter aggregation, snapshot and labeled UI.
- [x] Run focused and full regression checks, typecheck/build and browser test.
- [x] Update docs and record evidence/limits.

Rollback: remove only this task's hunks. No commit/push requested.

## Evidence and review

RED observed by test agent: adapter missing fps (1/2 failed), manager missing fps (1/22 failed), then browser hardcoded dash (1/1 failed). A lifecycle fixture needed PLAY before PLAYING to resume an explicit PAUSE; no production intent change. A 30-second wall-time gap reproduced stale averaging (15 expected, 30 observed), then the implementation pruned samples at ten seconds. Independent review checked lifecycle gating and no FPS-driven quality writes; freshness remains a conservative cache heuristic without provider timestamps. Full verification pending.

Cursor continuation: Read this plan and the FPS portions of adapter/manager/UI/tests. Preserve all pre-existing work. Verify the first valid provider estimate within five seconds, five-sample/time-bounded refinement, unavailable/lifecycle/quality resets, header containment and unchanged playback/quality/storage. Run npm test, npm run typecheck, npm run build and browser suite; manually add live streams in a visible desktop browser and compare the labeled estimate/tooltip, pause/resume and hidden-tab behavior. Never call it actual displayed FPS.

Suggested commit: `fix: restore fast labeled Twitch FPS estimates`. No commit/push authorized.

Fresh checks: full unit suite 148/148 across ten files; typecheck and production build exit 0 (test agent). Browser suite still running. Independent final review found no blocker after the ten-second pruning correction. README gate: update_in_same_change for the restored labeled estimate; existing hierarchy and setup retained. Manual smoke checks updated in the matching section. Desktop bridge remains unavailable. No source configuration or storage schema was changed.

Final browser evidence: full suite scheduled 33 cases; all listed cases passed, including FPS/bitrate and responsive header containment. Playwright final `.last-run.json` records status passed with no failed tests. Streamed output omitted the final count summary, so 33 is the scheduled count rather than a separately captured completed-count line. No real-desktop smoothness or startup guarantee is claimed. All implementation/doc work complete; no commit/push performed.

Confirmed completed browser count: final dot-reporter run exited 0 with **33 passed (24.4s)**. Earlier count-capture caveat is resolved. Canonical memory registered tooling report as no-new-learning; targeted check exit 0 with no errors/changed/new/unregistered aliases.

## Delivery milestone: fix: restore fast labeled Twitch FPS estimates

User invoked commit-session after implementation. Scope helper returned no detected writes for wrapped tool calls; direct conversation edit evidence establishes FPS hunks only. Build an isolated candidate from HEAD, excluding pre-existing bitrate/playback/chat/quality work. Include adapter, snapshot/manager/UI, focused unit/browser regressions, README, architecture, smoke checks, validation, this plan and the tooling incident. Preserve unrelated working-tree hunks and the separate linux-config memory registration. Candidate verification and exact privacy gate precede commit; push main to origin/main once verified. No Vercel project linkage or vercel.json exists in this checkout.

Status: implementation complete; shared-checkout verification 148 unit/33 browser plus typecheck/build passed. Candidate verification and commit/push pending. Rollback is a new revert commit if requested; no history rewrite.

Final commit candidate verified independently on HEAD 9fe9e73: npm test **142/142**, typecheck/build exit 0, browser dot reporter **29/29**. The lower counts exclude unrelated dirty work tested in the earlier shared run. Reviewed candidate has 13 files: FPS-only adapter/types/manager/header, manager and adapter regressions, standalone tests/fps-estimate.spec.ts (extracted from this session's additions to pre-existing bitrate test), README/architecture/smoke/validation, this plan and tooling incident. Concurrent quality commit 9fe9e73 is preserved unchanged. Exact candidate privacy gate passed. README recruiter-sync: update_in_same_change; added truthful FPS usage and caveat, preserved existing hook/stack/setup/flags.

Attribution: CODEX_THREAD_ID 01a16566-f6f6-77c3-bd22-79ca38f779f2; helper unsafe_reason was no detected wrapped writes, so use directly observed conversation edits and pre-write dirty baseline. Unrelated pre-existing and concurrent source/docs/plans/tests, .aws and public startup probe are excluded; canonical memory-ledger update remains in linux-config rather than this repository. Main index initially had no staged entries; isolated candidate index protects unrelated changes. No Vercel config/linkage exists, so deployment is not configured.

Milestone ready: fix: restore fast labeled Twitch FPS estimates — implementation and candidate checks complete, no blockers; next commit and push main to origin/main.
