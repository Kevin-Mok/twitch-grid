# Compact sidebar

Reduce text and vertical spacing in the existing sidebar so more streams and controls fit. Preserve the current colors, font, playback behavior, panel widths and all pre-existing work.

- [x] Inspect sidebar styles, component and existing narrow-panel checks.
- [x] Define compact geometry in a browser regression; observe RED (38px playback button exceeds 32px).
- [x] Reduce sidebar padding, section gaps, text and button heights. Put channel actions beside names, retaining small status text beneath names.
- [x] Build, run regression tests and inspect desktop/mobile screenshots.

Scope: src/style.css, tests/sidebar-density.spec.ts and existing smoke-test wording. No new dependency or configuration change. Rollback only this task's style hunks and new regression. Long names may truncate; the existing title retains the full login. Smaller click targets are a deliberate density tradeoff.

Manual verification: open four streams at desktop and phone widths; confirm single-line playback labels, compact stream rows, no overlapping actions and reachable settings. Filter, reorder and reload a stream to confirm behavior remains available.

Cursor prompt: Read plans/sidebar-density.md and docs/smoke-tests.md. Preserve unrelated dirty files. Verify compact sidebar controls and channel rows on desktop and phone, including long names and keyboard access; change only sidebar styles if needed.

Suggested commit: `style: tighten sidebar typography and spacing`.

Tool limitation: Impeccable context engine cache is outside writable roots; use existing CSS/component context. Preferred Chrome AXI bridge did not start; use isolated Playwright screenshots. See docs/postmortem/2026-10-22-sidebar-density-tooling.md.

Verification: defining RED measured 38px against a 32px target. `npm run build` passed; `npm test` passed 131 tests in 9 files; `npx playwright test tests/sidebar-density.spec.ts tests/narrow-panels.spec.ts --reporter=line` passed both tests. Desktop (1280px) and phone (390px) screenshot inspection confirmed compact channel rows and readable playback labels. Final refinement keeps Settings actions on one line, keeps the quality selector readable and removes extra add-button padding. `npm run inspect` resolved both entry assets; `git diff --check` passed. Docs/smoke-tests.md now describes side-by-side channel actions and compact row/button limits. The final Backup & import action spans both Settings columns to preserve its full label. No configuration or Twitch playback change. Session-only delivery is recorded below.

Canonical postmortem check reports this task's tooling report as new/unregistered; registration remains blocked by the workspace boundary at linux-config/dot_agents/skills/postmortem-memory/.

## Session delivery milestone

Commit subject: `style: tighten sidebar typography and spacing`. Scope uses direct-write evidence because the session helper could not detect writes for session 01a1651d-cdd9-7b12-ab6a-5a8d6b5b752b. Include only sidebar CSS hunks, the compact-row smoke expectation, density regression, this plan, tooling report and one README density sentence. Preserve all unrelated dirty work, including FPS styling and playback edits. README contract review: pass after adding the factual density sentence; setup, command options, stack rationale and opening hook remain accurate for the committed candidate. No deployment configuration or linked Vercel project exists. Next: commit and push origin/main after candidate verification and privacy scan.

Isolated commit-candidate verification: exported HEAD plus only the six session paths into a temporary directory. `npm run build` passed; `npm test` passed 130 tests in 9 files; `npx playwright test tests/sidebar-density.spec.ts tests/narrow-panels.spec.ts --reporter=line` passed 2/2. This excludes unrelated playback and FPS work. Product work complete; no blockers to the scoped commit/push, with external ledger registration still outstanding.
