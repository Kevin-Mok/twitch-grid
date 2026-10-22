# Default quality remains at source

Investigate the reported mismatch between sidebar Default quality 360p and Twitch's native menu showing 1080p60 Source. Reproduce at the quality-selection boundary, fix the confirmed cause and distinguish controlled verification from real playback.

## Symptom and impact

The user's screenshots show Default quality 360p while a player remains at 1080p60 Source. A silent fallback can leave more streams playing at high resolution than intended.

## Evidence and current status

Follow-up implemented and verified after the second screenshot showed Default quality360p while coachboop's native menu remained1080p60Source. The first fix resolved the ID mismatch but missed unacknowledged commands and old overrides. The user confirmed the app URL5173 and explicitly chose applying a changed default to every current stream. The manager now acknowledges later samples, retries pending requests at most three times, and rearms on explicit default/override changes and live recovery. Sidebar changes clear current-lineup overrides. Original desktop storage remains inaccessible; the normal-browser transition must be checked by changing Auto→360p once.

The sidebar stores `360p`; the former `chooseQuality` only matched exact strings and otherwise selected Auto. The official live SDK returned the label `360p` with group `360p30` (and `480p` with `480p30`). The mismatch therefore silently selected Auto. Twitch documents that `setQuality` requires an ID returned by `getQualities`.

Memory queries: `setQuality` had no match; `Twitch` found `ext-browser-sdk-acknowledgements` and `ext-twitch-playback-evidence`. Reviewed browser-integrations guidance: asynchronous handle ordering is already covered, and SDK/fixture state does not establish moving video or audible output.

One discovery command tried the absent local `.agent/PLANS.md` and exited 1 while returning the other requested files. The canonical plan contract was then read from `~/linux-config/.agent/PLANS.md`; no files were changed or lost by the failed read.

## Root cause and resolution

Exact display-label matching discarded available renditions whose IDs include the 30fps suffix. The shared selector now prefers exact available IDs, then the corresponding 30fps ID for a bare resolution, then the existing fallback. Equivalent IDs no longer count as fallback. Explicit 60fps requests, stream overrides, Source and Auto retain their behavior. No migration, force-quality timer, new dependency or configuration change.

## Reproduction and environment evidence

`npm test -- src/player/manager.test.ts` exited 1 as expected: six defining regressions failed, eleven passed. The manager sent `quality:alpha:auto` instead of `quality:alpha:360p30`; the explicit `720p60` override stayed intact. Full RED output: `/tmp/twitch-quality-red-manager.log`.

Build/typecheck passed before implementation. Browser RED initially did not execute: the preview process failed to bind port 4173 with `EPERM`. Vite dev startup on port 5191 succeeded. An approved browser run with local listener permissions subsequently exercised the expected RED assertion: actual Auto, expected 360p30. Do not treat the infrastructure failure as a product assertion.

The preferred Chrome wrapper failed to start its bridge within 30 seconds (`BRIDGE_NOT_READY`). The reviewed `ext-twitch-playback-evidence` already records this limitation. Installed Playwright tooling provided the successful fallback. A later status poll of an already completed live-probe session returned an unknown process ID; its successful completion/output had already been delivered, with no product impact.

## Verification and limitations

- After implementation, `npm test` passed 142 tests across ten files; `npm run build` passed TypeScript and Vite. Full logs: `/tmp/twitch-quality-green-unit.log`, `/tmp/twitch-quality-green-build.log`.
- Approved `npm run test:browser` passed all 29 tests, including the defining regression: 360p/480p/Auto changes, explicit 720p60 override isolation, saved default on reload and retained iframe identity. All result lines and the final summary are saved in `/tmp/twitch-quality-green-browser.log` (transient color warnings omitted).
- Actual official Twitch SDK, isolated browser, mrsavage: requested360p → selected `360p30`, resolution `640x360`; requested480p → `480p30`, `852x480`; requestedAuto → `auto`. Three probe commands exited 0; saved JSON in `/tmp/twitch-quality-live-{360p,480p,auto}.log`. These prove real selected quality and the fixed-resolution reports. Auto's captured resolution was still `0x0` during startup.
- The visible page showed Twitch's content gate and an audio-pending notice. SDK selection/statistics do not prove sustained moving video or audibility. No human audio check or deployment performed.
- `git diff --check` passed. Independent review found no code correctness/regression issues. README, smoke checks, local lesson and plan describe the same matching behavior. Existing unrelated edits remain untouched; no commit/push requested.

