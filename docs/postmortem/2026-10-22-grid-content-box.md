# Four-stream grid falls back to one column

Track the reported one-column workspace and verify that four streams use two rows of two when chat leaves sufficient room.

Status: verified fix in controlled production-browser fixture; root-cause confidence confirmed. Root cause is duplicate padding subtraction in PlayerSurface's ResizeObserver. User screenshot shows four streams, Auto grid and docked chat with one full-width stream per row.

Evidence: CSS reserves 832px for video including padding and scrollbar allowance. ResizeObserver contentRect already excludes padding, but PlayerSurface subtracts 16px again. At the chat cap this reports 800px instead of 816px; layout requires 808px for two minimum-width tiles. Existing wide-chat regression asserted only no horizontal overflow, which also passes with one column.

Impact: wasted video space and vertical scrolling. No channel data or player-lifetime change is needed.

Lookup: canonical postmortem-memory search `grid responsive columns viewport` returned no applicable responsive-grid finding. Existing plan `plans/narrow-panels.md` explains the intended two-column reserve. Proceed with a browser reproducer rather than importing unrelated remedies.

Defining RED: after successful Vite transpilation, focused Playwright on isolated port 4283 exited 1 at tests/narrow-panels.spec.ts:38. Actual 2×2 geometry stayed false at 1280×900 with chat preference 640; the prior compact-chat cases passed. This establishes the reported fallback rather than an infrastructure failure.

Resolution: use contentRect width and height directly with the existing positive-size guard. No layout algorithm, minimum size, storage or iframe-host change.

Verification: TypeScript and production build pass. The same focused browser regression that reached RED now passes (1/1, 7.1s) with a wide saved chat preference at 1280×900, 1440×730 and the screenshot's 2048×973 dimensions: four streams form two rows of two, with no canvas scrolling. Mobile control visibility and connected original video/chat iframes pass. Desktop 2048/1280 and mobile390 screenshots were visually inspected. Artifact inspection resolves two entry assets across four files. Full unit suite reports 136/142 passing, with six concurrently introduced quality-selection tests RED; this task does not change quality logic. Full browser suite remains unrun by this task.

Follow-up/limits: preserve 400×300 Twitch video minimums; short or zoomed CSS viewports may still scroll. No real Twitch playback, audio, login or hardware-device verification is claimed. Keep the new wide-chat geometry assertion; absence of horizontal scrolling alone cannot detect a one-column fallback. The initial implementation did not request delivery; the later commit-session request is tracked in plans/two-by-two-grid.md.

Workflow note: optional read `~/.agents/skills/impeccable/SKILL.md` failed because that alias is absent; the available catalog identifies `~/.codex/skills/impeccable/SKILL.md`, which was read successfully. This repeats the existing narrow-panels tooling incident and causes no product failure.

Initial verification blockers: `npm run build` exited 2 because concurrent chat tests refer to `showChrome` before its production type is updated (ChatPanel.test.ts:65 and domain.test.ts:91–99). The separate chat owner confirmed this is their active TDD work. Browser startup then exited 1 before tests ran. Neither outcome establishes the intended layout RED. Existing narrow-panels tooling report records restricted localhost startup; retry only in an isolated preview port with execution escalation. Do not modify concurrent chat tests or weaken typechecking.

Temporary harness correction: the isolated `/tmp` Playwright configuration initially imported named `defineConfig` from the package's CommonJS `index.js`, causing an ESM import error before tests. Use its installed ESM entry instead; this affects only the temporary harness. `npx vite build` passed, providing a runtime bundle while the independent TypeScript work completes; this is not a typecheck success.

Broader verification in shared checkout: fresh `npm test` exited 1 with 136/142 passing. Six failures in manager.test.ts expect new resolution-default selections (`160p30` through `1080p30`, plus manager `360p30`) while production still chooses `auto`. These tests changed during this task in another session; do not adjust them or the quality logic for a layout fix. Continue focused geometry verification and report the broader suite accurately unless the owner completes the implementation.

Approval-review resolution: automatic review rejected the delegated full browser run because it interpreted the live user request as image resizing and the app test as unrelated. Parent read the local harness/test, demonstrated the explicit loopback-only four-stream fixture scope and obtained approval for the focused geometry regression. That direct run passed; no workaround or indirect execution was used.

Commit-session privacy check: the exact isolated index was blocked with two `home_path` findings in this report and its plan. No commit was attempted after the blocking gate and the normal index stayed unchanged. Replace absolute home-directory references with portable paths, refresh the reviewed incident hash, and rerun the unchanged gate before committing. This is documentation privacy repair; the verified app/test candidate remains unchanged.

Privacy lookup: canonical memory query `privacy home_path documentation` returned `local-privacy-reviewed-content-approvals`. Its guidance requires preserving the gate and exact reviewed content; no approval exception is needed here. Portable references remove the machine-specific paths while preserving the diagnostic steps. No new reusable privacy finding is needed beyond that existing gate guidance.
