# Fit the video grid in one viewport

Scale the existing video layout into the available workspace so every row stays visible. Keep Twitch's internal minimum embed dimensions, video proportions and permanent player hosts.

## Scope and decisions

- The user requests all videos together within one viewport vertically; retain the current theme and controls.
- Keep `calculateLayout` as the logical layout, including its 400×300 embed minimums. Scale tile transforms uniformly to fit the measured viewport in both dimensions and center the result.
- Size and clip the surface to the viewport so unscaled layout boxes cannot create scrollbars. Keep the focus exit control outside document flow.
- Touch PlayerSurface/CSS, browser coverage and the matching README/smoke wording. Preserve all pre-existing dirty work. Commit-session now authorizes a scoped commit and push; no deployment target or configuration changes are requested.
- `.agent/PLANS.md` is absent; follow the existing concise plan format. Default collaboration mode does not expose a Plan Mode switch.

## Steps

- [x] Inspect sizing, callers, existing tests and prior incident knowledge.
- [x] Add a browser regression for short, desktop and narrow viewports; observe the overflow before implementation.
- [x] Fit existing tile transforms; update stale displayed-minimum-size checks and docs.
- [x] Run focused browser coverage, unit suite, typecheck/build; review geometry and iframe identity.

## Evidence and risk

- Prior lookup: `viewport grid height overflow layout` matched `local-resize-observer-grid-content-box`. The content-box correction already exists in PlayerSurface; this task addresses the separate minimum-height overflow policy.
- The current grid intentionally grows beyond the available height when row minimums cannot fit. Scaling preserves the internal Twitch viewport rather than requesting unsupported smaller embeds.
- RED observed: build passed; the new browser regression failed its geometry poll at the first 992×636 case (`Expected true; Received false`). Normal sandbox browser startup hit the known loopback restriction; the same command with loopback access produced the expected product RED.
- Many streams or high browser zoom make controls smaller. Real Twitch playback/audio is separate from controlled layout verification.
- Focused browser checks pass 14/14, including viewport fit, fullscreen, eight-stream layouts, chat, parking and retained frames. Typecheck and production build pass.
- Full unit suite: 145 passed, 1 failed in pre-existing dirty quality-manager work (`reapplies a changed default even when a cleared override resolved to the same rendition`, manager.test.ts:227). This task does not change manager/domain behavior; preserve that work and report the failure.
- Broad browser review exposed one more stale displayed-minimum assertion in `tests/watch.spec.ts`: updated it to check the internal minimum while retaining the actual displayed header/video edge-alignment assertions. The new viewport test independently requires visual fit. No product behavior was changed for this stale expectation.
- The completed broad run before that test correction was 29 passed, 2 failed: the stale header-only minimum and the pre-existing bitrate text expectation (`1.00 MB/s` versus current `Total 1.00 MB/s`, tests/bitrate.spec.ts:22). Preserve unrelated bitrate edits. Captured log: `/tmp/twitch-grid-viewport-fit/browser-full.log`.
- Independent source review found no actionable issues in the fitting transform, internal minima, fullscreen override, permanent hosts or parked-player containment.
- Fresh verification after the stale header-only assertion was corrected: all 31 browser tests pass (`browser-full-after-watch.log`), all 146 unit tests across ten files pass, and build/typecheck pass. Earlier unrelated quality/bitrate failures did not recur; no manager or bitrate fixes were applied by this task and their transient cause is unconfirmed.
- Visual QA: the 992×636 three-stream screenshot shows two centered top tiles and the complete third tile below, including its bottom edge. The visible notice leaves a 992×603 player viewport with identical scroll/client dimensions, so headers, rows and gaps fit the available height. Evidence: `/tmp/twitch-grid-viewport-fit/three-streams-992x636.png`.
- Eight-stream visual QA at 1280×636 also fits all three Auto-grid rows, with a centered incomplete final row and scroll/client dimensions both 1280×603. Internal hosts remain 416×300 while the displayed grid scales down. Screenshot: `/tmp/twitch-grid-viewport-fit/eight-streams-auto-1280x636.png`; geometry capture passes 1/1 and JSON is in `geometry-final.log` in the same directory.
- Docs updated: README usage, architecture layout rules, validation wording, shared smoke checks and a local testing lesson. Canonical incident ledger records the browser tooling workaround; no configuration was changed. The initial implementation handoff had no commit or push; the later delivery request is tracked below.
- Rollback: revert only this task's added fitting transform, surface bounds, focus positioning, tests and docs; preserve unrelated edits.

## Handoff

- Automated: `npm test`, `npm run typecheck`, `npm run build`, focused Playwright layout/identity tests followed by the browser suite when feasible.
- Manual: add three streams, close sidebar/chat, resize to a short window; repeat with eight streams, chat and focus. All tiles and bottom controls stay visible without canvas scrolling; resizing does not recreate players.
- Cursor prompt: Read plans/fit-video-viewport.md. Preserve unrelated dirty work. Verify viewport fitting, internal embed minimums, player identity and focus/resize behavior; keep the existing design and dependencies.
- Suggested commit: `fix: fit the video grid within one viewport`.

## Session delivery milestone

- Commit-session requested after implementation. Scope helper returned `unsafe`: no successful tool writes detected in its session log. Use direct-write evidence from this conversation and the captured pre-write dirty baseline.
- Prepare an isolated candidate from the current HEAD with only viewport transforms/CSS, their browser assertions, the viewport plan/report and matching README/docs/lesson hunks. Exclude all unrelated chat, quality, playback, bitrate and machine-local changes, including unrelated hunks in shared files.
- Milestone: `fix: fit the video grid within one viewport`. The isolated candidate passes all 130 unit tests across nine files, all 26 browser tests and the TypeScript/Vite build. Candidate-specific logs are in the temporary commit-checks directory; mixed-workspace counts above are historical, not the committed test set. No implementation work remains.
- README gate: updated the isolated candidate's stale validation counts and plan link; install/bootstrap, everyday use, documented Vite flags, repo-grounded stack rationale and the opening project value all pass review. Independent containment review confirms only the 12 declared viewport paths are included.
- Delivery sequence: commit this verified milestone to main after the exact-index privacy gate, then push origin/main. No Vercel configuration or deployment target exists in this checkout. Preserve unrelated dirty files and hunks; canonical incident metadata in the separate configuration repository remains outside this commit.