## Follow-up and learning

Reusable finding: compare UI quality labels with the provider's exact rendition IDs before treating a preference as unavailable. Record `ext-twitch-resolution-quality-ids` in canonical incident memory with runtime selection scope and the content-gate/audio limits. Startup retry/continuous quality enforcement remains outside this fix. Repeat the native-menu and visible playback smoke check in the user's normal desktop browser.

## Reopened lifecycle investigation

The supplied URL `http://127.0.0.1:5173/` serves the updated ID selector (HTTP 200 for the module with `thirtyFps`). Direct sandbox-local fetches failed; approved loopback reads succeeded. CUA exposes no browser tabs, so the user's actual stored overrides cannot be inspected. Source mapping confirms new/imported channels default to null, backups/profiles can retain overrides, and no current UI clears those overrides.

Independent executable manager investigation reproduced a second bug: an ignored setter is treated as applied forever; subsequent mismatching samples and an OFFLINE→ONLINE recovery do not reapply it. Acknowledged native changes must remain untouched. New regressions observed RED: three failed, seventeen passed (`/tmp/twitch-quality-followup-red-unit.log`): missing retry, expected three finite attempts but observed one, and missing reconnect application.

An initial four-channel real SDK observation on the exact URL had coachboop/npen/venofn at 360p30, but mrsavage remained Auto with all qualities available; it does not isolate the ignored command cause. The first probe's subclass method was shadowed by SDK own-instance methods, so its empty command array is not evidence of no setters. A corrected instance-level probe records actual commands.

The first follow-up browser RED was blocked because port 4173 is occupied. Preserve that listener and use a temporary config with a separate port; do not classify the port collision as a product failure. The planned correction will retry only unacknowledged requests from samples, at most three attempts, and rearm after a genuine offline/online recovery. Native choices after acknowledgement and ordinary render/PLAYING events must not trigger setters.

The new browser regression then observed RED on port 4196: expected360p30, actualchunked after an intentionally ignored first setter (`/tmp/twitch-quality-followup-red-browser-4196.log`). First correction passed that reproducer but full checks exposed three regression assumptions: cached Auto falsely acknowledged a new Auto request (browser stayed480p30), initial already-observed Auto skipped its normal setter (quality-notice fixture), and the bitrate fixture kept reporting Auto after a manual720p60 request, now legitimately pending. Build passed; first follow-up checks were144 unit passes/1 failure and28 browser passes/2 failures. Revise acknowledgement so new targets are always sent and only later samples acknowledge; make the diagnostic fixture acknowledge its manual target before asserting bitrate cannot change it.

The user explicitly chose to apply changed defaults to every stream, including older saved overrides. The defining browser test observed RED (bravo remained720p60 when both should select360p30); the sidebar now clears current-lineup overrides on an explicit default change. Named profiles remain separately saved. After this and acknowledgement correction,145 unit tests,30 browser tests and build passed. A real coachboop probe deliberately dropped its first360p30 setter; a retry selected640x360 and the native settings menu read360p (`/tmp/twitch-quality-native-360p.log`, screenshot).

An additional exact Source-override native-menu probe raced iframe navigation after reload and reported an unavailable frame. This is a probe synchronization error: wait for the named frame's navigation before inspecting its settings, then repeat. The previous native-menu result and full automated checks remain valid. Final review also adds a regression ensuring explicit default changes reapply even when an old override resolved to the same rendition ID.

The synchronized dev-server probe was then interrupted by Fast Refresh during source edits (frame detached). Use the static production preview for the final native-menu checks; it avoids edit-triggered navigation while preserving the user's5173 listener. The same-rendition regression observed RED: expected a new360p30 command after clearing a360p30 override/defaultchange, received none. The manager now rearms on actual global-default or channel-override changes, preserving ordinary-sync deduplication.

