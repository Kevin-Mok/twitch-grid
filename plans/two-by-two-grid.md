# Fit four streams into two columns

Correct viewport measurement so Auto grid uses the space reserved for two video columns, including when a wide saved chat preference is capped. Reproduce the layout failure, fix the measurement, then verify geometry and retained frames.

Scope: PlayerSurface's ResizeObserver, the existing panel regression, README usage, smoke checks and this plan. Preserve unrelated dirty playback, FPS and chat work. No dependency, storage migration or configuration change. The initial implementation did not include delivery; commit-session now authorizes the scoped commit and push described below.

- [x] Inspect layout callers, CSS sizing and existing tests. Initial `git status --short` captured before edits.
- [x] Identify hypothesis: ResizeObserver contentRect excludes padding already; subtracting another 16px turns the 816px content box into 800px, below the 808px two-column minimum.
- [x] Observe a failing browser assertion for a four-stream grid with a capped wide chat preference.
- [x] Use content-box dimensions directly; preserve Twitch minimums, explicit layout settings and iframe hosts.
- [x] Run focused/browser regression, full unit suite, typecheck/build and desktop/mobile visual checks; update usage and smoke checks. Report six unrelated concurrent quality-selection RED tests rather than claim a green full unit suite.

Atomic sequence: strengthen existing wide-chat regression → observe RED → remove duplicate padding subtraction → verify GREEN → update evidence. Rollback: revert only this task's measurement/test/documentation hunks. Minimum 400×300 video hosts remain; short CSS viewports can still scroll vertically.

Manual plan: four channels, Auto grid, sidebar and chat open; widen chat to its cap at 1280×900, 1440×730 and 2048×973. Expect two rows of two, no player scrolling at these sizes, reachable controls and unchanged iframe elements. At 390px retain overlays and minimum-size scrolling. Explicit 1-column mode must remain selectable.

Cursor prompt: Read plans/two-by-two-grid.md and docs/smoke-tests.md. Preserve existing dirty playback/chat changes. Verify four streams remain a 2×2 Auto grid with a wide saved chat preference, no overflow at the recorded desktop sizes, retained iframe identity, and existing mobile/explicit-column behavior. Use ResizeObserver content-box dimensions without subtracting padding again.

Suggested commit: `fix: use full viewport content size for stream grid`.

## Evidence and review

Memory lookup `grid responsive columns viewport` found no applicable prior layout finding; unrelated spreadsheet/terminal/adapter matches do not establish a remedy. Existing narrow-panels plan documents the 832px reserve, but its wide-chat check only tested horizontal overflow and missed column count.

Intentional RED: `npx vite build` passed, then focused Playwright on isolated preview port 4283 exited 1 at tests/narrow-panels.spec.ts:38: the 2×2 geometry assertion stayed false at 1280×900 with chat preference 640. Production measurement was still unchanged for this run. Removed only the duplicate 16px subtraction from both content-box dimensions. Concurrent chat schema work initially blocked normal TypeScript build; the final checks below supersede that blocker.

Final verification:

- `npm run typecheck` and `npm run build`: exit 0; Vite built 29 modules. `npm run inspect`: exit 0; two entry assets resolve across four static files (284.0 KiB at that run).
- `npm test`: exit 1; 136/142 pass, six resolution-quality selection tests in src/player/manager.test.ts fail while a concurrent session adds that behavior. The layout module's tests pass. Preserve the other session's test-first changes.
- Focused production-browser GREEN: `npx playwright test tests/narrow-panels.spec.ts --reporter=line --config=/tmp/twitch-grid-playwright-red.config.mjs`: exit 0, 1/1 passed in 7.1s. This follows the expected geometry RED with only the one-line production fix. Capped wide-chat geometry, no horizontal/vertical canvas overflow, 390px controls and all original video/chat frames remaining connected pass.
- Inspected wide-chat desktop screenshots at 2048×973 and 1280×900 plus 390px mobile. Two centered rows of two fit with contained headers/actions; existing mobile overlays remain. Captures live under `/tmp/twitch-grid-playwright-red-results/narrow-panels-compact-pane-822a2-ideo-columns-with-chat-open-chromium/` (`wide-chat-2048.png`, `wide-chat-1280.png`, `panels-mobile.png`). The 1440×730 capture is `wide-chat-1440.png`.
- README review: update_in_same_change for the wide-chat 2×2 usage claim; existing viewer/iframe-lifetime hook, grounded stack rationale, installation and CLI options are retained. Updated existing smoke check, without duplicating it. Local lesson records content-box measurement and geometry assertions.
- A delegated full browser run was denied because automatic review interpreted the request as image resizing. Parent inspected the harness and obtained approval for the directly relevant local fixture regression; no bypass was used. The full browser suite was not run by this task.
- Canonical memory update completed with approval: report hash `6bcdd71fb8175538e2ca6a57e676f5ac5875b0c97ca5144379f5255b63aa1277`, finding `local-resize-observer-grid-content-box`, ledger `~/linux-config/dot_agents/skills/postmortem-memory/sources.json` and new reference `references/resize-observer-grid.md`. Existing dirty entries were preserved. Targeted `check --postmortem ~/coding/twitch-grid/docs/postmortem/2026-10-22-grid-content-box.md` exited 0, with no errors/changed/new/unregistered sources. Incidental tool failures add no separate engineering learning beyond the recorded workflow limits.

