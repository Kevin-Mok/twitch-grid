# Repair repeated Play all failure

Reproduce the paused preview failure and correct its proven cause while preserving the existing lineup, sound, quality, iframe lifetime and unrelated dirty work.

## Context and decisions

Existing App samples before filtering, retries unconfirmed playback, and enables native autoplay. A pending manager regression expects retry on ONLINE after an ignored READY play. The user's new screenshot still shows native previews. Scope: manager lifecycle and the actual Play all command only as evidence warrants, defining tests, README/architecture/smoke docs and incident evidence. No new dependencies, timers, schema or automatic consent handling.

## Ordered work

- [x] Capture initial dirty status and inspect callers, tests, prior incidents and lessons.
- [x] Observe existing ONLINE regression RED: 23 pass, 1 fails with one Play rather than two.
- [ ] Inspect live current app and distinguish ignored command from app candidate omission.
- [ ] Implement minimum proven correction; add integration regression if needed.
- [ ] Run focused and broader checks, update docs and record limits.

## Verification and risks

Automated: npm test; npm run build; npm run test:browser (at least playback). Manual: live two-channel lineup; pause one with native control, click Play all, confirm advancing video for both while preserving iframe identity and audio. Pause all and Play all; refresh; repeat immediately before ONLINE. Twitch availability and audience/browser permissions remain external. Rollback only this session's hunks; preserve all prior dirty changes.

## Evidence and handoff

RED: npm test -- src/player/manager.test.ts exited 1 (23 pass / 1 intentional fail). Chrome bridge requires approved unsandboxed invocation; CUA has no browsers. Plan remains active.

Cursor prompt: Read this plan and docs/postmortem/2026-10-23-play-all-paused.md; preserve all pre-existing dirty work, reproduce current playback failure before extending behavior, run npm test, npm run build and playback browser tests, and verify live video separately.

Suggested commit after review: fix: retry unconfirmed Twitch playback when online

## Current verification

- [x] Live trace: READY Play ignored; ONLINE unpaused previews had zero FPS for all three reported channels.
- [x] Minimum correction: one ONLINE retry for unconfirmed playing intent; explicit pause and confirmed PLAYING guards remain.
- [x] Fresh GREEN: 151 unit tests; TypeScript/Vite build; 5 playback browser tests. Browser startup needs approved loopback execution. Independent scoped review: no actionable issue.
- [x] Actual Play all after native coachboop Pause: coachboop resumed, eomzo retried, confirmed higgs not restarted; all iframe identities preserved. Three clocks advanced for another 26 seconds with nonzero FPS.
- [ ] Original desktop session and audio verification remain unperformed; startup delay remains unresolved. ONLINE retry alone did not immediately start media; recovery happened about 77 seconds later, so this task cannot claim to have eliminated the original failure.
- Review caught concurrent unrelated quality-test changes after the passing run; preserve them and report final checks separately if they change results.
- Docs updated: README startup limitations, architecture ONLINE policy, smoke test and dated incident. No commit or push.
- Full browser suite: 38 pass / 1 concurrent focus/fullscreen failure (expected one non-parked tile, got three). All playback cases passed. The code check results above predate concurrent focus/quality work; that work is outside this fix and remains protected.
- Diagnostic cleanup removed only coachboop/eomzo/higgs additions; original 127.0.0.1 lineup unchanged. Runtime screenshots show unblurred video after actual resume; no original-session or audio guarantee.

## Final fresh checks

After concurrent quality implementation landed: npm test passed 152/152 (10 files); npm run build passed TypeScript and Vite; approved npm run test:browser -- tests/playback.spec.ts passed 5/5. The earlier full-suite focus/fullscreen failure was not rerun and remains outside this session's verified scope. git diff --check passed. Canonical postmortem sources.json registered this incident's reviewed hash with an explicit no-new-general-remedy decision; targeted check returned no errors/new/changed sources (exit 0). No source/config activation, commit, push or deployment was performed. Existing app dev server served the new ONLINE line during live verification.

Delivery: startup lifecycle correction and live pause/resume verified; original screenshot session, audible output and the unexplained long startup delay remain unresolved. This is a bounded fix, not a claim of complete upstream playback reliability.

## Reopened after user retest

The user's actual startup and button behavior still fail. Previous lifecycle correction remains a narrow code fix only. Reopen root-cause investigation, compare native versus SDK Play on the same preview and inspect iframe permission/SDK routing before any further implementation. Preserve concurrent quality/focus work and all existing dirty files.

- [ ] Capture stalled live preview and compare native/SDK behavior without waiting for incidental recovery.
- [ ] Identify a causal boundary with an executable regression/reproducer.
- [ ] Apply only supported correction, then test startup, actual button, and preserved playing-stream identity.

## Latest rereproduction: still unresolved

