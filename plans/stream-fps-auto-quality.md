# Stream FPS and Auto quality

Determine whether the supported Twitch embed can measure actual playback FPS, then implement per-stream diagnostics and safe automatic quality reduction only where supported evidence permits it.

## Context and protected state

Saved task: `prompts/stream-fps-auto-quality.md`. No commit or push authorized. Initial dirty files: README; architecture, validation, smoke and simultaneous-playback docs; stream-controls and twitch-multiplayer plans; domain source/tests; manager source/tests; styles; lessons; compact-chat test. Initial untracked files: `.aws`, two existing postmortems, narrow-panels and stream-playback-stopping plans, saved task prompt, narrow-panels and playback tests. Preserve every existing hunk.

Scope: Twitch adapter/types, manager quality behavior, compact player diagnostics, boundary/manager/browser tests and matching docs. No dependencies, storage migration, iframe replacement, audio-only downgrade or automatic upshift. Plan Mode is unavailable in Default mode; this living document supplies the atomic plan.

## Decisions and acceptance gate

Twitch officially documents `getPlaybackStats().fps`, but does not define source versus decoded versus presented FPS. Do not call it presented FPS. Runtime investigation must determine whether it supplies trustworthy achieved playback evidence before enabling automatic reductions. If unavailable, explain the blocked acceptance criteria before building a substantial substitute.

Memory lookup: query `Twitch playback FPS metrics lagging`; matched unresolved `ext-twitch-playback-evidence` and code-scope SDK acknowledgments/native-resume findings. Prior startup failure does not diagnose today's lag; asynchronous setter samples still require care. Tool failures are recorded in `docs/postmortem/2026-10-22-fps-investigation-tools.md`.

## Ordered checklist

- [x] Read saved prompt, capture status, map source and tests, review relevant lessons and official API.
- [x] Characterize the real SDK's FPS semantics/availability and live playback.
- [x] Settle the metric acceptance gate before implementing Auto reductions. User explicitly chose FPS diagnostics with Twitch Auto retained.
- [x] Observe RED on adapter and manager tests; implement diagnostics only.
- [x] Run unit/browser regressions, typecheck/build and actual runtime checks.
- [x] Update README, architecture, validation and grouped Action/Expected smoke checks; review diff and record limits.

## Verification and risks

Boundary tests must exercise the real adapter, not just fabricated sample events. Policy checks, if justified: sustained sub-30 (29.97 tolerance), stable 30/60, transient/missing/stale metrics, manual preferences, lowest/source-limited rendition, pause/offline/loading/background and cleanup. Use existing two-second sampling; sustained window/cooldown must be documented before implementation. Confirm no reconciliation undoes a downgrade. Run `npm test`, `npm run typecheck`, `npm run build`, relevant browser tests through the test agent. Live checks must distinguish official SDK metrics, advancing video, hardware decoding and audio; fibre does not eliminate network causes.

Rollback: remove only session-owned source/test/doc hunks; retain pre-existing work. No history rewrite, commit, push, deployment or global configuration sync.

## Progress and review

Initial investigation (superseded by the completed milestones below): official docs verified at https://dev.twitch.tv/docs/embed/video-and-clips/ on 2026-10-22. The original adapter sampled quality/audio/paused every two seconds without FPS. Independent mapping confirmed manager/UI/type seams. The implemented diagnostics now reuse that loop.

## Continuation prompt

Read this plan and `prompts/stream-fps-auto-quality.md`, including the later user decision to ship diagnostics and keep Twitch Auto. Preserve all pre-existing and concurrent work. Verify the per-stream reported-FPS label, unavailable/stale lifecycle behavior, retained iframe identities and unchanged manual/Auto quality preferences. Do not add an app downgrade loop without a new request and a trustworthy freshness/ad-state contract. Run adapter/manager tests, typecheck/build and browser checks; keep official SDK observations, advancing video and human audio evidence distinct. See docs/validation.md for exact automated/live outcomes and docs/smoke-tests.md for manual steps.

Suggested commit: `feat: show Twitch playback FPS diagnostics`.


## Revised scope after evidence and user choice

The user selected “FPS diagnostics; keep Twitch Auto” in response to the explicit public-API freshness/ad-state limitations. The automatic app downgrade policy, 30 FPS target/cooldown and rendition ordering changes are removed from implementation scope. Auto remains Twitch's own adaptation; saved manual and per-channel preferences remain untouched. No GPU/network bottleneck has been diagnosed.

Real isolated official SDK probe: two 640×360 public embeds (Stream B, Stream A) emitted ONLINE/PLAY/PLAYING and reported 57–60 FPS across four five-second observations; videoResolution was 1280×720 and skipped-frame counters increased. This is reported playback evidence, not human-confirmed smoothness or audio. The current official player core computes a moving framerate from decoded-frame counts; exact screen presentation is not established. The SDK returns cached videoStats, initially zero, with no public timestamp/ad-state signal. The compact UI therefore labels FPS as Twitch-reported playback, not presented frames.

