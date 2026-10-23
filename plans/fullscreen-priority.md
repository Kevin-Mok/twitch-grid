# Single-stream fullscreen and focus

Make the selected stream the only visible tile and temporarily prioritize its quality. Keep background players mounted, preserve sound/playback intent and restore saved quality preferences on exit.

## Decisions and scope

- The supplied screenshot is focus mode. Apply single-stream viewing to focus and native player fullscreen, including native iframe fullscreen events exposed by the parent document.
- Request Source (`chunked`) for the selected stream, falling back to the highest available numeric video rendition then Auto. Background streams use the lowest numeric video rendition (never audio-only); without one use Auto then Source. Skip requests if only Audio only is available.
- Keep this policy temporary: no storage schema changes, dependencies, audio changes, player replacement or FPS-based adaptation. Workspace fullscreen alone keeps normal quality.
- Existing dirty files were captured before edits; preserve all unrelated work. The initial implementation did not request a commit; later commit-session authorization is recorded below. Plan Mode is unavailable in the active mode; maintain this plan inline.
- Relevant scope: PlayerSurface, manager, manager/browser regressions, README, architecture and smoke-test docs. Existing layout API remains compatible.

## Steps

- [x] Observe failing manager and browser regressions for priority and single-tile visibility.
- [x] Implement temporary quality priority and single-tile layout with fullscreen lifecycle handling.
- [x] Verify exit/switch/remove/offline/reload, preserved settings/audio/iframe identity, fallback qualities, unit suite, browser suite and build.
- [x] Update docs and record review/evidence and limitations.

## Evidence and risks

Root cause: focus layout includes every other tile; manager receives no selected-stream signal. Memory lookup `fullscreen focus quality background streams` found `ext-twitch-quality-acknowledgement` and `ext-twitch-resolution-quality-ids`; retain bounded retry/acknowledgement and use actual available rendition IDs. These findings support quality application mechanics, not a pre-existing fullscreen fix. Discovery also established there is no checkout AGENTS.md, .agent/PLANS.md or separate quality.ts (quality lives in manager.ts).

Controlled SDK tests prove routing and lifecycle, not upstream video smoothness, physical audibility or bandwidth savings. Source is a request and depends on Twitch availability. Rollback is limited to this plan's changes, preserving the initial dirty work.

## Handoff

Suggested commit: `fix: prioritize single-stream fullscreen`.
Cursor prompt: Read plans/fullscreen-priority.md, preserve unrelated dirty work, verify focus and native fullscreen show one tile with temporary Source/background-lowest quality, restore saved preferences on exit, and run the documented checks. Do not replace players or change audio.

## Final review and verification

- Defining manager RED: no quality calls on priority entry. Defining browser RED: three visible tiles after Focus bravo, expected one. Review-driven no-Auto RED: Audio only was requested instead of Source.
- Final `npm test`: 152/152 across 10 files; `npm run build`: TypeScript and Vite exit 0. Full Playwright run: 40/40, including both new fullscreen scenarios. All were rerun after the no-Auto fix.
- Browser command: `./node_modules/.bin/playwright test --config=/tmp/twitch-grid-priority.playwright.config.mjs`. The temporary config clones repository settings with absolute project testDir and preview cwd, changing preview/baseURL to 4174. Existing port 4173 listener was preserved. Normal reproduction is `npm run test:browser` with its configured 4173 available; use an isolated alternate-port config when occupied. Loopback permission was needed in this sandbox.
- Desktop 1440×900 and mobile 390×844 screenshots were captured after Source acknowledgement with sidebar closed and opened for visual review: `/tmp/fullscreen-priority-desktop.png` and `/tmp/fullscreen-priority-mobile.png`. Only Bravo is visible; Show all streams remains reachable.
- Independent review: no remaining findings after preventing Audio only fallback. Cases cover Source absence, unsorted numeric renditions, no Auto/no video, focus switch/exit, native tile/iframe fullscreen, offline visibility, explicit reload, removal, unchanged persistence/audio and retained iframe identity.
- Docs: README usage and quality statements, architecture, Action/Expected smoke checks, validation, living incident and local lesson updated. README gate is update_in_same_change: corrected the stale enlarge-only/unchanged-quality wording; retained existing recruiter-first hook/stack/setup ordering and documented port-killing dev script accurately. No config/dev-script changes; refresh-config does not apply.
- Complete: implementation, tests, review and documentation. No product blockers. No commit, push or deployment was performed during the initial implementation phase; delivery authorization and verification follow below. Source request does not prove sustained real Twitch motion, audibility or bandwidth savings; those remain manual checks in docs/smoke-tests.md.

Manual verification: start the production preview; add three live streams, focus each and inspect native quality menus; return through Show all streams/Escape and inspect restored quality. Repeat with header and native iframe fullscreen, a paused/background audible stream, Hide offline, reload/removal and narrow browser. Expected: selected-only view, Source/highest video, lower background video with no automatic Audio only, unchanged audio/intent/persistence and restored saved quality on exit.

