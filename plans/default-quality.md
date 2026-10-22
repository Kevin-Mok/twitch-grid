# Fix default stream quality

Make the sidebar's 360p preference select the corresponding available Twitch quality instead of silently falling back to Auto. Reproduce the mismatch, fix resolution matching in the shared selector, and verify settings updates and player lifetime.

## Scope and decisions

The sidebar stores `360p`, `480p` and `720p`; Twitch's API requires a returned available ID. Match the equivalent 30fps ID after exact matching. Follow-up user decision: changing Default quality must apply to every current stream and clear old current-session overrides. Profiles retain their separately saved settings until updated. The manager preserves override semantics when loading a profile, but the explicit sidebar change resets overrides. Retry ignored requests from samples at most three times, stop after acknowledgement, and rearm on genuine offline/online recovery. No new settings, dependencies, schema changes or UI redesign.

Files: `src/player/manager.ts`, its existing tests, a focused browser regression, README and smoke checks. All initial dirty files are pre-existing, including manager/source/tests/README/smoke checks. Original copies for session diffs are in `/tmp/twitch-quality-before/`. Preserve those edits; no commit/push requested. `.agent/PLANS.md` is absent locally; use `~/linux-config/.agent/PLANS.md`. Plan Mode is unavailable in this session.

Follow-up also changes only the Default quality handler/help in `src/components/Sidebar.tsx`. Follow-up manager/tests baselines are under `/tmp/twitch-quality-followup-before/`. Other agents' bitrate/chat/layout edits remain protected.

## Atomic checklist

- [x] Reopen on the user's second screenshot; preserve the verified ID fix and investigate existing-lineup behavior.
- [x] Reproduce ignored/reset quality command; user approved clearing current-lineup overrides on a default change.
- [x] Implement bounded quality acknowledgement/recovery and the approved all-stream default behavior; verify observed SDK and native-menu evidence with its limits.
- [x] Refresh defining regressions, focused/full checks and independent code review.
- [x] Refresh canonical incident learning and final handoff for the follow-up.
- [x] Capture dirty state; trace sidebar → manager → Twitch; read lessons and relevant incident learning.
- [x] Observe RED with `360p` requested and `360p30` available through the manager and browser UI.
- [x] Match bare resolution preferences to available 30fps IDs; preserve exact IDs and existing fallback.
- [x] Run focused and full unit/browser checks and build/typecheck; review session diff.
- [x] Update README, smoke checks, local lesson and incident evidence.
- [x] Finish canonical incident learning check.
- [x] Complete final evidence review and prepare handoff.

## Verification

Automated: focused manager tests and browser quality regressions, then `npm test`, `npm run build`, and the full browser suite. Use `/tmp/twitch-quality-playwright.config.ts` with port4196 because4173 is occupied; preserve its listener. Verify alias IDs, bounded acknowledgement retries, native choices after acknowledgement, reconnect, changed defaults resolving to the same rendition, cleared current-lineup overrides, persistence and iframe identity. Internal profile synchronization must still preserve unchanged explicit overrides.

Manual: on the user's app at5173, change Default quality to Auto and then360p once, clearing older current-lineup overrides. Inspect every Twitch native quality menu; repeat480p/Auto and reload. Reproduce a savedSource override oncoachboop in an isolated static-preview context, then change default and inspect the native menu. Actual audio/sustained smoothness are separate checks; unavailable qualities still fall back silently.

## Risks and rollback

Only a bare resolution matches its corresponding 30fps ID; explicit FPS choices must not silently downgrade. Sidebar changes deliberately clear current-lineup overrides, as authorized; do not change named profiles automatically. Do not force quality continuously. Remove only this session's matching/test/doc hunks to roll back. External Twitch playback can limit real validation. Follow-up investigation must distinguish unacknowledged commands from native user quality changes; do not create an endless setter loop that prevents native controls.

## Evidence and review