On a fresh coachboop player, READY and ONLINE SDK Play calls left the iframe in a native preview. App Play all dispatched again; native Twitch Play in the same iframe emitted PLAYBACK_BLOCKED, no PLAYING. The browser console showed MasterPlaylist 404 and video ErrorNetworkIO -2. Player geometry was 840×473 and visible in a foreground tab with autoplay allowed. Twitch docs explain the distinction between isPaused=false, PLAY, PLAYING and PLAYBACK_BLOCKED, but not these network errors. This diagnostic suggests upstream playlist/media fetch failure and does not establish the cause on the user's desktop.

- [x] Reproduce through actual SDK and button; compare native control on same frame.
- [x] Record playlist/video errors and verify geometry/autoplay attribute.
- [ ] Await exact failing app URL: visible 127.0.0.1 tab is stale/offline mrsavage; controlled reproduction is localhost.
- [ ] Resolve target-session playlist/media requests and verify PLAYING/frame advancement there before further code changes.

No new implementation, test or build run in this reopened turn. Prior focused test results do not verify this upstream failure.

## Confirmed URL and cached SDK boundary

User confirms http://127.0.0.1:5173/. Live served adapter has native autoplay and served App has the sample-before-filter logic. Reachable diagnostic browser/profile was replaced and now has an empty lineup; it is not the user's desktop profile. Auto-connect attempt could not attach to an active desktop CDP target.

Official SDK source fetched read-only to /tmp/twitch-embed-sdk.js: getMuted, getCurrentTime and isPaused read _playerState; play unconditionally posts a Play command. Sampling again cannot establish a fresh iframe acknowledgement. Add a defining browser regression for a stopped player whose SDK cache and app snapshot still report playing. The explicit button should send idempotent Play to every player while retaining frames and audio/quality state. Update old command-count expectations to this deliberate behavior; do not claim the separate startup issue solved by this button change. Awaiting the user's native-Play comparison on their actual profile.

## Button correction verification

- [x] User confirms exact local URL, Chrome and working native Play.
- [x] Official SDK source proves cached-state getters; new stale-cache browser reproducer failed expected [true,true] vs [false,true].
- [x] Explicit Play all now sends Play to every current channel, preserving existing iframes and saved preferences; no sample-before-filter remains.
- [x] Fresh checks: npm test 152/152; npm run build passes; full approved npm run test:browser 41/41, including six playback tests. Updated sidebar command-count expectation while retaining its audio/quality/iframe checks.
- [ ] Await actual local browser button retest; investigate startup separately through official iframe command handling/autoplay policy.

README, architecture and smoke docs now describe explicit all-player Play commands. Historical scope decisions saying confirmed-playing streams receive no commands are superseded for the explicit button only. ONLINE retry guard is unchanged. No commit/push requested.

## Current actual-browser instrumentation

Button retest still fails for all streams, so no completed playback claim. Official source identifies programmatic maybePlay visibility gating that native Play can bypass. Collect actual local-window state via temporary DEV-only probe, restricted loopback receiver and /tmp JSONL before changing the layout/startup policy. Remove src/playbackProbe.ts and its main.tsx/adapter hooks, then stop receiver before final verification. No private chat/account/storage payloads.

## Root cause established in the actual local windows

Temporary receiver captured the user's six-stream lineup at CSS viewport 1363×661, DPR 2.8125. All frames had intersection ratio ~1 but trackVisibility isVisible=false; parent matrices were uniform downscales ~0.63. This matches the official Twitch maybePlay visibility gate and the user's native Play success.

Controlled live Chrome experiment: ordinary box isVisible=true; transform:scale(.63) box isVisible=false; zoom:.63 box isVisible=true with the same displayed dimensions. The IntersectionObserver visibility algorithm explicitly excludes downscaling transforms. Implement CSS zoom scaling with translation-only geometry, preserving internal embed minimums and displayed fit; override zoom in fullscreen. First run actual Chromium six-player visibility regression RED. Keep all unconnected user work, and remove temporary diagnostics after live verification.

## Final resolution

- [x] Identify actual-window cause: downscale transforms report isVisible=false, blocking Twitch maybePlay/autoplay despite intersectionRatio≈1.
- [x] Replace downscale transforms with CSS zoom and translation-only geometry; reset zoom in player fullscreen.
- [x] Actual-window GREEN: coachboop/eomzo/higgs visible and Playing with advancing clocks in both user windows; offline players parked.
- [x] Remove temporary main/adapter probe hooks and source file; stop receivers/static server.
- [x] After-cleanup verification: 152 unit tests, production build and all 42 browser tests pass. Final focused browser test also passes native iframe fullscreen bounds at 390×700; existing fitted tile fullscreen bounds pass. git diff --check passes. Independent review has no remaining confirmed issue.
- [x] README/architecture/smoke/validation/lessons and living incident updated.
- [ ] Await user's specific startup-versus-button confirmation; audio and smoothness were not assessed. Native autoplay remains enabled, and Twitch source retries after visibility becomes allowed.

