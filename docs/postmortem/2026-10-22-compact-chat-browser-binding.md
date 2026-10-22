# Compact chat browser verification binding failure

Browser verification needs a loopback preview server. This report records a sandbox restriction encountered before tests ran and the subsequent verification result.

## Symptom and impact

The initial browser RED run could not start Playwright's preview webServer. `npm run build` passed; `npm run test:browser -- tests/compact-chat.spec.ts` exited 1 before executing tests. Direct preview diagnostics reported `listen EPERM: operation not permitted 127.0.0.1:4173`. Component tests produced the expected RED for missing auto-collapse/disclosure behavior.

## Evidence and lookup

Read canonical postmortem-memory skill before retry. Query: `listen EPERM 127.0.0.1 preview`. Existing sandbox/browser-startup guidance applies: localhost binding needs an execution context with network permission. This is not evidence of an app defect or expected product RED.

## Status and next steps

Approved execution started preview and reached expected product RED: Choose chat channel was missing. No listener was stopped and no server configuration changed. The restriction remains; this is a verified environment workaround, consistent with ext-sandbox-loopback and the existing stream-controls browser-startup report.

The first GREEN suite ran 21 browser tests: 19 passed, 2 failed because substring label lookup matched both Choose chat channel and Chat channel. The accessible controls are distinct; use a combobox role and exact name in both tests. This is a test locator ambiguity, not a chat readiness failure. Canonical learning ledger review pending; no new reusable finding beyond existing sandbox and precise-locator guidance.

The preferred chrome-devtools-axi bridge also timed out at startup (BRIDGE_NOT_READY, 30 seconds), before any page action. The already working Playwright route supplied browser screenshots; this does not repair or verify AXI startup.

## Final verification and learning

After exact combobox locators, the full browser suite passed all 21 tests (exit 0). A subsequent final run including open-sidebar restoration and screenshot capture also passed all 21 (20.9 seconds). Desktop and mobile screenshots were visually reviewed. All 131 unit tests, build/typecheck and artifact inspection passed. No real Twitch login, messaging or playback claim follows from controlled fixtures.

No new reusable learning: existing ext-sandbox-loopback guidance covers the denied bind and approved route; distinct accessible labels require precise role/name test queries, and bridge startup failure is separate from product failure. Register this report's final hash and alias as a reviewed no-new-learning decision in canonical postmortem memory. Preserve unrelated canonical ledger changes.