Memory lookup `setQuality` returned no match; broader `Twitch` found `ext-browser-sdk-acknowledgements` and `ext-twitch-playback-evidence`. Reviewed `references/browser-integrations.md`: startup handle ordering is already tested; fixture success cannot prove real playback. [Official Twitch docs](https://dev.twitch.tv/docs/embed/video-and-clips/) require setting an available ID. The live SDK subsequently confirmed the omitted 30fps suffix.

Ranked hypotheses: (1) bare resolution vs 30fps ID mismatch; (2) saved per-stream override superseding the default; (3) early setter ignored by Twitch. A controlled manager/UI repro will discriminate the first without changing the others.

Cursor prompt: Preserve unrelated changes. Verify Default quality clears old current-lineup overrides and applies360p/480p/Auto to every stream without remounting frames. Check pending quality requests retry at most three times and acknowledge only later samples; native changes after acknowledgement must remain usable. Check explicit default changes whose resolved rendition is unchanged, offline/online recovery and reload persistence. Run npm test, npm run build and the full browser suite using the port4196 temporary config. Inspect coachboop's real native quality menu on a savedSource override and record audio/smoothness separately. Named profiles remain unchanged until explicitly updated.

Suggested commit: `fix: apply quality to every stream reliably`.

### Initial ID-fix verification (previous turn)

- RED: `npm test -- src/player/manager.test.ts`, exit 1: six expected failures, eleven passes. Requested 360p sent Auto when 360p30 was available. `/tmp/twitch-quality-red-manager.log`.
- Browser RED: approved `npm run test:browser -- tests/quality.spec.ts`, exit 1 at the expected `auto` vs `360p30` assertion; saved override was still 720p60. Retained tool output: `/tmp/twitch-quality-red-browser-approved.log`. Initial attempts in `/tmp/twitch-quality-red-browser.log` were blocked by sandbox listener permissions; an approved run exercised the assertion.
- GREEN: `npm test`, exit 0: 142 tests across ten files. `npm run build`, exit 0: TypeScript and Vite build. `/tmp/twitch-quality-green-unit.log`, `/tmp/twitch-quality-green-build.log`.
- Browser suite: approved `npm run test:browser`, exit 0: 29 passed, including quality changes, overrides, reload persistence and connected original iframes. `/tmp/twitch-quality-green-browser.log` retains all result lines and summary; transient color warnings omitted.
- Actual Twitch SDK on mrsavage: default 360p selected `360p30`, resolution `640x360`; 480p selected `480p30`, resolution `852x480`; Auto selected `auto`. All three live probe commands exited 0. `/tmp/twitch-quality-live-{360p,480p,auto}.log`. Auto's captured resolution was still `0x0`; this verifies selection only. A Twitch content gate and audio-pending notice were visible, so sustained visible playback and audible output are not claimed.
- `git diff --check`, exit 0. Session-owned source changes are only the shared selector and fallback alias recognition; previous bitrate/playback changes remain intact.
- README sync outcome: `update_in_same_change`, limited to the default-resolution behavior paragraph. Existing install/use/stack sections retained.
- Review found no code correctness/regression issues; requested finalization of the evidence documents, now updated. Keep those documents with this fix in any future commit. No commit, push, deployment or configuration change performed.
- Canonical incident learning: added `ext-twitch-resolution-quality-ids` in `~/linux-config/dot_agents/skills/postmortem-memory/sources.json` and `references/browser-integrations.md`, preserving existing dirty work. Reviewed report hash: `e3545d275f23e268cc23b66b5e59435d7f6413ac06dfa40561cef7fab93adfb5`. `python3 ~/linux-config/dot_agents/skills/postmortem-memory/scripts/postmortem_memory.py check --postmortem ~/coding/twitch-grid/docs/postmortem/2026-10-22-default-quality.md` exited 0: no errors, changed hashes, missing sources or unregistered aliases. Scope is actual SDK selection/resolution, with the content-gate/audio limits retained.
- Final evidence review: ten claims verified, zero incorrect or unresolved; no actionable code correctness/regression findings. Saved browser RED/GREEN and three actual SDK probe outputs were inspected. Final handoff includes the direct commands below, the Cursor prompt above, automated results, manual checks and suggested commit. Existing unrelated work remains preserved.

### Final follow-up evidence (current turn)

The user's URL5173 serves the current selector. New RED results cover ignored setters, bounded attempts, reconnect, clearing old overrides for all streams, and a same-rendition override/default change. Logs: `/tmp/twitch-quality-followup-red-unit.log`, `/tmp/twitch-quality-followup-red-browser-4196.log`, `/tmp/twitch-quality-all-streams-red.log`, `/tmp/twitch-quality-same-rendition-red.log`.

Final `npm test` passed146/146; `npm run build` passed; focused `tests/quality.spec.ts` passed2/2 on4196. Logs: `/tmp/twitch-quality-verified-{unit,build}.log`, `/tmp/twitch-quality-focused-final.log`. Latest full browser suite passed29/31, with bitrate-text and header-only video-geometry failures during concurrent changes (`/tmp/twitch-quality-verified-browser.log`). Those failures are outside the quality cases; report them explicitly and preserve the other work.

Independent final assertions cleared available/fallback same-ID changes and preserved internal explicit overrides and acknowledged native choices. Actual native coachboop menu showed360p after a deliberately ignored first setter (`/tmp/twitch-quality-native-360p.log`, PNG). Final static-preview SDK probes also passed360p/480p/Auto;360p probe drops its first setter and Auto probe starts at480p. Exact savedSource native-menu automation was limited by browser-control lookup; do not claim that check or actual user desktop state. Audio/sustained smoothness remain unverified. See the final incident report for the complete evidence and tooling limits.

Final canonical review: report hash `68361129052042a496c6ed9771d47f743fc4e231549866c46f0db59be17d69bf`, findings `ext-twitch-resolution-quality-ids` and `ext-twitch-quality-acknowledgement`. Updated only the incident's records/sections in canonical `sources.json` and `references/browser-integrations.md`, preserving other work and current JSON ordering. Targeted `check --postmortem ~/coding/twitch-grid/docs/postmortem/2026-10-22-default-quality.md` exited0 with no errors, changed hashes, missing sources or unregistered aliases. Final source/doc diff check passed. All quality acceptance checks are complete; broader browser failures, inaccessible original desktop state and audio/smoothness limits are explicitly retained. No commit/push requested or performed.

### Direct verification commands

Working directory: any directory; no sudo. Static preview is running at `http://127.0.0.1:4198/`. The reusable probe `/tmp/twitch-quality-live.mjs` uses installed Playwright in an isolated browser and leaves the user's browser/storage alone. coachboop must be live; upstream availability can change. The360p probe drops its first setter; Auto first selects480p. All three commands below were run successfully against the final build. JSON progress goes to stderr. Run each command as one line:

node /tmp/twitch-quality-live.mjs 360p

Example expected output (additional available-quality data omitted):
```json
{"requested":"360p","selected":"360p30","videoResolution":"640x360"}
```

node /tmp/twitch-quality-live.mjs 480p

Example expected output (additional available-quality data omitted):
```json
{"requested":"480p","selected":"480p30","videoResolution":"852x480"}
```

node /tmp/twitch-quality-live.mjs auto

Example expected output (resolution depends on startup/adaptation; additional available-quality data omitted):
```json
{"requested":"auto","selected":"auto","videoResolution":"0x0"}
```

## Commit-session milestone: fix quality for every stream

The user requested `$commit-session`. Scope session `01a16537-5962-7ab0-a6b7-8c7c7c71cb53` against the captured pre-write dirty baseline. The scope helper returned unsafe because it did not recognize tool writes, so use directly observed edits and exclude every unattributed hunk. Nine candidate files contain only this session's quality logic, selector/help, new regressions, README quality text/heading repairs, smoke check, two local lessons, this plan and the incident report. The bitrate fixture acknowledgement edit is inseparable from a pre-existing uncommitted bitrate test and stays outside this commit with that test.

Candidate validation runs against HEAD plus those nine scoped files in `/tmp/twitch-quality-session-candidate`:140 unit tests passed, TypeScript/Vite build passed, and both quality browser tests passed on4199. Logs: `/tmp/twitch-quality-commit-{unit,build,browser}.log`. These fresh results establish that unrelated dirty playback/bitrate/FPS/chat/layout work is not a prerequisite. Earlier working-tree aggregate results remain historical evidence.

README gate: repo-local executable absent; shared Bash helper used. Renamed three headings to match the gate's case-sensitive Tech Stack/Usage/Command Reference patterns; contents remain repo-grounded. Gate returned `pass_no_change` after repair. Privacy gate will inspect the exact candidate index immediately before commit. No active Git hooks are bypassed. No large assets, secrets, `.aws`, caches, generated output or machine-local links are included.

Delivery state before commit: implementation/docs and scoped validation complete; no quality blockers. Next steps are the focused commit `fix: apply quality to every stream reliably` and one push to configured `origin/main`. The commit includes this matching plan/incident milestone. All other-session changes remain dirty; canonical incident-memory changes are outside this repository. No Vercel project link/config exists, so there is no established deployment target.

Commit-stage canonical review refreshed to report SHA256 `1532aa1ff70d64fc2a6bb6b6c1a669b3996ab46a04d218ae0d74034fcc09f7bb`; targeted incident check passed with no errors or stale hashes. Working-tree files remain untouched by partial staging: an isolated index contains the reviewed HEAD-plus-quality candidate, and pre-existing staged/unattributed work is excluded.

The first privacy scan blocked machine-specific home paths in the plan/report before creating a commit. Portable home-relative paths replace them; the isolated candidate is restaged and rescanned. Runtime/code validation is unchanged.
