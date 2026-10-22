# Reclaim video space

Remove the top header, duplicate toolbar and bottom status strip so streams use the full workspace height. Keep controls reachable through the existing sidebar.

## Scope and decisions

- Remove workspace branding/title and normal status footer; preserve storage warnings and notices.
- Move Share and Backup & import into sidebar Settings. Put layout, chat, maximize and fullscreen there too; reuse current handlers.
- Keep an accessible sidebar toggle and Ctrl+B, including when the sidebar is closed. Preserve maximize/restore and all iframe identities.
- Preserve all pre-existing dirty files and stored-data schema. No commit or deployment requested.

## Steps

- [x] Inspect App, Sidebar, CSS, callers and browser coverage.
- [x] Add defining browser regression and observe RED.
- [x] Move controls, remove bars, update affected browser tests and usage/smoke docs.
- [x] Run build, unit/browser checks and inspect desktop/mobile screenshots.

## Verification and rollback

Check viewport top=0 and full height at 390/768/1280/1440, Settings transfer dialogs, layout, toggle, maximize/restore and retained frames. Roll back only this task's hunks. Existing dirty work is unrelated and must remain.

## Workflow note

Initial optional file reads used a missing installed skill alias and absent .agent/PLANS.md; corrected to catalog path/existing plan pattern. The canonical postmortem helper does not support --compact in this installed version; use its actual search interface. No product failure occurred. 21st CLI is unavailable; reuse existing project controls and tokens.

## Handoff

Automated plan: `npm test`, `npm run build`, then `npm run test:browser`. The defining regression checks zero bars, workspace y=0 and height=900, both Settings dialogs, sidebar toggling and frame retention at 390/768/1280/1440. Existing tests cover layout changes, playback actions, maximize/restore, imports and storage protection.

Manual plan: run the app; add two streams; dismiss the add notice; confirm no top bars or status footer. Scroll sidebar Settings, open/close Share and Backup & import, change Layout and Chat, maximize/restore with both button and Escape. Close/reopen sidebar using the menu and Ctrl+B. Confirm existing video/chat remain loaded. At phone widths, scroll to Settings and repeat. Storage alerts must remain actionable when storage is unavailable.

Cursor prompt: Read plans/reclaim-video-space.md and docs/smoke-tests.md. Preserve all pre-existing dirty work and concurrent chat-header changes. Verify the full-height workspace, sidebar Settings controls, storage recovery warnings and iframe identity at all four supported widths. Keep the existing dark green tokens and stored-data schema; add no dependencies.

Docs updated: README everyday use and docs/smoke-tests.md. Suggested commit: `feat: reclaim workspace height with sidebar settings`. No commit, push, deployment or config sync requested or performed.


## Results and review

- RED: pre-implementation browser regression found all three bars (expected zero). Build passed before the defining test.
- GREEN: 131 unit tests across nine files; TypeScript and Vite build passed. Full browser suite passed all 22 tests after replacing the stale “Memory only” footer assertion with the persistent storage warning and backup action.
- Actual geometry: workspace top=0 and height=900 at widths 390, 768, 1280 and 1440. Transfer dialogs open from Settings; sidebar toggles preserve existing iframes. Existing maximize, keyboard, layout, playback, import and storage checks pass.
- Visually reviewed captured 390px and 1440px workspace screenshots under `/tmp/twitch-grid-space-check/`: no top or bottom bars, menu button visible, existing aspect-ratio/minimum-size layout preserved. Tall or wide spare space follows existing centered aspect-ratio layout; this task does not alter tile sizing.
- `npm run inspect` passed: two entry assets resolve, four static files. `git diff --check` passed.
- Read-only independent review found stale header-logo/toolbar smoke wording and clarified normal sidebar reopening versus maximize restoration; both documentation fixes applied. Existing project primitives/tokens reused; no dependencies or external UI generation.
- Real Twitch playback/audio/login was not tested. Canonical incident memory registration outside writable roots remains outstanding; targeted check reports this new report as unregistered. See docs/postmortem/2026-10-22-workspace-check-environment.md. This does not affect app behavior.
- Preserved concurrent chat dropdown and existing dirty work. No commit, push or deployment performed.


## Session commit preparation

Commit-session requested after implementation. Session `01a16509-2725-7032-9ecf-7fdc7fb23418` scope helper returned unsafe because it could not detect Code Mode writes/baseline. Direct-write evidence and the initial status in this conversation establish scope instead. Prepared an isolated candidate under `/tmp/twitch-grid-session-candidate` from HEAD; excluded playback-manager/native-resume, chat disclosures/dropdown, player-footer removal, unrelated plans and machine-local `.aws`.

The complete UI candidate needs two baseline-dirty prerequisites: sidebar Stream Controls and Maximize video. Asked for explicit permission to include only these prerequisites; no response is approval. Matching test/docs are included only with that authorization. Until resolved, no commit or push is claimed.

README recruiter gate: opening explains audience, benefit and iframe-lifetime constraint; repo-backed stack rationale precedes setup; Node install, dev/preview ports/options, local-data workflows and existing test/build commands are documented. Candidate retains HEAD's unrelated playback/chat descriptions and stages only this task's usage changes plus prerequisite controls. Candidate validation totals will be refreshed from isolated checks.


## Commit milestone: feat: reclaim workspace height with sidebar settings

User explicitly approved inclusion of the required baseline sidebar Stream Controls and Maximize video prerequisites. Direct-write fallback scopes this commit; the helper could not detect tool-orchestrated writes. The isolated candidate excludes unrelated native-resume, chat and player-footer edits.

Candidate verification: 130 unit tests across nine files passed; TypeScript/Vite build passed; all 20 intended browser tests passed, including the owned full-height/maximize regression at four widths. An untracked chat test accidentally present in the temporary validation directory was excluded from the intended candidate and the complete intended suite reran successfully. README recruiter review passed with truthful candidate-specific counts and existing setup/options.

The first isolated privacy check blocked a home-directory path in workflow notes; public copies were sanitized before restaging. Preserve unrelated work and all normal staging entries. Next step: commit the exact privacy-checked candidate, push main to origin/main, and report the resulting hash. No Vercel project configuration exists in this checkout, so no deployment target is inferred.

Final containment: a generic temporary candidate directory contained foreign test adaptations, so final validation and staging use `/tmp/twitch-grid-01a16509-candidate` and an index named for this thread. Restored the original sidebar regression and excluded player-footer and chat-help edits. Shared files remain untouched by this containment step.

Final milestone verification: inherited the concurrently committed compact-chat/maximize change `b97ee0c` without reverting its source, docs or tests. Refreshed candidate passes 130 unit tests, TypeScript/Vite build and all 21 browser tests. Browser checks used a temporary port 4174 configuration because 4173 was occupied; no listeners were stopped. README and exact-candidate privacy checks pass. Implementation, tests and docs are complete; next step is the authorized commit and origin/main push.

Commit safety guard detected the independently completed player-footer commit `dfbd90e`; refreshed the scoped candidate onto it, preserving its native controls, layout and tests. No history was rewritten. Final integration checks rerun before commit.

Final verified milestone on dfbd90e: 130 unit tests across nine files, TypeScript/Vite build, all 22 browser tests on temporary port 4174, and built-asset inspection pass. README counts reflect this exact candidate; privacy gate passes after sanitizing workflow paths. All authorized implementation/documentation work is complete. Unrelated dirty work remains excluded; remote push is the next delivery step.
