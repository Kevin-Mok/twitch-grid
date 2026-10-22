# Browser validation blocked by sandbox loopback policy

This report distinguishes the sandbox server-start failure from intentional UI test failures and records the approved verification route.

## Symptom and impact

The requested browser acceptance test could not start its configured Vite preview server under the default sandbox. This initially blocked the five-player acceptance check; the test itself later ran successfully after loopback access was authorized and reached its expected UI RED assertion.

## Evidence

- Command: `npm run test:browser -- --grep 'five players'`
- Sandboxed result: Playwright reported `Process from config.webServer was not able to start. Exit code: 1`.
- Direct preview diagnostic: `npm run preview -- --strictPort` reported `listen EPERM: operation not permitted 127.0.0.1:4173`.
- After loopback escalation, the browser test started and failed after 30 seconds waiting for `getByLabel('Channel or Twitch URL')` at `tests/watch.spec.ts:6`, called from the test at `tests/watch.spec.ts:13`.
- The escalated test result was 1 failed test, with the UI locator timeout as the failure; this is separate from the sandbox startup failure.

## Memory lookup and applicability

The tests agent initially read the installed `postmortem-memory` skill; root subsequently reviewed the canonical tracked skill and owns ledger reconciliation. Search query: `Playwright configured webServer exited with code 1 browser test`. The top matches concerned local Playwright browser installations and project-local browser caches. They do not apply to this failure: Playwright and Chromium launched after escalation, and direct diagnosis identified an OS loopback bind denial (`EPERM`) for the configured preview server. No matching loopback-specific remedy was established by the lookup.

## Status and next steps

Status: verified workaround via approved loopback access. After implementation, all 18 browser acceptance tests passed (see `docs/evidence/validation-automated.log`); the earlier missing input reached intentional RED before UI implementation. The sandbox restriction itself remains in place for un-escalated browser runs. No persistent permission configuration was changed. Canonical learning review distinguishes this OS bind restriction from historical bwrap startup failures.