RED: test agent ran `npm test -- src/player/twitch.test.ts src/player/manager.test.ts`: 10 passed, 2 expected failures (adapter emitted no fps, manager snapshot had no fps). Implementation adds optional stats sampling to the existing two-second loop, rejects nonnumeric/nonfinite/nonpositive/hidden samples and expires unchanged cached object references/FPS after six seconds. This is a conservative cache heuristic, not a provider timestamp guarantee. Unsupported stats/throwing getter do not break player status. Manager exposes numeric FPS only after ONLINE + PLAYING and clears on lifecycle events. Existing Auto/manual quality logic is unchanged. New adapter/manager/browser tests cover these boundaries and display semantics.


Final review caught same-object in-place FPS changes: intentional adapter RED reproduced `28` expected versus `null`; the guard now refreshes on either object replacement or changed FPS. The indicator uses a named note role for accessible labeling. Fresh final checks through the test agent passed: `npm test` 135/135 across 11 files, `npm run typecheck` exit 0, `npm run build` exit 0 (30 modules), `npm run test:browser` 27/27. Concurrent unrelated tests appeared during the run; no session-owned changes were made to them.

Initial live built-app run observed both indicators moving from unavailable to numeric values, including 44/31, 59/46 and 58/29 FPS. Pause cleared both; iframe references remained connected. At resume, one stream was visibly in an ad break and the other did not yet resume within the short observation window; neither is recorded as a successful resume. This demonstrates why low readings alone must not drive unqualified app quality changes. Desktop screenshot confirms compact header containment; mobile keeps the pre-existing overlay sidebar/minimum player scrolling.

README gate: `update_in_same_change` for the new diagnostic behavior; existing hook/stack/setup hierarchy preserved. Updated README, architecture, validation, grouped smoke checks and one local engineering lesson. No additional settings, libraries or configuration changes. Canonical tooling postmortem registered as no-new-learning at SHA-256 `de3b252beed52a388defacb1d5121338b5e7d4c24cc12177e4c982ef7ef65c8e`; targeted check exited 0 with no errors/changed/unregistered aliases. This outside-workspace ledger update was explicitly permitted by normal tool approval and preserves prior records.


Final runtime: Stream A reported 18→54→60 FPS and its actual video advanced 17.562321→19.570695 seconds / 1001→1121 total frames over two seconds in a browser-only diagnostic. Stream B remained paused at time 0 and correctly showed unavailable. Pause cleared both; after resume plus 16 seconds, Stream A returned to 60 FPS; both iframe references remained connected. Do not claim both videos moved simultaneously or human audio passed. All narrow diagnostics acceptance criteria are satisfied; source/decoded/presented portability, reliable provider freshness and ad detection remain API limits. The user-desktop lag cause remains undiagnosed. No commit/push performed.

Review outcome: focused independent source review found no FPS-driven quality writes or other actionable lifecycle issues after the in-place-cache correction. `git diff --check` exited 0. Final rollback remains session-owned FPS hunks only; concurrent QualityNotice and prior playback/layout work are protected. No storage changes or additional dependencies. Final evidence reviewer checked the narrowed scope; its remaining documentation placeholders were filled with the measured outcomes above.

Evidence attribution: full-suite/build/browser counts above are the dedicated test agent's fresh observed results. The independent evidence reviewer separately reran 12/12 targeted adapter/manager tests and typecheck successfully, inspected official API/SDK code and the screenshot, and found no blocking implementation/accessibility issue.


## Follow-up: reported FPS versus visible stutter

New live request: the user reports roughly 15 FPS smoothness with 42–44 FPS indicators on four streams. Existing task remains diagnostics-only with Twitch Auto; this report does not reauthorize automatic quality changes. Initial follow-up `git status --short` captured the prior dirty/untracked state, including this task and concurrent quality-notice work; preserve it.

- [x] Reproduce the misleading plain-FPS label with a focused browser RED assertion, then explicitly label the provider counter.
- [x] Update the tooltip/README/smoke procedure to distinguish counter throughput from visible frame pacing.
- [x] Verify the focused browser test, typecheck and build; record the live limitation.
- [x] Determine whether one stream is smooth when three are paused: user confirmed it is. The load-versus-individual bottleneck investigation remains unresolved.

Living report: `docs/postmortem/2026-10-22-reported-fps-visible-stutter.md`. Independent runtime-code review finds a four-second decoded/total-frame tracker and separate drop counters, with no justified exact presented-FPS conversion. No app access to cross-origin video counters is introduced.


## Superseded by playback bitrate

The user confirmed a single stream is smooth and rejected 63–64 provider FPS as unrelated to visible smoothness. The latest request is aggregate stream download speed. Continue under `plans/stream-bitrate-diagnostics.md`: remove numeric FPS, keep displayed FPS explicitly unavailable, and show honest provider playback bitrate per tile and in a partial-aware combined sidebar total. The previous prefix-only correction passed focused browser/typecheck/build but is superseded, not a lag resolution. CPU/GPU/network cause remains unverified; no app quality cap is authorized.


## Scoped delivery reconciliation

This investigation's temporary numeric-FPS retirement is superseded by the separate user-approved estimate restoration in `c7e00dc` and channel-format update in `898197d`. The bandwidth delivery preserves those prerequisites, adds decimal MB/s with `↓` per stream and beside chat, and leaves Twitch Auto in control. The follow-up label/single-stream observations were completed and superseded by the bitrate plan; diagnosing the original stutter remains open. Final session verification and the commit milestone are maintained in `plans/stream-bitrate-diagnostics.md`.
