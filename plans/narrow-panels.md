# Narrow workspace panels

Give videos more horizontal room by narrowing the existing sidebar and chat, then verify two columns with four streams and chat open.

- [x] Inspect panel sizing, auto layout and existing tests; preserve pre-existing dirty work.
- [x] Observe the defining browser test fail before implementation (expected sidebar 200px, received 260px).
- [x] Use a 200px desktop sidebar, 240px default chat and a responsive chat cap that reserves room for two 400px players. Keep saved resize preferences and mobile overlays.
- [x] Verify desktop/mobile geometry, retained frames, build and regression suite; update usage and smoke checks.

Scope: CSS, default chat width, one browser regression and matching documentation. No new dependency, storage migration, playback change, commit or deployment. Small inline implementation sequence: defining test → panel sizing → runtime checks/docs. Rollback only this task's hunks.

Manual checks: four streams + chat at 1280/1366/1440/1920; two columns, no horizontal player scrolling, readable controls. Resize chat wider and shrink window; verify automatic cap and retained embeds. Mobile keeps overlays.

Cursor prompt: Read this plan and docs/smoke-tests.md. Preserve unrelated dirty work. Verify narrow panels at desktop widths and mobile, including wider saved chat preferences and iframe identity. Keep Twitch player minimums.

Suggested commit: `fix: narrow workspace panels to fit two video columns`.

## Verification and review

- Intentional RED: escalated `npx playwright test tests/narrow-panels.spec.ts --reporter=line` failed at expected 200px sidebar versus existing 260px.
- GREEN: `npm test` passed 131 tests in 9 files; `npm run build` passed TypeScript and Vite; escalated `npx playwright test --reporter=line` passed all 24 tests. These are the exact automated reproduction steps, in that order, after the change.
- Browser regression exercises four streams at 1280/1366/1440/1920, new 240px chat, saved width 640 capped at 1280, no horizontal player scrolling, mobile controls and retained iframe elements.
- Visually inspected generated 1280px and 390px screenshots under test-results/narrow-panels-compact-pane-822a2-ideo-columns-with-chat-open-chromium/. Desktop has two columns, readable full playback labels and channel names/actions; mobile retains the existing overlays. Browser zoom may reduce available CSS pixels and cause columns to stack.
- `npm run inspect` passed: two entry assets resolve, four static files. `git diff --check` passed.
- README everyday use and docs/smoke-tests.md document panel sizing, responsive cap and manual checks. Public-share test now expects the new default; explicit saved-width fixture remains unchanged. No storage migration or player-layout algorithm change.
- Self-review: two-player reserve is 832px including gap, viewport padding and thin scrollbar; 240px chat minimum wins on narrower windows. Explicit one-column/focus selections remain user choices. No dependencies added.
- No real Twitch playback/audio/login retest. Preferred AXI browser bridge failed before connecting; Playwright fixtures establish layout/iframe retention only. Context incident and blocked canonical ledger update are recorded in docs/postmortem/2026-10-22-narrow-panels-tool-context.md. No configuration changes, commit, push or deployment.

Direct runtime commands from repository root, without sudo: `npm run dev` (open printed local URL), `npm run preview` (open production preview URL), `npm run inspect` (verify built artifact references). Follow the manual checks above on either served app. Existing scripts are reused.

## Session delivery milestone

Commit-session now authorizes committing and pushing this change. The scope helper returned unsafe because it detected no writes/baseline through the tool orchestration layer. Direct successful edits and the initial Git status in this conversation establish ownership for eight files: src/style.css (only this session's rules), src/domain.ts, src/domain.test.ts, tests/narrow-panels.spec.ts, README.md (only panel-size usage), docs/smoke-tests.md (only panel check), this plan and the narrow-panels context incident. Later sidebar-density changes and unrelated playback/chat/docs work are excluded.

Prepared an isolated HEAD-based candidate under /tmp/twitch-grid-narrow-ship with these exact changes, preserving current working files. README recruiter review passes: substantive viewer/iframe-lifetime hook, repo-grounded stack rationale before setup, Node/npm install, dev/preview options, everyday use, test options and real-Twitch limitations are present. No README repair beyond this session's sizing paragraph is needed. Candidate verification and exact staged privacy gate precede commit; no history rewriting is authorized.

Milestone subject: `fix: narrow workspace panels to fit two video columns`. Completed implementation: 200px desktop sidebar, 240px new chat, responsive chat cap, readable channel rows, regression and usage/smoke documentation. Isolated candidate verification passed: `npm test` 130 tests across 9 files, `npm run build` TypeScript/Vite, and escalated `npx playwright test tests/narrow-panels.spec.ts --reporter=line` 1/1. The lower unit count excludes the unrelated playback fix. Remaining delivery steps: exact staged privacy gate, commit and upstream push. Real Twitch checks and external incident-ledger registration remain outside verified scope. No Vercel project link or deployment configuration is present in this checkout. This milestone is included with its implementation; the resulting commit hash and actual push result are reported in the delivery response.
