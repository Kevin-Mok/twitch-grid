# Viewport verification browser bridge unavailable

This report records a tooling limitation encountered while checking the video grid. Use the repository's installed Playwright browser for deterministic layout verification while keeping live Twitch behavior separate.

## Symptom and impact

The preferred `chrome-devtools-axi eval` invocation exited 1 with `BRIDGE_NOT_READY` after its bridge startup deadline. It returned no page geometry and changed no app files. Live-page verification through this bridge is unavailable for this task.

## Evidence and status

- The CLI reports: `Bridge failed to start within 30s`.
- The read-only help command succeeds. Bridge startup cause is unconfirmed; the environment has restricted network access.
- Optional missing AGENTS/fixture/config-file reads are discovery outcomes, not application failures.
- Next step: use the existing installed Playwright dependency and Chromium for the defining layout regression; do not classify this bridge failure as a Twitch or application defect.
- The normal Playwright preview startup also exited 1 inside the sandbox. The test agent searched `Playwright webServer failed to start loopback bind EACCES`, matched `ext-sandbox-loopback`, then reran with loopback access. Chromium and the server started successfully; the defining regression reached the expected product geometry failure. This verifies a tooling workaround, not a repaired bridge.
- With the fitting change, build/typecheck and 14 focused browser checks pass. The full unit run reports 145 passing and one failure in unrelated pre-existing quality-manager work: `reapplies a changed default even when a cleared override resolved to the same rendition` at manager.test.ts:227, expected `['quality:alpha:360p30']`, received `[]`. This task only changes UI geometry and preserves the existing manager edits; no quality fix or retry is claimed.
- Broader browser checks exposed a stale 300px displayed-height assertion in the header-only tile test. The new requested fitting behavior scales that visible height; the internal embed still keeps its minimum. Updated only the minimum check to the internal height and retained both displayed edge-alignment checks. The independent viewport regression continues to require actual visible fit.
- The completed broad browser run passed 29 tests and failed that stale header-only assertion plus an unrelated pre-existing bitrate expectation: tests/bitrate.spec.ts:22 expects `1.00 MB/s` while the current app renders `Total 1.00 MB/s`. Source review confirms the `Total` label and bitrate test both predate this session. No bitrate files are changed by this task. Follow-up verification of the corrected header-only check is separate from that unresolved expectation.
- The first broad-run orchestration did not retain its final output; an occupied preview listener was preserved and a temporary configuration used a different port. The captured completed-run log is `/tmp/twitch-grid-viewport-fit/browser-full.log`. This is verification infrastructure handling, not a product change.
- A temporary screenshot harness captured the three-stream case, then timed out because it closed the sidebar before trying to select its Layout control. The selector is only available while the sidebar is open. Corrected only the temporary harness ordering; the fresh capture passes 1/1 (exit 0) and produces both three-stream and eight-stream screenshots. Both have scroll dimensions equal to their player viewport dimensions. Evidence: `/tmp/twitch-grid-viewport-fit/geometry-final.log`; no product change or suite rerun was needed.

## Incident knowledge

Read canonical postmortem-memory before remediation. Query `BRIDGE_NOT_READY chrome-devtools-axi` matched prior Twitch reports documenting the same bridge limitation; their playback fixes do not apply to this layout issue. Query `Playwright webServer failed to start loopback bind EACCES` matched `ext-sandbox-loopback`; successful server/browser startup with loopback access confirms applicability. No new reusable learning beyond those known environment limitations. Registration in the canonical external ledger is subject to workspace write permissions.

Final evidence scope: Playwright is a verified runtime workaround for this task's browser verification. The preferred bridge remains unresolved. Fresh verification after correcting the stale header-only minimum passes all 31 browser tests (`/tmp/twitch-grid-viewport-fit/browser-full-after-watch.log`) and all 146 unit tests. The earlier quality-manager and bitrate failures did not recur; this task applied no changes to either implementation, and their transient cause is unconfirmed. No bridge repair, real Twitch playback or quality-manager/bitrate fix is claimed. The reviewed ledger decision is no new reusable learning: the known loopback/bridge guidance covers the environment issue, and transient unrelated assertions supply no diagnosed root cause.
