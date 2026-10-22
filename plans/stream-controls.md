# Sidebar stream controls

Add the four actions in the supplied screenshot to the existing sidebar. Reuse the application's command handler, preserve the toolbar shortcuts, and verify the controls through the real application with the controlled Twitch fixture.

## Scope and decisions

- Add a compact dark section above Add Streams with outlined play, pause, mute and reload icons and the screenshot's full labels.
- Use the existing `App.run` commands; do not change player lifecycle, playback recovery, persistence or audio defaults.
- Disable the four sidebar actions when the channel list is empty. Actions cover the whole lineup regardless of the stream filter.
- Keep the current toolbar controls available when the sidebar is closed.
- Initial `git status --short` was clean. No commit, push or deployment requested. Plan Mode is unavailable in the active collaboration mode; this is the living plan.

## Atomic implementation

- [x] Add a browser regression covering empty state, resume only paused players, pause all, mute all and reload all while retaining saved quality and playback intent. Observe the expected RED failure on the missing sidebar section.
- [x] Extend `src/components/Sidebar.tsx` with a typed command callback, wire it in `src/App.tsx`, and style the section in `src/style.css` using existing tokens. No dependencies or new player APIs.
- [x] Update README usage and `docs/smoke-tests.md`. Run unit tests, typecheck, build and the browser suite. Inspect the new controls at desktop and narrow widths.
- [x] Review the final diff and record evidence and limitations here.

## Verification and risks

Browser checks use the existing fake Twitch SDK at the external boundary. They establish app command routing and player lifetime, not upstream moving video or audible sound. The previously reported simultaneous Twitch playback issue remains outside this UI change. Roll back only the sidebar callback/markup/styles and related test/documentation changes.

## Review and evidence

Baseline build passed. Focused regression reached intentional RED: the Stream Controls region and Play all paused streams button did not exist. The initial test-server start was denied by the sandbox (`listen EPERM`); the same command ran with approved loopback permission.

Final automated verification: `npm test` passed 129 tests across 8 files; `npm run typecheck` and `npm run build` exited 0; the focused sidebar browser regression passed 1/1, and `npm run test:browser` passed 20/20. All tests ran against the final shared source. An earlier unit run overlapped another task's intentional native-resume RED test; that task supplied its own player-manager fix before the final green run. Preserve its manager, test, playback plan and documentation edits.

Runtime inspection: isolated Chrome at 1440, 1280, 768 and 390 pixels reported all four labels fitting their buttons and viewport, enabled with two test channels, each button 42px high. Desktop and mobile screenshots were opened and visually inspected (`/tmp/stream-controls-1440.png`, `/tmp/stream-controls-390.png`). The empty lineup snapshot showed all four disabled. Dev startup preserved the existing port 5173 listener and selected `http://127.0.0.1:5174/`.

Independent review found no actionable issues in command routing, keyboard semantics or narrow-sidebar layout. `git diff --check` passed. README gate: `update_in_same_change`, with the new section documented under Everyday use and matching Action/Expected smoke checks. No dependencies, dev scripts or configuration changed. The existing player recovery work is outside this UI change; sustained real Twitch playback/audio was not verified here.

Completed: controls, regression, docs and visual review. No product blockers or further implementation work. No commit, push or deployment performed. Suggested commit: `feat: add sidebar stream controls`.

Required incident learning: the discovery and browser-startup reports were reviewed as no new reusable findings; existing file-mapping and sandbox/reference guidance applies. Their canonical ledger aliases/hashes are maintained under `/home/example/linux-config/dot_agents/skills/postmortem-memory/sources.json`. Both targeted `check --postmortem` commands exited 0 with no errors, changed hashes or unregistered aliases. Reviewed hashes: discovery `013958933c02c8d41a8693a1d61b04b8e052a5506e119b4c387c101e8b7d0afc`; browser startup `170b0070b056e07ab35573b25d8f5b5c82dfec77110e911f6ac09eea24a34110`.

Cursor continuation prompt: Read this plan and `tasks/lessons.md`. Preserve the existing player command semantics and toolbar, verify the four sidebar actions against the controlled Twitch fixture, then run the project's checks. Do not change the unresolved real Twitch playback behavior as part of this UI task.

## Workspace-height follow-up

Explicit approval includes these sidebar controls in the workspace-height commit. The later request removes the duplicate toolbar, so its controls are now reached by reopening the sidebar. This supersedes the earlier preserve-toolbar decision; see plans/reclaim-video-space.md and its 130-unit/21-browser candidate verification.
