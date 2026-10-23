# Validation results

This record separates deterministic application checks from real Twitch and reference observations. Use the saved command log to reproduce automated checks, then follow [smoke tests](smoke-tests.md) for playback, audio, login and live transitions that fixtures cannot establish.

## Executed application checks — 2026-10-22

Environment: Linux, Node 22.15.0, npm, TypeScript 5.9.3, Vite 8.3.5, Vitest 5.0.5 and Playwright 1.64.1 with installed Google Chrome. Full output and exit statuses: [automated validation log](evidence/validation-automated.log).

| Command / scenario | Observed result | Scope |
| --- | --- | --- |
| `npm test` | Exit 0; 8 files, 128 tests passed | Domain/schema/import boundaries, storage/migration/recovery, layout, manager lifecycle/intent/quality/audio, chat configuration and transfer UI |
| `npm run typecheck` | Exit 0 | Application and test TypeScript |
| `npm run build` | Exit 0 | Production static output; 29 transformed modules |
| `npm run inspect` | Exit 0; 2 referenced entry assets resolve, 3 files, 283.3 KiB | Built HTML/JS/CSS inventory; not a playback check |
| `npm run test:browser` | Exit 0; 18/18 passed | Chromium serves `dist` through preview; SDK/player/chat responses use a controlled test fixture |
| Preferred dev port occupied | Vite selected 5174 when an owned listener occupied 5173; original listener preserved | Real startup fallback; temporary owned processes stopped afterward |

Browser coverage includes five retained iframe identities/navigation counts across reorder, resize, sidebar/chat, focus and layout changes; independent audio/quality and paused intent; overlapping profiles; offline hiding/return; invalid shares; blocked SDK; corrupt/blocked storage; protected import; backup download/replace; shared-link application; Ctrl+B typing guards; 1/2/3/5/8-player dimensions at 1440×900 and 1280×900; reachable controls at 390px and 768px. Targeted reload isolation and provider observation error recovery are covered by manager unit tests, not real upstream failure experiments.

Defining failures were observed before implementation. Final review added regressions for late PLAYING after explicit pause, stale startup audio samples, READY before adapter-handle resolution, error-to-valid-sample recovery, protected corrupt storage during imports, and unrelated URL query leakage in generated links. The query regression failed with the synthetic `?token=private-example&ref=personal` before the one-line correction; no real private value was used.

## Real Twitch smoke checks

The isolated `multiplayer-validation` browser profile used HeadlessChrome 156 on Linux at 1440×913, against a static build at `http://localhost:4174/`. Browser-reported hardware: 12 logical cores and 32 GiB device memory; CPU model, GPU acceleration and physical audio output were not established. No throughput benchmark or simultaneous 1080p capacity claim is made.

Selected read-only probe outputs and their limits are preserved in the [sanitized real-smoke record](evidence/real-smoke.json).

- The official script and ESLCS player loaded with `parent=localhost`. Twitch identified ESLCS as live and supplied `auto`, `chunked`, `720p60`, `480p30`, `360p30`, `160p30` choices. Actual sampled quality was `auto`; this is not evidence of decoded frames.
- The video iframe measured 1148×645.75 with chat collapsed. Ancestor opacity/visibility and IntersectionObserver v2 reported a fully visible frame. A saved [real-player screenshot](evidence/rebuild-real-player.png) shows a **paused preview**, not confirmed playback.
- Both app and native Play were attempted. Twitch logged an autoplay “style visibility” warning. App desired intent remained playing while sampled playback remained paused; a bounded 12-second message capture saw state updates without PLAY/PLAYING/PAUSE.
- A bare 1000×600 official SDK player in the same disposable browser, without app layout or initialization setters, also failed to establish moving video. It emitted READY/ONLINE, reported muted=true and paused=false, but `getCurrentTime()` stayed at 1.512999 across a five-second sample, with fps=0, bufferSize=0 and no PLAYING event. This isolates an incomplete startup outside the app as well; it does not establish the exact cause or prove the app's integration correct. No policy bypass was attempted.
- The official chat embed loaded the public welcome message and compose/settings controls for ESLCS. No account login, message sending, subscription or account action was performed. Signed-in interaction and audible output remain unverified.
- Switching the automation-selected tab away and back retained the exact connected video iframe. Headless Chrome emitted no visibility-change event and continued reporting visible, so this does **not** establish a real background-tab or suspension result.

