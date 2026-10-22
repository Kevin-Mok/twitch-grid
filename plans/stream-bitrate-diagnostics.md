# Stream bitrate diagnostics

Show each stream's Twitch-reported playback bitrate and a combined total so the user can inspect aggregate stream bandwidth. Remove the misleading visible numeric FPS reading. Actual network download speed and screen-presented FPS are unavailable through the supported embed API.

## Context and scope

The user reports four streams looking like 15 FPS despite provider counters around 45–64, and confirms one stream is smooth. That supports investigating combined workload but does not diagnose CPU/GPU/network. The latest request is “show dl speed of all streams.” Official Twitch docs expose `getPlaybackStats().playbackRate` in Kbps, explicitly playback bitrate, not transport download speed. Use an honest “Stream bitrate” label; do not infer internet capacity or count iframe resource timing as complete network traffic.

Current `git status --short` captured before changes. Preserve all pre-existing FPS/playback/layout/docs and concurrent quality-notice changes. No commit/push, dependency, storage migration, network probe, per-frame work, automatic quality cap or new polling. Existing two-second sampling and native quality preferences remain.

## Atomic implementation checklist

- [x] Read API/source and map sample → snapshot → UI. Settle playback-bitrate distinction before edits.
- [x] Add defining adapter/manager/browser tests and observe expected RED.
- [x] Replace misleading FPS diagnostic with validated playback bitrate, using the existing freshness guard and inactive/unavailable states.
- [x] Show each tile's bitrate and a total in the sidebar via transient App state. Count reporting streams and mark partial totals; exclude unavailable readings without claiming zero traffic.
- [x] Run focused/full unit, typecheck/build and browser checks; verify actual SDK rate in a live probe if feasible.
- [x] Update README/architecture/validation/smoke checks, reconcile FPS plan and living stutter report, and review final diff.

## Verification and risks

Adapter: valid/absent/invalid/throwing/hidden/stale stats, in-place changes and cleanup. Manager: only active samples, lifecycle resets, no saved quality changes. Browser: two distinct rates sum correctly, partial/paused/missing/removal states, retained iframe, labels and 390/768/1280/1440 widths. Fresh runtime SDK playbackRate establishes metric availability only, not user's true download throughput or stutter cause.

Rollback only session bitrate/UI/test/doc hunks; keep prior fixes and unrelated user work. The FPS provider counter is retired from normal UI; `FPS —` explicitly means displayed FPS unavailable. Do not manufacture an “effective FPS” by subtracting unmatched dropped-frame averages.

## Progress and review

Investigation: one stream is smooth per user, four are visibly choppy despite 63–64 provider FPS. The counter is unsuitable for judging that smoothness. Supported playback bitrate will replace it as an honestly labeled bandwidth diagnostic. Live lag remains unresolved.

## Cursor continuation prompt

Read this plan and the reported-FPS stutter incident. Preserve existing dirty work. Verify per-stream and combined Twitch playback bitrate, partial/unavailable labels and unchanged Auto/manual preferences; never call this actual download speed or displayed FPS. Use existing polling, keep diagnostics out of persisted data, retain iframes, and run adapter/manager/browser checks plus typecheck/build. Continue investigating multi-stream lag separately using the one-stream-smooth observation.

Suggested commit: `feat: show per-stream and combined playback bitrate`.


RED: dedicated test agent observed two defining unit failures (missing sample/snapshot bitrate fields;10 passed) and one browser failure (missing aggregate note) before implementation. GREEN: fresh 136 unit tests, typecheck and build passed after chat owner completed its concurrent TDD schema edit. Bitrate browser passed; initial complete suite 27/28 passed, with only grid owner's deliberate two-column RED pending its implementation. No unrelated chat/grid source was modified by this task.

Live built-app evidence: two public embeds reported 3.11 and3.14 Mbps, and the sidebar total was6.25 Mbps with2/2 reporting. Separate browser-only video diagnostics observed both videos advancing (times6.024286→7.781809 and7.045716→8.780759; frame counters310→415 and369→474) over two seconds. Pause cleared rates/total to unavailable, both iframe references remained connected. Neither restored a bitrate within the16-second resume window, so successful real upstream resume is not claimed. The app uses only the public SDK; direct video inspection was limited to isolated test automation.

