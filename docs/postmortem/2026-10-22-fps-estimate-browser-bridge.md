# FPS estimate browser bridge unavailable

Record the unavailable desktop browser connection while implementing fast labeled FPS estimates. Use fixture checks as code evidence and keep real playback verification separate.

## Symptom and impact

2026-10-22: `chrome-devtools-axi pages` returned `BRIDGE_NOT_READY` after 30 seconds. No desktop browser state was read or changed. Live startup timing and visible smoothness cannot be verified through this connection.

## Lookup and applicability

Read canonical postmortem-memory; lookup `FPS unavailable estimate Twitch` matched unresolved ext-twitch-playback-evidence. Existing `2026-10-22-fps-investigation-tools.md` also records unavailable browser tooling. Tool failure is not evidence of an application defect. No speculative retry or app workaround.

## Status and next steps

Unresolved tool availability. Continue automated adapter/manager/browser fixture verification using installed Playwright. Report real-desktop verification as skipped. Canonical learning is a no-new-learning candidate (existing browser-tool limitations); registration follows the final evidence update.

## Validation failures

The first focused manager check passed 23/24 but a new fixture sent PLAYING after PAUSE without PLAY, contrary to documented intent handling. Corrected the fixture to emit native PLAY before PLAYING; production playback intent logic is unchanged. The adapter estimate test passed. Build passed. Playwright's configured webServer could not start (exit 1); request normal loopback permission and capture startup diagnostics before retry. Browser assertions have not yet run.

Playwright startup was resolved with normal loopback/browser escalation: preview served HTTP 200 on port 4173 and the defining browser assertion intentionally failed on the hardcoded dash. This is a verified test-environment workaround, not restored desktop bridge access. The manager fixture correction passed all 24 focused cases before adding the long-gap RED.

## Final verification and learning decision

Fresh final checks passed: 148 unit tests, typecheck, production build; full browser run scheduled 33 tests, listed cases passed and last-run status passed without failed tests. Final count summary was not captured. Desktop bridge remains unavailable; no desktop playback timing or smoothness claim. No new reusable learning: existing browser bridge/loopback guidance and documented PLAY-before-PLAYING semantics cover these failures. The corrected fixture and time-window regression are retained. Register this reviewed report hash in the canonical ledger with that no-new-learning decision.