Twitch does not document its complete visibility algorithm. Minimum size and unobscured rendering requirements are described in [Twitch embedding requirements](https://dev.twitch.tv/docs/embed/) and [video API documentation](https://dev.twitch.tv/docs/embed/video-and-clips/). A [Twitch Developer Forum report](https://discuss.dev.twitch.com/t/embed-api-autoplay-disabled/64205) describes the same warning without a definitive universal remedy. There is no undocumented autoplay bypass in this app.

## Reference comparison and inspection

[Research](research.md), the [feature matrix](feature-parity.md), [sanitized REA evidence index](evidence/rea-evidence-index.json) and [Viewington profile fixtures](evidence/viewington-profile-fixtures.json) contain exact versions, evidence IDs, hashes and reproduction limits. REA 6.7.0 inspected the live web application and selected Electron resources from the official Windows 0.6.8 installer. The installer was not executed on Linux. Temporary installers and third-party bundles are outside the delivered app.

Original and rebuild screenshots use a 1440×913 viewport. The comparison concerns compact controls, channel/profile workflow and video geometry; different live video frames are not visual failures. The rebuild uses a docked sidebar, logical 8px gaps, a grid scaled to fit the viewport and one right chat panel. It preserves overlapping profiles' player instances, where the inspected reference web app recreated them. Reference overlay-sidebar behavior, customizable settings and Electron integrations are explicit parity gaps rather than implied matches.

## Remaining checks and useful next work

1. Resolve or characterize the real playback restriction with a visible desktop browser; verify advancing video and human audible output independently, then repeat with five currently live channels at recorded qualities.
2. Observe an actual hidden offline-to-online transition and sustained background playback. Fixture event handling is verified; Twitch's real notification reliability and browser suspension are not.
3. Verify signed-in chat under the user's normal cookie/privacy settings without capturing private account state.
4. Run Windows 0.6.8 only on a suitable host to test native sign-in/session persistence, settings, fullscreen/window behavior and updater integration. Static inspection establishes code presence, not runtime parity.
5. If desired, add reference sidebar resizing, customizable shortcuts/theme/fullscreen policies and opt-in cross-tab sync as separate scoped changes.

The initial build was not deployed, committed or pushed because its workspace supplied no usable Git metadata. Subsequent public repository publication is tracked separately in [the delivery plan](../plans/publish-twitch-grid.md). No separate linter was configured; TypeScript, unit, build, static-artifact and browser checks are the automated evidence. Rollback and extension boundaries are documented in [architecture](architecture.md), with the atomic work plan in [plans/twitch-multiplayer.md](../plans/twitch-multiplayer.md) and a [paste-ready continuation prompt](../prompts/continue-twitch-multiplayer.md). Suggested initial commit when a real repository is available: `feat: add static Twitch multistream workspace`.

All six task postmortems were reviewed and registered in the canonical `linux-config/dot_agents/skills/postmortem-memory` ledger. Each targeted `check --postmortem` returned exit 0 with no changed/unregistered aliases or errors. Existing ledger records were preserved. New guidance separates verified async-state/privacy fixes, bounded REA analysis workarounds and unresolved real playback evidence. Only canonical learning data/guidance was edited; no installed copy, system configuration or live desktop setting was changed.

## Public repository publication checks

Fresh checks in the separate ordinary checkout passed: `npm ci` (94 packages, zero vulnerabilities), 128 unit/integration tests, TypeScript, production build, static artifact inspection and 18 browser tests. The public log appends the exact sanitized commands and exit statuses. Initial temp-directory writes were denied outside the original writable root; approved reruns passed without source changes, as recorded in the [permission report](postmortem/2026-10-22-publication-checkout-permissions.md). The user-reported [two-stream playback failure](postmortem/2026-10-22-simultaneous-playback.md) remains unresolved. No website deployment is part of repository publication.

Publication privacy review: the shared staged gate passed after normalizing browser-version evidence, retaining the userinfo test through structured URL construction, and approving only the confirmed public GitHub noreply identity in an external mode-0600 policy. No scanner changes or broad content exceptions. The exact final index is checked again before commit. See the [privacy review](postmortem/2026-10-22-publication-privacy-review.md).


## FPS diagnostics (superseded)

The original saved request initially asked for FPS-based app downgrades. After investigation exposed the public API's missing sample timestamps/ad-state signal, the user explicitly chose **FPS diagnostics; keep Twitch Auto**. The delivered scope has no app adaptive-quality loop and does not claim a guaranteed 30 FPS target. [Atomic plan and Cursor continuation](../plans/stream-fps-auto-quality.md).

Official [Twitch Embed API](https://dev.twitch.tv/docs/embed/video-and-clips/) documents `getPlaybackStats().fps` as playback FPS, unavailable in some browsers, without specifying decoded versus presented semantics. The current public SDK returns cached videoStats seeded with zero. Runtime player-core inspection shows a frame-rate tracker derived from decoded-frame count deltas; this explains the observed metric on this build, not a portable presented-frame guarantee. No cross-origin video DOM access is added to the app. The six-second unchanged-object/FPS expiry is conservative and cannot replace a provider timestamp.

An isolated real Chrome/Chromium probe of Stream B and Stream A used two 640×360 official embeds. Both emitted READY/ONLINE/PLAY/PLAYING; four five-second samples reported roughly 57–60 FPS, 1280×720 native resolution, and increasing skipped-frame counters. The selected quality remained `auto`. These are SDK observations; they do not diagnose the user's hardware/network or prove human-perceived smoothness/audio. Public live-channel availability changes over time.

Defining RED: adapter/manager targeted run had 10 passing and two expected failing tests, missing FPS in the sample and snapshot. Fresh GREEN checks passed: `npm test` 135/135 tests across 11 files; `npm run typecheck` and `npm run build` exited 0; `npm run test:browser` passed 27/27. The adapter test exercises the real adapter against the SDK-shaped boundary; browser fixtures prove UI behavior only. The separate official SDK/live-app probes establish actual metric availability on this environment. Manual checks are grouped in [smoke-tests](smoke-tests.md#playback-diagnostics-and-stream-bitrate).


Final built-app live check used isolated Chromium at 1440×900, then 390×900. Stream A's indicator progressed 18 → 54 → 60 FPS. A separate browser-only diagnostic of its actual video observed currentTime 17.562321 → 19.570695 seconds and total frames 1001 → 1121 over two seconds, establishing advancing playback in this run. Stream B remained paused at time 0 / 30 frames and correctly displayed `FPS —`. Pause cleared both labels; after resume and a 16-second observation Stream A returned to 60 FPS and both iframe references were still connected. Stream B remained unavailable, so two-stream simultaneous moving video is **not** claimed. An earlier app run showed numeric values on both streams (44/31, 59/46, 58/29), but did not include independent frame-counter verification. The prior screenshot also exposed an ad break. No ad-state detection is promised.

The browser-only video probe is diagnostic automation, not application code; production uses only the public SDK. Desktop screenshot review found the compact header contained; mobile retains existing overlay/sidebar scrolling. The automated browser case checks numeric/unavailable states, pause/resume, Auto neutrality and indicator bounds at 390/768/1280/1440. Human audio, assistive-technology hardware and GPU/network diagnosis remain unverified. The final source review found no app FPS-based quality writes. The upstream implementation inspected was [Twitch player core variant](https://assets.twitch.tv/assets/player-core-variant-b-fcf7a8488c34bbbea447.js); the public contract remains the official Embed API, rather than these implementation details.


### Visible-stutter follow-up

A subsequent user report showed roughly 42–44 FPS labels on four streams while motion felt closer to 15 FPS. A static screenshot cannot establish actual presented FPS. The visible diagnostic now says `Twitch … FPS`, and the tooltip/accessibility description explicitly says an averaged provider counter is not measured screen smoothness. The app does not convert dropped-frame counts into a fabricated “actual FPS.” This wording fix does not resolve the playback degradation; the one-stream versus four-stream comparison is pending user observation. See the [living report](postmortem/2026-10-22-reported-fps-visible-stutter.md).


## Stream bitrate diagnostics

This section records the implementation in chronological phases. Later MB/s, placement and glyph refinements supersede earlier display descriptions. The separately committed fast FPS estimate supersedes the temporary numeric-FPS retirement.

The user rejected even provider-prefixed FPS because the video still looked like 15 FPS, confirmed a single stream is smooth, and requested download speed for all streams. Numeric FPS is now retired; `FPS —` explicitly means displayed FPS unavailable. Each tile instead shows Twitch-reported `playbackRate` converted from documented Kbps to decimal Mbps. The sidebar sums the currently reporting streams and marks partial coverage; unavailable or paused streams never imply zero network traffic. **This is playback bitrate, not actual network download speed.**

The existing two-second adapter loop, active-playback/lifecycle guards and conservative six-second cache expiry are reused. Transient metrics flow through the manager and App to the sidebar without storage/schema changes. Auto/manual quality behavior and iframe identities are unchanged. [Atomic plan and Cursor prompt](../plans/stream-bitrate-diagnostics.md); [manual checklist](smoke-tests.md#playback-diagnostics-and-stream-bitrate).

Defining RED: two targeted unit tests failed on missing bitrate data (10 passed), and the browser case failed on the absent aggregate. First GREEN attempt passed 133 unit tests and typecheck, but concurrent chat TDD edits invalidated the following build; the browser run used old dist and is not acceptance evidence. The [concurrency incident](postmortem/2026-10-22-bitrate-validation-concurrent-chat.md) records that boundary. Fresh coherent-build results follow below.


Fresh coherent checks after the chat owner's implementation passed: 136 unit tests, typecheck and production build. Bitrate and chat-crop browser cases passed; full suite was27/28 while the separate grid owner was deliberately reproducing its two-column RED. Final regression results are recorded below after that GREEN. Independent bitrate source review found no actionable issue.

Actual built-app probe: per-stream readings3.11 and3.14 Mbps produced sidebar6.25 Mbps,2/2 reporting. Both actual video current-time and frame counters advanced in the isolated browser. Pause produced unavailable rates/total and both iframe references remained connected. Rates did not return within the16-second resume observation, so live resume success is not claimed. This verifies availability/summation of Twitch playback bitrate, not actual network download speed, internet headroom or the user's multi-stream stutter cause. NumericFPS never appears in the UI.


Final diagnostics validation: fresh typecheck/build and focused bitrate/native-playback browser tests2/2 passed. The earlier coherent full unit run passed136/136. The shared checkout then included intentional RED work from the grid and quality tasks; the latter reports6 expected chooseQuality failures (136/142 passing). These do not establish an all-green shared checkout and are owned by their respective tasks. Bitrate source review, owned focused checks and live summation passed; no unrelated tests were weakened to obtain that result.


### MB/s and compact total

The latest refinement converts all current stream/total displays to decimal **megabytes per second**: documented Kbps /8000. In the controlled fixture, 3000 Kbps→0.38 MB/s and 5000 Kbps→0.63 MB/s; their raw sum→1.00 MB/s (sum before rounding). A small top-right total remains visible with the sidebar closed and is pointer-transparent, avoiding an extra bar or blocked controls. Missing/partial behavior and the playback-bandwidth caveat remain. The earlier Mbps observations above are historical raw-metric evidence.

Defining RED observed: the browser expected0.38 MB/s but got3.00 Mbps before implementation. Fresh verification follows in the active plan.

Fresh MB/s refinement checks: typecheck/build exited0; focused bitrate browser1/1 passed. The test covers exact conversion/sum, partial/unavailable readings, compact badge containment/pointer transparency at390/768/1280/1440, sidebar closed and iframe/storage isolation. Desktop/mobile screenshot review passed. No upstream measurement semantics changed; these remain estimated playback-bandwidth values.

Top-right placement refinement: fresh build and existing bitrate browser case1/1 passed. Four-stream screenshots at1440×900 and390×844 show the thin readout above player buttons; measured clearances6.11px and2.36px. Placement does not change player layout or intercept clicks.


### Minimal readout beside chat

The screenshot-directed refinement supersedes the top-right placement. The rate now anchors to the bottom-right of the video area, immediately left of chat; the visible text is only `1.00 MB/s`, `~0.63 MB/s` for partial coverage, or `— MB/s`. The accessible description retains reporting counts and metric limits. A stable `.video-region` flex wrapper holds the scrolling PlayerSurface and the absolute pointer-transparent readout, with no reserved bar/spacing or persisted change.

RED observed on isolated preview4291: the existing readout said `Total 1.00 MB/s` while the new defining test expected `1.00 MB/s`. The occupied4173 listener was preserved. The temporary config initially omitted its webServer cwd; correcting only that temporary configuration allowed the intended assertion to run. Acceptance awaits a fresh coherent build and focused chat/bitrate regressions.

Fresh final validation: typecheck/build passed and bitrate+compact-chat browser cases2/2 passed on isolated4291. Desktop with chat and mobile with chat closed both place the value-only readout12px from the video pane’s right edge and8px from its bottom. Desktop readout stays left of chat. Screenshots were inspected; player/frame-retention and partial/unavailable checks pass. Full suite not repeated for this refinement.

Latest compact-label refinement uses `↓` in place of the partial tilde: `↓ 0.63 MB/s` or `↓ — MB/s`. Partial reporting remains in the accessible description and detailed sidebar count; upstream measurements, position and unit conversion are unchanged. Existing browser expectations cover the arrow and preserve accessible partial status.

## Fast labeled FPS estimate

The user approved restoring an explicitly labeled provider estimate. `Twitch ~… FPS` uses the first finite positive `getPlaybackStats().fps` on the existing two-second poll, then averages up to five readings over roughly ten seconds. A five-second response is conditional on valid provider data; startup, blocked playback and unsupported browsers can remain unavailable. Invalid/stale/hidden/paused stats, lifecycle events and quality changes reset the window. Refresh calls less than one second apart cannot overweight the estimate. This does not calibrate the counter into presented frames or fix visible stuttering. No quality policy or persisted data changes.

Adapter and manager defining RED tests confirmed missing FPS data before implementation. Current verification is recorded in [the atomic plan](../plans/fps-estimate.md). The desktop bridge returned BRIDGE_NOT_READY, so actual desktop startup timing and visible smoothness remain unverified.

Fresh estimate verification: 148/148 unit tests across ten files, typecheck and production build passed. Full browser suite scheduled 33 cases; all listed passed and final `.last-run.json` status is passed with no failed tests (final count-summary line was not captured). The browser case covers `Twitch ~60 FPS` within five seconds, pause clearing and header containment at 390/768/1280/1440 widths. Adapter regression covers first reading, averaging, duplicate refresh, invalid/hidden/paused/stale/quality/lifecycle resets and old-history expiry after a 30-second gap. Actual desktop timing/smoothness remains unverified.

Final browser count captured explicitly: `npx playwright test --reporter=dot` exited 0, **33 passed (24.4s)**. This resolves the earlier missing summary line.

Commit-session isolated candidate verification on HEAD 9fe9e73: **142/142 unit tests**, typecheck/build exit 0 and **29/29 browser tests**. This candidate includes only FPS work and already committed prerequisites; earlier 148/33 results describe the shared dirty checkout.


## Channel name and status formatting

The latest header refinement preserves entered capitalization in an optional validated display name while retaining lowercase channel identity. Existing lowercase entries can be updated by adding the same login with the desired casing. Tile/sidebar/chat labels use it; local data, profiles and JSON backups retain it. Older data remains valid. Share links retain their existing lowercase format. No authenticated or third-party metadata lookup is introduced.

Online headers retain the accessible green status dot and omit the visible Live label. Numeric FPS now reads `60 FPS`; its tooltip and accessible label still identify Twitch's provider estimate and its limits. Offline, error, unknown and unavailable diagnostic states remain explicit. Verification evidence is maintained in [the channel formatting plan](../plans/channel-status-format.md).


Commit-session standalone candidate on HEAD c7e00dc: npm test **143/143** across ten files; npm run build (including typecheck) exit 0; full npx playwright test **30/30** exit 0. Candidate excludes uncommitted bitrate/chat-crop/playback work. Its standalone channel-status scenario verifies casing re-entry, no duplicated/replaced iframe, sidebar/chat labels, accessible online status without visible Live and reload persistence. No real Twitch or screenshot check was performed.

## Single-stream focus and fullscreen (2026-10-23)

Final working-tree verification after the safe no-Auto fallback: 152/152 unit tests (`npm test`), TypeScript/Vite build (`npm run build`), and 40/40 Playwright cases. The browser suite used an isolated temporary config on 4174 because 4173 was already occupied; that listener was preserved. See [plan and exact evidence](../plans/fullscreen-priority.md).

Defining regressions failed before correction: focus left three visible tiles, priority issued no quality requests, and a missing-Auto fallback selected Audio only. Tests now exercise selected-only focus and native tile/iframe fullscreen, temporary Source/background-lowest requests, restoration, absent renditions, offline/reload/removal, unchanged sound/settings and retained frame identity. Desktop/mobile fixture screenshots showed one Source tile. These are application/controlled-SDK checks, not measurements of sustained Twitch motion, physical sound or bandwidth savings; follow the shared smoke checklist for those observations.

Commit-session isolation: HEAD plus only the fullscreen session changes independently passed 146/146 unit tests, TypeScript/Vite build and 34/34 browser tests (temporary preview port 4175). The earlier 152/40 results include unrelated dirty work and are not claimed for this commit.