Rollback only this session's CSS zoom/translation and fullscreen zoom override, App explicit all-channel resume, playback/watch regression edits and matching docs. Preserve all pre-existing/concurrent changes. Suggested final commit: fix: keep fitted Twitch players visible for playback. Cursor handoff: read this plan and the dated incident, preserve concurrent work, run npm test, npm run build and npm run test:browser; at 1363×661 confirm all on-screen iframes pass trackVisibility, reload a saved live lineup, pause/resume using Play all, and exercise tile/native fullscreen at 390px. No commit/push/deployment performed by this session.

Canonical learning updated in linux-config postmortem-memory sources.json and references/browser-integrations.md as ext-twitch-transform-downscale-visibility. Targeted reviewed-hash check passed (no new/changed/errors). Confirmed live dev server serves zoom: String(scale), does not serve the old scale transform, and temporary probe file is absent. This session has made no commit or push; unrelated concurrent commits are outside its attribution.

## Commit-session milestone: fix: keep fitted Twitch players visible

Scope helper cannot parse wrapped write evidence; use direct-write fallback for thread 01a16a8d-3bd7-7ed0-896f-3254bb0168fa and the original dirty baseline. Candidate is HEAD plus 14 scoped files. In mixed files stage only our hunks. Include the two new playback regressions and a combined ONLINE guard test using tracked fixtures; exclude the five pre-existing playback scenarios and their uncommitted fixture extensions.

Pre-existing native autoplay=true, restored-intent reset, native PLAY intent adoption, chat/metrics and earlier investigation work remain uncommitted. Full-checkout 152/42 tests and actual-window motion do not independently verify those excluded startup behaviors in the commit candidate. README/architecture in the candidate preserve HEAD's persisted paused intent and autoplay-disabled adapter, while documenting this session's explicit button, ONLINE and visibility corrections. This scope supersedes the historical broader working-tree delivery descriptions above.

README recruiter-sync passed both current README and scoped candidate. Candidate code review found no missing dependency; it requested this explicit startup-evidence distinction. Vercel help's sandbox cache EROFS is a tooling warning, not an app failure; subsequent authenticated deployment will use approved execution and the exact committed Git SHA. Test candidate separately, then stage/review exact bytes, run canonical privacy gate and active hooks, commit and push main to origin/main. Preserve every excluded file/hunk and the linux-config learning edits. Next: verify a Vercel deployment for the pushed commit. No Git history rewriting or dirty-tree deployment.

Standalone commit verification completed: npm test 147/147; npm run build passes; full browser suite 36/36 on temporary port 4176. Updated stale-getter regression failed with the old App filter (expected paused [false,false], observed [true,false]); after restoring the scoped handler, build and full suite passed. Candidate-only port override was restored. A first harness attempt timed out before tests because preview still bound 4173; corrected the candidate command to 4176. This was a test-harness warning, not an app failure.

Direct-write attribution: PlayerSurface zoom hunk; App Play all handler only; style fullscreen zoom only; manager ONLINE retry only; one newly authored ONLINE guard regression; two newly authored browser tests; sidebar command-count expectation; scoped README/architecture/smoke/validation/lesson additions; this plan and 2026-10-23 incident. No older native autoplay, intent-reset, native-resume or fixture-preview hunk enters the candidate. All 14 paths are below 3 MB. README gate pass_no_change. Code review: no blocker. Milestone ready to commit and push to origin/main after exact staged privacy check; next verify Vercel deployment of that exact SHA.

Remaining working-tree changes excluded from this commit (mixed-file remainders included): `.aws`, `README.md`, `docs/architecture.md`, `docs/postmortem/2026-10-22-chat-crop-verification.md`, `docs/postmortem/2026-10-22-chat-hiding-task-handoff.md`, `docs/postmortem/2026-10-22-fps-prompt-skill-path.md`, `docs/postmortem/2026-10-22-mrsavage-blurred-playback.md`, `docs/postmortem/2026-10-22-play-all-paused.md`, `docs/postmortem/2026-10-22-reload-discovery.md`, `docs/postmortem/2026-10-22-simultaneous-playback.md`, `docs/smoke-tests.md`, `docs/validation.md`, `plans/chat-percentage-crop.md`, `plans/mrsavage-playback.md`, `plans/play-all-on-reload.md`, `plans/stream-controls.md`, `plans/stream-playback-stopping.md`, `plans/twitch-multiplayer.md`, `prompts/hide-twitch-chat-chrome.md`, `prompts/stream-fps-auto-quality.md`, `src/App.tsx`, `src/components/ChatPanel.test.ts`, `src/components/ChatPanel.tsx`, `src/components/Sidebar.tsx`, `src/domain.test.ts`, `src/domain.ts`, `src/player/manager.test.ts`, `src/player/manager.ts`, `src/player/twitch.ts`, `src/style.css`, `tasks/lessons.md`, `tests/bitrate.spec.ts`, `tests/chat-crop.spec.ts`, `tests/compact-chat.spec.ts`, `tests/fake-twitch.ts`, `tests/playback.spec.ts`. The canonical linux-config ledger/reference update is outside this repo and is not committed here.