Self-review: callers still use the same measured content box; layout algorithm, explicit-column/focus behavior, minimum player size and persistent host ownership are unchanged. No new configuration or dependency. Real Twitch playback/audio/login and physical-device checks remain outside this geometry fix. Rollback is the one measurement line plus this task's matching test/docs hunks.

Direct verification from repository root, no sudo: `npm run dev` (open printed URL, add four streams, Auto grid and wide chat); `npm run preview` (repeat against built production output); `npm run inspect` (entry assets resolve). Expected behavior and exact desktop/mobile dimensions are in the manual plan above and docs/smoke-tests.md. The atomic sequence, paste-ready Cursor prompt and Conventional Commit suggestion are recorded above.

Tool context: an initial optional skill read used a nonexistent installed alias; the catalog path resolved. Keep this incidental workflow failure with the living layout report. No installed skill or environment configuration was changed.

## Session delivery milestone

Milestone subject: `fix: use full viewport content size for stream grid`. Commit-session authorizes one focused commit and push to the configured `origin/main` (`Kevin-Mok/twitch-grid`). Scope helper returned unsafe because the orchestration layer exposed no successful write/baseline events. Session `01a16534-d4db-7ba1-bfac-0fc2f5bd6730` has direct successful edit evidence and its initial status in the conversation; use that fallback for these seven paths: PlayerSurface (measurement line only), tests/narrow-panels.spec.ts, README (2×2 usage sentence only), docs/smoke-tests.md (four-stream layout entry only), tasks/lessons.md (content-box lesson only), this plan and the grid-content-box postmortem. Exclude all playback, FPS/bitrate, chat-cropping, quality-default and other-session changes, including their mixed-file hunks. External canonical memory edits in linux-config remain outside this repository's commit.

Prepared an isolated HEAD-based candidate at `/tmp/twitch-grid-2x2-ship-xlu_tzma`, based on `29fd768688de19552ba0d6b2b6ab7189bcb43bf8`. It contains only the seven scoped paths over committed sources. Fresh candidate checks: `npm test` 130/130 tests in nine files; `npm run typecheck` and `npm run build` exit 0; `npx playwright test tests/narrow-panels.spec.ts --reporter=line --config=playwright-ship.config.mjs` 1/1 passed (5.8s) using isolated preview port 4287; `npm run inspect` resolves two entry assets across four files (281.0 KiB). The earlier shared-checkout quality RED tests are excluded from this candidate. README recruiter review passes: viewer/iframe-lifetime hook, stack rationale before setup, truthful Node/npm bootstrap, documented CLI options, daily use and real-Twitch limitations are retained. No further README repair is needed.

Completed: implementation, reproduction, scoped validation and documentation. Remaining delivery steps: exact staged-diff/privacy review, commit, then upstream push. No implementation blockers. Preserve the normal index and unrelated work during isolated staging. No Vercel project link, vercel.json or deployment configuration is present, so no deployment is configured for this checkout. Report the resulting commit hash and actual push result in Codex output. Rollback can use a normal follow-up revert of this focused commit; do not rewrite history.

Privacy review: the first exact-index scan blocked two `home_path` documentation findings before any commit. Replaced absolute home-directory references with portable paths in the plan/report; preserve the gate and rerun it against the refreshed isolated index. README and app/test scope remain unchanged.

Canonical review after privacy repair: the report alias/finding/reference now use the refreshed hash above; targeted memory check exits 0 with no errors or changed/new/unregistered sources. No private approval exception or scanner weakening was used.
