# Hide quality fallback notices

Suppress quality fallback overlays completely, as requested after the initial five-second timeout. Preserve quality selection, playback, persistent errors and other warnings.

## Atomic plan

- [x] Inspect current source, tests, documentation and dirty state.
- [x] Verify RED for immediate absence, remove the temporary notice component and timer tests, and keep one browser regression.
- [x] Update README and smoke checks; run full unit suite, build/typecheck and focused Chromium regression.

## Decisions and risks

Remove only task-owned QualityNotice files and their integration. Keep the manager fallback state for existing callers and diagnostics. No configuration or dependencies change. Preserve prior user edits. Rollback is limited to these notice-related hunks. Plan Mode is unavailable; this is the small inline plan.

## Handoff

Cursor prompt: Preserve existing edits. Verify an unavailable quality silently falls back, playback retains its iframe, and errors remain visible. Run npm test, npm run build and the focused quality-notice browser regression.

Manual checks: choose an unavailable quality, toggle the sidebar, and choose another unavailable quality. No quality fallback banner should appear at any point. Check persistent error visibility independently.

Documentation: README Everyday use and docs/smoke-tests.md describe complete suppression.
Suggested commit: `fix: hide quality fallback notices`.

## Evidence

The earlier timeout implementation passed 135 unit tests and a focused browser regression. This follow-up supersedes that behavior. Final verification: 133 tests passed across 10 files; build/typecheck passed; focused Chromium regression passed 1/1, confirming immediate absence and retained player iframe. git diff --check passed. Canonical incident review check passed with no errors or changed hashes. The user subsequently requested commit-session; see delivery milestone below. Live Twitch video/audio is outside this UI check.


## Delivery milestone: fix: hide quality fallback notices

- Scope: `src/components/PlayerSurface.tsx` message-rendering hunk; README silent-fallback paragraph; smoke-check Action/Expected pair; complete session-owned plan, regression test and incident report.
- Attribution: session `01a16522-26eb-7542-ae40-3da85bc6e271`. Scope helper returned unsafe because it detected no successful write events; direct conversation write evidence and the captured pre-write dirty baseline establish the six eligible paths/hunks.
- README gate: pass with the session paragraph included. Candidate retains the recruiter-first opening, repo-grounded stack rationale, Node/npm setup, everyday use, documented Vite port/host flags and plain artifact inspection.
- Isolated candidate: HEAD plus only the six session paths/hunks. All 130 tests across nine files and build/typecheck pass. Focused Chromium regression passed 1/1 with a temporary verification config on port 4197; the occupied port 4173 listener was preserved. No shipped config changed.
- Completed: implementation, documentation and scope review. Remaining: exact staged privacy check, commit and upstream push. No product blockers. Live upstream Twitch playback/audio remains unverified.
- Rollback: revert the notice commit's six paths/hunks without touching other sessions' edits. No persistence or SDK changes.
- Vercel: no project link (`.vercel`) or repository Vercel configuration is present; generic README deployment instructions do not establish a configured deployment target.

Pre-existing and concurrent work outside this session remains excluded: player/FPS/bitrate implementation and tests; chat/crop/layout/sidebar changes; architecture/validation/lesson updates; playback and other session plans, prompts and reports. Mixed README, smoke-test and PlayerSurface hunks remain dirty after the scoped commit. Canonical incident-ledger changes in linux-config remain outside this repository's commit.