The first rearm condition also resent an unchanged explicit override during an internal global sync; the original override-isolation test caught the extra720p60 setter (145 passes/1 failure). Restrict global-change rearming to default-following channels; clearing/changing an override independently rearms that channel. The explicit sidebar change already clears every override, so every current player still receives its request.

Latest full verification:146 unit tests and build passed. Concurrent UI work changed the browser suite to31 tests;29 passed and two failed in bitrate text (`Total 1.00 MB/s` vs `1.00 MB/s`) and header-only video geometry. Quality cases passed. Preserve those other changes and report the failures separately. An optional cross-task coordination message was rejected by automatic approval review because its destination was unverified; no message was sent and no workaround attempted.

Static native-menu probe reached the player but timed out clicking Settings after controls hid. The previous real native360p result remains valid. Update probe interaction to hover the settings control before clicking and capture intermediate evidence; do not infer application failure from browser actionability alone.

## Final follow-up verification

- `npm test`, exit0:146 tests across10 files. `npm run build`, exit0: TypeScript and Vite. Logs `/tmp/twitch-quality-verified-unit.log`, `/tmp/twitch-quality-verified-build.log`.
- Focused quality browser command with `/tmp/twitch-quality-playwright.config.ts`, exit0: both cases pass, including ignored first setter and clearing current overrides with persistence/iframe retention. `/tmp/twitch-quality-focused-final.log`.
- Latest full browser run, exit1:29/31 pass. Remaining failures: `tests/bitrate.spec.ts:22` (Total label text) and `tests/watch.spec.ts:21` (video geometry), during concurrent changes outside the quality fix. Full output `/tmp/twitch-quality-verified-browser.log`; these failures are reported, not hidden or weakened.
- Final static-preview live SDK checks on coachboop all exited0:360p selected360p30 at640x360 even with the first setter deliberately dropped;480p selected480p30 at852x480; changing480p→Auto selectedauto (captured resolution0x0 during transition). `/tmp/twitch-quality-final-live-{360p,480p,auto}.log`.
- Independent assert-based review cleared the same-ID edge for available renditions and shared Auto fallbacks, preserved unchanged explicit overrides during internal profile sync, and preserved native choices after acknowledgement. No remaining code findings.
- The earlier coachboop native menu visibly showed360p after a dropped-first-command recovery. The separate exact savedSource native-menu automation remained blocked by browser control lookup/actionability timeouts, including a DOM-handler attempt; it is not claimed as verified. Final SDK probes and deterministic saved-override UI tests provide separate evidence. No further blind browser retries; sustained smoothness/audio and the user's actual desktop menu remain unverified.
- README, smoke checks, local lesson and active plan describe current all-stream semantics, retry limit, persistence and remaining risks. No schema/configuration changes, commits, pushes or deployments. Canonical memory must retain both the ID mapping finding and the acknowledgement/override follow-up with this report's new hash.

Canonical learning synchronization initially stopped before writing because a concurrent ledger update retained insertion-order JSON rather than sorted keys. Its format-preservation guard rejected the layout; the subsequent coverage check correctly reported the old reviewed hash. Expand format detection to preserve the current ordering, then register this finalized report and rerun the targeted check. No ledger content was lost by the rejected write.

## Commit-session verification

The requested scoped commit is validated independently of unrelated dirty work: HEAD plus nine directly observed quality files/hunks passed140 unit tests, TypeScript/Vite build and both quality browser tests. The scope helper could not recognize the tool writes, so the initial dirty baseline and observed-edit evidence define the candidate. The repo-local README check was absent; one invocation mistakenly used Python for the shared Bash helper and failed before executing it. The correct Bash invocation ran successfully. Its case-sensitive heading findings were repaired and the rerun passed. These workflow corrections add no new application learning; retain the two existing quality findings with this report's refreshed reviewed hash.

The first commit attempt stopped at the required privacy gate with two `home_path` findings, before Git commit ran. The task-owned plan and this report contained machine-specific absolute home paths. Replace those with portable home-relative paths in both the working files and isolated candidate, restage only those documents, and rerun the gate. No hook or scanner is bypassed; validated source remains unchanged.