Independent evidence review found no actionable bitrate conversion, summation, stale/lifecycle, persistence or quality-policy issue. Header containment browser assertions pass at390/768/1280/1440; total includes all current reporting streams, not just filtered/visible rows. README gate is update_in_same_change for truthful bitrate/FPS limitations, with existing intro/stack/setup order retained.


Final owned-scope checks: dedicated tests agent ran fresh `npm run typecheck`, `npm run build` (29 modules), and `npm run test:browser -- tests/bitrate.spec.ts tests/playback.spec.ts`: all exited0, browser2/2. The earlier coherent full unit run was136/136. Full-browser27/28 passed before grid GREEN; its lone failure was the grid owner's intentional RED. Following that fix, another task introduced6 expected chooseQuality RED cases (reported136/142 passing by the grid task). These are separate in-progress quality work, not silently omitted passing tests. Both owners were notified; no unrelated tests/code were weakened. This diagnostics task's acceptance is supported by its fresh build, focused boundary/browser tests, actual live bitrate sum and independent source review. No claim the whole shared checkout is currently all-green.

Canonical learning: stutter/metric report hash6d43f7b874f7ebcd2ee98186ed86639f4c2b720e65f831a56e01d27a39f1dc4a registered as ext-twitch-fps-presentation-gap (lag unresolved, diagnostic boundary confirmed); concurrency report hash9c7a804562f111cc7b13e23766128909471e595b4f4523c0205339645b212b91 registered no-new-learning. Both canonical targeted checks exited0 with no errors/changed/unregistered aliases. Preserved other ledger entries and installed copies. No configuration changed, commit or push performed.

Remaining limitations: true HTTP/network download speed, screen-presented FPS and multi-stream bottleneck remain unavailable/undetermined. User-confirmed single-stream smoothness is evidence of combined-workload sensitivity, not a GPU/network diagnosis. Separate quality/grid/chat tasks continue under their owners; rollback only this task's bitrate and retired-numeric-FPS hunks. The docs and exact manual checks now match the narrowed final behavior.


## Follow-up: megabytes and compact total

Latest request: use megabytes per second for every stream and show a small, nonintrusive total in MB/s. Reuse existing Kbps samples; decimal conversion is Kbps /8000. Keep the sidebar total but add a small pointer-transparent fixed badge that remains visible with sidebar closed; exclude missing readings and mark partial totals exactly as before. No new data collection, storage or timer. Initial dirty state captured before this follow-up; preserve concurrent quality/chat/grid work.

- [x] Update the defining browser expectations and observe RED for MB/s conversion and a sidebar-independent total.
- [x] Convert tile/sidebar labels and add one compact total; verify size, containment, pointer transparency, partial/unavailable states and frame retention.
- [x] Run focused checks, typecheck/build, update current behavior docs and record evidence. Suggested commit: `feat: show stream bandwidth in megabytes per second`.


MB/s verification: dedicated test agent observed RED (expected0.38 MB/s, got3.00 Mbps), then fresh typecheck/build and focused browser case passed1/1. The case verifies 3000/5000 Kbps→0.38/0.63 MB/s with raw aggregate1.00 MB/s; sidebar-independent badge visibility, width<170px, height<28px, viewport containment and pointer-events:none at390/768/1280/1440. Pause gives partial0.63, missing stats gives Total—MB/s; iframe retained and metrics not persisted. Desktop1440×900/mobile390×844 screenshots were captured with the sidebar closed and inspected. New visual badge does not add layout space, a timer or network request. Initial isolated preview launch hit the known sandbox loopback restriction; the authorized retry passed. Full suite was not repeated for this display-only refinement. No commit/push.

Cursor continuation for this refinement: keep upstream Kbps untouched; verify every visible rate uses decimal MB/s (divide by8000) and the small fixed total remains visible with sidebar closed, partial/unavailable state and pointer transparency. Preserve concurrent quality/chat/grid work, no new measurements or persisted fields. See updated README, architecture, validation and grouped smoke checks.