Canonical incident learning: registered the reviewed report in `/home/kevin/linux-config/dot_agents/skills/postmortem-memory/sources.json` with an explicit no-new-general-provider-learning decision; preserved existing ledger edits. Reviewed SHA-256 `33f5f85271238fe140b50176ff42277227e86ace4ea3c9e560595a3686c39651`. Targeted `check --postmortem /home/kevin/coding/twitch-grid/docs/postmortem/2026-10-23-fullscreen-priority.md` exited 0 with no errors, changed hashes or unregistered aliases. Final `git diff --check` also passed.

## Delivery milestone: fix: prioritize single-stream fullscreen

User authorized commit-session and upstream push. Session ID: 01a16a8e-fa19-79e3-81c5-b45432ba7e7c. The helper returned unsafe/no detected wrapped writes; scope therefore uses the original pre-write status plus successful direct edits. Existing staged state was empty. Current-session changes are separable from baseline dirty files.

Commit scope: complete PlayerSurface, fullscreen browser regressions, fullscreen plan and incident records (clean/new at baseline); priority-only manager and manager-test hunks; fullscreen-only README, architecture, smoke-test, validation and lesson hunks. Exclude all pre-existing native resume/ONLINE retries, chat/help/crop, startup playback, domain, sidebar, bitrate, style, other plans/incidents/prompts/tests and .aws. The separate canonical linux-config incident-ledger update remains outside this repository's commit.

Candidate prepared from HEAD in /tmp/twitch-grid-fullscreen-candidate and independently verified: npm test 146/146 (10 files), npm run build (tsc and Vite) exit 0, all 34 browser tests passed with candidate cwd/testDir and temporary port 4175. Prior mixed-workspace 152/40 evidence remains historical, not candidate verification. No source changes followed candidate checks.

README recruiter-sync: update_in_same_change; preserved hook/stack before setup, accurate fuser/dev behavior, existing flags/usage and only repaired focus visibility, temporary quality wording and isolated evidence counts. Recheck: pass for the scoped README. Source and docs rollback is a new revert of this commit if requested, without rewriting history or touching older dirty work.

Milestone status before commit: implementation, docs, scoped validation and review complete; no product blocker. Required exact-index privacy scan and active hooks gate the commit. Next: commit the scoped candidate, push main to origin/main, inspect Git-source Vercel deployment for that exact SHA and verify public HTML/assets. Resulting commit hash, push outcome and deployed URL will be reported in Codex output. Real sustained Twitch motion/audio and bandwidth savings remain unverified.

Shipping incident learning: canonical ledger registration and targeted check passed, reviewed SHA-256 a5b0258ee3189fb2387dfe9f0877d581ab4cf6494a24c0de1485b15064f233b3; no new reusable remedy beyond existing scope/cache guidance.

Preserved worktree paths (outside the staged candidate, including mixed-file residual hunks):

- `.aws`
- `README.md`
- `docs/architecture.md`
- `docs/postmortem/2026-10-22-chat-crop-verification.md`
- `docs/postmortem/2026-10-22-chat-hiding-task-handoff.md`
- `docs/postmortem/2026-10-22-fps-prompt-skill-path.md`
- `docs/postmortem/2026-10-22-mrsavage-blurred-playback.md`
- `docs/postmortem/2026-10-22-play-all-paused.md`
- `docs/postmortem/2026-10-22-reload-discovery.md`
- `docs/postmortem/2026-10-22-simultaneous-playback.md`
- `docs/postmortem/2026-10-23-play-all-paused.md`
- `docs/smoke-tests.md`
- `docs/validation.md`
- `plans/chat-percentage-crop.md`
- `plans/mrsavage-playback.md`
- `plans/play-all-on-reload.md`
- `plans/play-all-paused-retest.md`
- `plans/stream-controls.md`
- `plans/stream-playback-stopping.md`
- `plans/twitch-multiplayer.md`
- `prompts/hide-twitch-chat-chrome.md`
- `prompts/stream-fps-auto-quality.md`
- `src/App.tsx`
- `src/components/ChatPanel.test.ts`
- `src/components/ChatPanel.tsx`
- `src/components/Sidebar.tsx`
- `src/domain.test.ts`
- `src/domain.ts`
- `src/player/manager.test.ts`
- `src/player/manager.ts`
- `src/player/twitch.ts`
- `src/style.css`
- `tasks/lessons.md`
- `tests/bitrate.spec.ts`
- `tests/chat-crop.spec.ts`
- `tests/compact-chat.spec.ts`
- `tests/fake-twitch.ts`
- `tests/playback.spec.ts`
- `tests/watch.spec.ts`
