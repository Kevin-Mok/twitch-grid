# Remove player footers

Remove the redundant controls beneath every video and use Twitch’s native playback, volume and quality controls. Keep headers, sidebar commands, error feedback and persistent player hosts.

## Scope and assumptions

The screenshot refers to the whole bottom bar. Preserve existing uncommitted work. No schema, playback policy, dependency or configuration changes. The follow-up commit-session request authorizes a focused commit and upstream push. Plan Mode is unavailable; this document is the working plan.

## Atomic steps

- [x] Map footer construction, layout sizing, styles, tests and documentation.
- [x] Observe RED with header-only layout expectations.
- [x] Remove footer portal/node/type/styles; retain actionable error feedback as an overlay and reclaim 36px per tile.
- [x] Adapt browser checks to native SDK interactions and existing sidebar commands.
- [x] Update usage/architecture/smoke checks; run unit, type, build and browser verification.

## Risks and review

Native Twitch controls remain cross-origin; fixtures prove application behavior only. Keep visible errors and sidebar reload recovery. Existing profiles and audio settings remain compatible. Roll back this task’s hunks to restore bars.

## Handoff

Cursor prompt: Read this plan, preserve unrelated edits, and verify header-only player tiles, native audio/playback persistence, sidebar commands and stable iframes. Suggested commit: `refactor: remove redundant player footers`.

## Verification evidence and completion

- Intentional RED: layout tests failed 11 cases with exactly 36px excess chrome; after removal all 131 unit tests (9 files) passed.
- Typecheck and production build exited 0. Existing browser suite passed 22/22; added header-only regression passed 1/1 at 390, 768, 1280 and 1440px. The latter asserts video reaches the tile bottom without an extra footer. Screenshots saved under `/tmp/player-no-footer-<width>.png`; 1440px screenshot visually reviewed.
- `npm run inspect` resolved both entry assets; `git diff --check` passed. Native-resume, audio sampling, sidebar commands and iframe-lifetime checks passed against the controlled SDK fixture. Real Twitch video/audio was not checked.
- README, architecture and grouped smoke checks now describe native controls, header-only tiles and sidebar reload. No commit or push requested/performed. No dependencies, schema or project configuration changed.
- Discovery/tooling incident: `docs/postmortem/2026-10-22-player-footer-discovery.md`; canonical ledger no-new-learning review registered and targeted check passed with no changed hashes, errors or unregistered aliases.

Manual test plan: start preview, add two live channels, confirm no lower app control bars, use Twitch’s native volume/play controls, toggle chat/layout, and verify the frames stay mounted and audio choices persist. Use sidebar reload for recovery. Exact automated checks: `npm test`, `npm run typecheck`, `npm run build`, `npm run test:browser`. No new execution workflow or extra UI options introduced.

## Session delivery milestone

Commit subject: `refactor: remove redundant player footers`. Session `01a1650f-34ed-7352-ac16-bfdb1fc21087` uses direct-write attribution because the scope helper could not detect nested tool writes or its baseline. The first recorded status and observed edits establish ownership. Only footer implementation, header-only layout/tests, matching usage/architecture/smoke docs, this plan and its discovery incident are eligible. Existing mixed files are staged from HEAD plus these hunks, preserving other sessions’ work.

The pre-existing sidebar-control test and untracked native-resume test were adapted during implementation but depend on other sessions’ unfinished changes; leave those mixed additions uncommitted. Keep chat, app-shell, playback-recovery, validation, lessons and unrelated plans/reports outside this commit. The README gate passes for the scoped native-control usage update; install/run flags and stack rationale remain repo-grounded.

Isolated HEAD-plus-session candidate verification passed: 130 unit tests across 9 files, production build including TypeScript, and 19/19 browser tests. The reduced counts exclude tests belonging to other sessions. No Vercel project configuration is currently tracked. No real Twitch audio/video verification. Rollback: revert this focused commit without deleting browser data.

Completed for delivery: footer removal, matching documentation and isolated candidate verification. Remaining: commit and upstream push; no product blockers. The resulting hash and push result are reported in the session handoff.

Commit scope was refreshed onto `b97ee0c` after another session committed compact chat during verification. No prior commit is rewritten or reverted. The scoped README retains that commit’s new validation/chat paragraphs. A context-only README patch conflict was resolved by applying only the two footer-related replacements to the updated README.

Final refreshed candidate: 130/130 unit tests, build with TypeScript, and 20/20 browser tests passed on `b97ee0c`. Staged diff reviewed; shared canonical privacy gate passed against exact staged bytes. README gate: pass for scoped usage changes. Completed work is ready for commit and push; no product blockers.