The existing tooling report reviewed hash was refreshed to d153b3ca0688b42843173a94b1ca34697f2f8c984c10ccf1e58af690eb1002fe after the known loopback observation; targeted canonical check exited0 with no errors/changed/unregistered aliases. MB/s refinement complete; no changes to upstream sampling semantics or quality behavior.


## Placement refinement

Latest user request places the discreet total at the top right. Move only the fixed badge's vertical anchor from bottom8px to top8px, retaining its small type, partial/unavailable values, pointer transparency and sidebar-independent visibility. Preserve all dirty state captured before this edit. Current README, validation and grouped smoke checks now say top right. No new tests for this reversible CSS-only change; use the existing browser case plus a four-stream visual check after a fresh build. Suggested commit: `style: move bandwidth total to top right`.

- [x] Move the fixed anchor and align current docs.
- [x] Verify existing bitrate behavior and desktop/mobile placement without blocking controls.

Placement visual review: the initial top8px anchor overlapped tile header controls in four-stream desktop/mobile screenshots. Refined to a thin9px text readout at top0 with zero vertical padding/border, fitting above header button bounds without adding a bar or layout space. Pointer transparency remains. First build and existing browser case passed1/1; final visual confirmation follows.

Final placement verification: fresh production build passed (29 modules), existing bitrate browser case passed1/1, and updated four-stream desktop1440×900/mobile390×844 screenshots were inspected. The badge spans y0–9.89px; first-row buttons start y16 desktop and y12.25 mobile, leaving6.11px/2.36px clearance. No visible control overlap; pointer-events:none retained. No layout space, sampling or persisted settings changed. Full suite not repeated for this CSS-only placement refinement. No commit/push.


## Screenshot-directed minimal readout

Latest screenshot specifies the bottom-right corner of the video area, immediately left of chat, with minimal text. Supersedes the prior top-right placement. Render only `1.00 MB/s`, `~0.63 MB/s` for partial coverage, or `— MB/s`; retain full reporting/metric explanation accessibly and the detailed sidebar count. Anchor the readout to a stable video-region wrapper outside the viewport's scrolling content so opening/resizing chat moves its corner naturally without covering the composer. No new measurements, timers or persisted preferences; preserve all unrelated dirty work.

- [x] Observe RED for minimal value-only content, then move the readout into the video region.
- [x] Verify chat-relative corner geometry, sidebar toggles, retained frames and partial/unavailable semantics; run typecheck/build and focused browser checks.
- [x] Reconcile current README/architecture/manual checks and record final visual evidence. Suggested commit: `style: place minimal bandwidth readout beside chat`.

The initial RED runner could not bind4173 because another listener is active; it was preserved. The test agent will use an isolated temporary config/port. No RED assertion has been observed yet and no production implementation was changed at that point. Existing canonical port/concurrency evidence applies; do not kill another listener.

Tooling lookup record: `Playwright preview port in use concurrent EADDRINUSE` returned no directly applicable canonical remedy. The observed occupied port and temporary-config cwd error justify isolated4291 configuration only; tracked config and external listeners remain unchanged. Mobile chat retains its existing overlay behavior and can cover the video-pane readout; desktop chat reserves its own adjacent pane.

Minimal readout GREEN: fresh typecheck/build passed (29 modules), and bitrate+compact-chat browser cases passed2/2 using isolated4291 config. Desktop1440×900: video edge/chat start x1200, readout right1188 and bottom892 versus video bottom900. Mobile390×844 with chat closed: right378 versus video edge390, bottom836 versus video bottom844. Both give12px right/8px bottom inset. Screenshots inspected: value-only readout sits in the requested video corner, without chat overlap. Existing frame-retention, partial/unavailable and non-persistence checks passed. Full suite not repeated; no new polling, measurements or persisted settings. Current README/architecture/validation/manual checks match the final position and minimal text. No commit or push.

Final tooling learning record: existing report reviewed hash refreshed to3e8394fca3324396a8ed0279ae9c87284498eea41a36d486df85c15f947f1d15; canonical targeted check exited0 with no errors/changed/unregistered aliases. Existing entries and other listeners preserved. No outstanding write/verification blocker for this placement refinement.


## Download glyph refinement

