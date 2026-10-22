# Quality indicator verification environment

Verify the new quality label by running the browser fixture against the production build.

- Symptom: Playwright preview web server exits code 1 inside the sandbox before any assertion.
- Impact: Browser RED/GREEN verification initially blocked; production build passes.
- Evidence: Two sandbox runs return `Process from config.webServer was not able to start. Exit code: 1`.
- Lookup: Searched postmortem memory for Playwright preview server/sandbox symptoms; documented `--compact` option is unsupported by the tracked helper; retried search without it. Local tasks/lessons.md already documents requesting loopback/browser execution permissions.
- Status: Normal loopback/browser execution permissions allowed preview startup. Defining RED observed: quality indicator element absent. Sandbox environment restriction confirmed; no product server change needed.
- Next: Complete the session-scoped commit and verify the deployment; the original environment issue is resolved.
- Learning: Existing environment lesson applies; no new product learning. Tracked external learning ledger is outside the writable workspace.

- Additional environment evidence: Impeccable context launcher could not create its external engine cache; used the existing component/CSS as visual authority. No engine install attempted.
- Lookup applicability: Search returned broad unrelated matches; existing local loopback/browser execution lesson was the applicable evidence.
- Learning check: Targeted `check --postmortem` identifies this report as new. Registration remains outstanding in the canonical linux-config postmortem-memory skill directory (outside writable workspace); installed copies were not edited.

## Final verification

- Production build/typecheck passed after implementation.
- Browser fixture passed 2/2 tests, including changing quality, unavailable values, accessible label, adjacency before FPS, and existing 390/768/1280/1440 width checks.
- Unit suite: 150 passed, 1 failed in `src/player/manager.test.ts:43`, expecting two startup `play:alpha` calls but receiving one. The quality display change does not touch player manager behavior; that file and its tests were already dirty at session start. The failure remains unresolved and is not claimed to predate this session's test run.
- Scoped diff whitespace check passed. Live Twitch playback and screenshots were not checked. Commit-session delivery status is recorded in ../task-status.md.
- Resolution: Local preview/browser checks work with loopback/browser execution permissions; no server change required. Product quality display is verified by controlled browser tests. Unit-suite failure remains a separate limitation.

- Formatting follow-up: `480p30` now displays as `480p 30 FPS` when measured playback FPS is unavailable. A measured value takes precedence; advertised FPS is identified in the tooltip and accessible name. Browser regression passed 2/2 and build/typecheck passed.

- Commit privacy check found a home-directory path in this incident report. Replaced it with a repository-relative description before restaging; no credentials or private data are included.
