# Compact chat and maximize video

Make chat controls dismissible and give the video canvas the full available browser height. Keep the existing dark green design, Twitch embeds and saved data schema.

## Scope and decisions

- ChatPanel final scope: preserve the now-committed compact header dropdown; dismiss login help on iframe load and reopen/minimize it without navigating the frame. Load is not proof of functional login or messaging: Twitch documents no chat readiness event.
- App/style: optional Maximize video hides app header, toolbar, sidebar and footer. Keep chat and tile controls available; a floating restore button and Escape exit. Do not change stored sidebar preferences or player lifetime.
- Tests: component load/disclosure regressions, browser geometry and frame retention. Update README and existing smoke checks.
- Initial git status captured before edits: existing modifications in README, docs/postmortem/2026-10-22-simultaneous-playback.md, docs/smoke-tests.md, docs/validation.md, plans/twitch-multiplayer.md, App, Sidebar, player manager/tests, CSS, tasks/lessons.md and tests/watch.spec.ts; untracked .aws, prior postmortems/plans and playback.spec.ts. Preserve all of these.

## Steps

- [x] Inspect chat, layout, callers, tests, docs and Twitch's official embed documentation.
- [x] Write defining tests and observe expected RED.
- [x] Implement compact chat and maximize video using existing state/CSS patterns.
- [x] Update smoke checks and README; run focused and full checks and browser review.
- [x] Record evidence, limitations and final review.

## Verification

Automated: `npm test`, `npm run build`, `npm run test:browser`. Observe RED for component disclosures before implementation; browser regression must measure increased viewport height and retained chat/video frame identity, restore with Escape, and check widths 390, 768, 1280, 1440.

Manual: open two channels, open chat, load it, reopen/minimize help, switch channel with the header dropdown, maximize video and restore. Inspect controls and video height. Normal login and messaging require a real Twitch session and cannot be inferred from load or fixtures.

## Risks and rollback

Cross-origin chat cannot expose functional readiness; help stays reachable even after load. No automatic login-success claim. Video minimum size and aspect ratio remain unchanged. Restore only this task's hunks to roll back; never overwrite pre-existing modifications. No dependencies or schema migration. The subsequent commit-session request authorizes a focused commit and upstream push; no linked Vercel deployment was found.

## Progress and review

User confirmed the target is our login/chat help area, not Twitch's gift popup. Initial implementation completed two collapsible disclosures and Maximize video without dependencies, saved-data changes or player reconstruction. Reused project React/native controls and existing dark green tokens; 21st CLI/design context was unavailable, so no external component was added.

Evidence (2026-10-22):

- RED: `npm test -- src/components/ChatPanel.test.ts`: exit 1, two expected failures for missing load auto-collapse and disclosure. Initial browser server bind was denied; approved execution then reached expected RED for missing Choose chat channel.
- GREEN: `npm test`: exit 0, 131 tests across nine files. `npm run build`: exit 0 including TypeScript check. `npm run test:browser`: final exit 0, all 21 tests, including open-sidebar restore, frame retention, help/selector sizing, Escape from a select, and >100px extra canvas height at all four widths. Exact combobox test locators resolved the first GREEN run's label ambiguity.
- Artifact: `npm run inspect`: exit 0, two entry assets resolved. `git diff --check`: exit 0. No new lint command exists.
- Visual: reviewed actual Playwright screenshots of compact mobile (390px) and maximized desktop (1440px). Header stays compact, restore is visible, chat uses available height. Screenshots are ignored test-results artifacts. Preferred AXI browser bridge failed to start; Playwright supplied the working visual-review route.
- Independent review: no blocking issues. Added reviewer's missing initially-open-sidebar case, reran the full browser suite successfully.
- Docs: README everyday use and existing smoke checks updated with auto-collapse, reopen, maximize/restore and cross-origin limits. Tests use controlled embeds; real Twitch login, messaging and moving video/audio were not validated in this task.
- Concurrent index.html/public favicon changes appeared after the initial status; preserved as external work. No commit, push or deployment performed. No tracked configuration changed, so refresh-config was not applicable.

Incident report: docs/postmortem/2026-10-22-compact-chat-browser-binding.md records sandbox denial, permitted browser route, test locator correction and AXI bridge limitation. Canonical sources.json received only the new reviewed report entry (SHA-256 f9e8e5af77c68ac9ae5cd2212a3035c43a970fe42c8b4dde7d24db7ca912d7c0), with an explicit no-new-learning decision. Required `check --postmortem docs/postmortem/2026-10-22-compact-chat-browser-binding.md` exited 0: no errors, changed hashes or unregistered aliases. Existing canonical dirty work was preserved.

## Handoff

Cursor prompt: Read this plan and tasks/lessons.md, preserve existing dirty work, preserve the committed header dropdown, verify chat help auto-closes on frame load without claiming chat is functional, and verify Maximize video restores with Escape without reloading frames. Use existing smoke checks for real Twitch login/playback.

Commit subject: `feat: compact chat help and maximize video space`.

## Session-only shipping milestone

Milestone subject: `feat: compact chat help and maximize video space`.

- Commit-session request uses thread 01a16503-50d4-7bf0-aee3-1b2cb092b3dd. The helper returned unsafe because it cannot detect this session's wrapped custom-tool writes. Use the pre-write status and successful patch calls directly recorded in the conversation as fallback ownership evidence.
- Current prerequisite HEAD 1f271db independently committed the compact one-row header dropdown. Preserve it: the earlier selector disclosure implementation is superseded. The shipped chat change is the remaining help state, close-on-load and reopen action. Do not reverse the committed dropdown.
- Isolated candidate: immutable HEAD blobs plus only this session's help/maximize changes. Exclude pre-existing stream controls, native-resume fix, player footer removal, app-bar removal, other plans/reports, and machine-local .aws. Only separable README/smoke/App/CSS/watch-test hunks enter the candidate.
- Fresh isolated validation: npm test exited 0 (130 tests/nine files); npm run build exited 0 including typecheck; npm run test:browser exited 0 (all 19, 12.5 seconds), including >100px extra canvas height at 390/768/1280/1440, open-sidebar restoration, Escape from app selects and retained embeds. Earlier 131/21 figures above came from the mixed development worktree and are historical only. README now states the isolated counts.
- README recruiter-sync outcome: update_in_same_change, then pass_no_change. Preserved the specific viewer/problem hook, stack rationale before setup, documented Node/npm setup and Vite flags, daily controls and honest Twitch limitations. Updated only session help/maximize usage and isolated validation; no external-session playback claim is included.
- Shipping incident: docs/postmortem/2026-10-22-compact-chat-session-scope.md. Unique temporary directory and isolated Git index protect concurrent work; candidate-preparation failures never overwrote shared sources. Privacy gate and exact staged-tree review are required before commit.
- Completed: implementation, tests, docs and README review. Remaining: commit the reviewed candidate and push main to origin/main; no linked .vercel/project.json or tracked vercel.json was present. No history rewrite or deployment is authorized by inference.
- Rollback: a normal follow-up revert can undo this focused commit. Never reset unrelated dirty work or reverse prerequisite commits.

Privacy review: the initial exact-index gate blocked a home-directory path in this plan. Replaced it with a repository-relative report reference; the mandatory gate will rerun on the final staged bytes before the commit. The shipping incident canonical memory check passed with zero errors.