User asks to replace the compact readout's `~` with a download Unicode symbol. Use `↓` consistently for reporting/unavailable states (for example `↓ 0.63 MB/s`); keep partial coverage and counts in the accessible description and sidebar. Scope only the aggregate readout, not concurrent Twitch FPS estimates. Initial dirty state captured; existing browser assertions updated for the glyph and accessible partial status. No new tests, sampling, layout or storage behavior. Fresh build (including TypeScript) and focused bitrate browser case passed1/1 on isolated4291. Full suite not rerun for this glyph-only change; no commit/push. Suggested commit: `style: use download arrow in bandwidth readout`.


## Session commit delivery

The user explicitly requested `commit-session`. Scope helper could not detect successful writes through this session's tool wrapper, so attribution uses the captured pre-write dirty baseline and directly observed edits. Mixed source/docs/tests are projected onto committed prerequisites in a separate temporary candidate; the working checkout's unrelated chat crop, name formatting, startup/resume, fixtures and baseline plans remain excluded. `.aws`, the baseline prompt and other unowned files are excluded. Native task `c7e00dc` restored the user-approved labeled FPS estimate; this delivery preserves that committed behavior and supersedes the interim FPS-retirement wording above.

- [x] Review attributable hunks and matching plans/docs against the baseline.
- [x] Prepare an isolated candidate with unchanged committed FPS, quality and layout prerequisites.
- [x] Complete exact-candidate automated checks, evidence review and README gate.
- [x] Inspect the isolated staged diff; run the blocking public privacy gate immediately before the commit attempt.
- [ ] Commit `feat: show stream bandwidth in MB/s` and push `main` to `origin/main`.

Rollback removes only this commit's bitrate fields/props/UI/tests and matching docs; persisted data is unchanged. No app deployment target is configured in the baseline. Live user-desktop smoothness/audio and actual network download throughput remain unverified. Earlier verification paragraphs describe prior implementation phases; fresh isolated-candidate evidence follows before commit.

Fresh isolated-candidate verification on committed prerequisite `c7e00dc`: `npm test` passed144/144 across10 files; `npm run typecheck` and `npm run build` exited0 (29 modules); full browser suite passed30/30 using a temporary candidate-only Playwright configuration on4291. This includes exact MB/s conversion, raw aggregate sum, download arrow, sidebar-independent/chat-relative readout, partial/unavailable/lifecycle behavior, retained iframes and non-persistence. Independent evidence review found no code blocker and confirmed the projection changes no unlisted baseline files. README gate passed against this candidate. Own incident/session docs were anonymized before public staging. No actual HTTP throughput or user-desktop stutter repair is claimed.

Delivery milestone: `feat: show stream bandwidth in MB/s` includes the matching plans, current behavior docs, grouped smoke checks and incident records. Commit/push execution follows exact staged-diff and privacy-gate review; the resulting SHA is reported in Codex output. No deployment is attempted from this task because no Vercel project is linked in the committed prerequisite; a separate deployment task may configure it later.

Final prerequisite advanced to `898197d` when its owning task committed channel casing/status formatting. The protected-HEAD staging guard rejected the older candidate before writing an index; the projection was regenerated rather than reverting that commit. The final combined candidate preserves entered casing, numeric FPS/status formatting and now uses the requested `↓` for per-stream rates too. Fresh final checks passed145/145 unit tests across10 files, typecheck/build exit0 (29 modules), and31/31 browser tests (25.4s) with the same isolated4291 runner. Staged diff contains20 attributable source/test/doc/plan files and passes whitespace checks; default index is untouched. Independent review found no code blocker. A stale architecture sentence about the FPS prefix was repaired to match the accepted numeric display.

Deployment status changed externally during this commit workflow: the Vercel setup task linked `twitchgrid` to `main` and the channel-format owner verified its preceding commit deployed automatically. After this session's push, check the deployment's exact Git SHA and public assets; do not upload the shared dirty checkout. No extra implementation scope is added.

Canonical incident review hashes after anonymization/tooling evidence: tooling`b468f7f5fa9497408ccef08fc222d6df72c2130c7a02d27658098f0dc4a311ab`, stutter`2f1da93dc1760326fa3c7aecad930b37f337019d30a41cfee941eb9a11ce942e`; targeted checks returned no errors/changed/unregistered aliases. These external knowledge updates are not bundled with the app commit.
