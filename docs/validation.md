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
