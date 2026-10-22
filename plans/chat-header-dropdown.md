# Chat header dropdown

Replace the redundant channel disclosure and separate selector row with one native dropdown in the chat header. Preserve help, collapse, resizing, saved settings and player lifetime.

- [x] Capture initial dirty status; inspect component, CSS, callers and documentation. Existing changes are user work and must stay intact.
- [x] Write defining component tests for persistent header selection and the empty state.
- [x] Observe expected RED, replace the control, update browser tests and docs.
- [x] Run component/full tests, build and browser checks; inspect desktop and mobile.

Scope: ChatPanel, its selector CSS, component/browser tests, README and smoke checks. No dependencies or schema changes. Reuse the native select and project colors. Roll back only this task's hunks.

Manual check: open two chats, switch via the header dropdown with mouse and keyboard, toggle help and collapse, verify no extra selector row and no video reload.

Cursor prompt: Read this plan, preserve other dirty work, verify the header dropdown switches chat and remains available after load at phone and desktop widths.

Suggested commit: `fix: select chat directly from header`.

Verification so far: expected RED (2 failures for missing header select); GREEN npm test (131 tests / 9 files), npm run build (TypeScript + Vite), npm run inspect (2 assets resolved), git diff --check. Browser suite uses an isolated alternate port because 4173 is occupied; preserve its listener.

Documentation updated: README everyday chat instructions and existing docs/smoke-tests.md checks now describe one persistent header dropdown. No commit, push, deployment or managed configuration change requested. Canonical postmortem learning write remains outside writable roots at ~/linux-config/dot_agents/skills/postmortem-memory/; outstanding registration/check documented in the tooling report.

Final evidence: 22 browser tests passed (23.2s) on isolated port 4277 with /tmp/chat-dropdown.playwright.config.mjs. Reviewed compact-390.png and compact-1440.png from /tmp/chat-dropdown-browser-results: one header dropdown, help/collapse visible, no second selector row. Existing iframe identity checks pass. Final git diff --check passes. Real Twitch login/messaging were not checked. All requested UI work complete; canonical incident registration remains outside task workspace.

## Session commit milestone

Commit subject: `fix: select chat directly from header`. Scope helper could not detect orchestrated writes for session 01a1650b-6c85-7ee3-b0f8-43587f44e7c4; use directly observed edit evidence. Stage only header/dropdown CSS, focused component assertions, README selection wording, smoke check and this plan/tooling report. Leave earlier help disclosure, maximize controls, playback fixes, unrelated tests and docs uncommitted. The committed component retains HEAD help behavior; help disclosure remains in the working tree. Verify the isolated staged candidate independently before committing.

README gate: reviewed opening hook, stack rationale, setup/flags and everyday use against package.json and scripts/inspect-build.mjs; pass with scoped dropdown wording. The repo-local scope helper and privacy scanner are absent; use the installed scope helper and canonical shared privacy scanner with --repo and the same isolated index. No Vercel project configuration (.vercel or vercel.json) is present.

Privacy review: shared scanner flagged an absolute home path in this plan. Replaced it with a portable home-relative reference before restaging; no application secrets or credentials were included.

Candidate verification: exported the exact staged application to a temporary directory; npm test passed 130 tests / 9 files, npm run build passed TypeScript + Vite, and all 18 candidate browser tests passed on isolated port 4278 (26.7s). README gate passed with scoped wording. Completed: dropdown, regression assertions, docs and plan. Remaining: preserve unrelated dirty work; canonical postmortem learning registration remains outside scope. Next: commit `fix: select chat directly from header` and push main to origin/main. No configured Vercel project was found.
