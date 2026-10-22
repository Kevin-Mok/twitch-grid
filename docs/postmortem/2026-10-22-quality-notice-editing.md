# Quality notice editing failures

This report records path and patch-context mistakes while adding the five-second quality notice timeout. Product behavior was not changed by the failed patches.

## Symptom, impact and evidence

Optional reads assumed `vitest.config.ts` and `.agent/PLANS.md` existed. The actual configuration is `vite.config.ts`; the local plan contract is absent. Three atomic patch attempts also used incomplete or guessed documentation anchors and failed verification. No partial changes were applied. These mistakes delayed a small UI change.

## Resolution and status

Read the actual README section, use complete observed anchors, and apply source changes separately. Source integration and documentation updates subsequently succeeded. The timer regressions intentionally failed before implementation; those RED results are exempt from incident reporting.

## Memory lookup and learning

Query: `apply_patch missing file discovery`. Existing finding `ext-optional-path-discovery` applies: inspect actual inventory rather than assuming optional files. No new reusable learning; patch failures likewise reinforce using observed source context. Canonical ledger lives outside this workspace at `linux-config/dot_agents/skills/postmortem-memory/sources.json`; registration records the existing discovery finding with a no-new-learning decision.

The initial browser startup was blocked by sandbox loopback restrictions; an escalated run reached the test. Its 4,999 ms clock advance incorrectly assumed no time had elapsed between mounting and assertion. Unit tests already prove the precise boundary using frozen timers. The browser check now observes real disappearance within six seconds, avoiding an artificial timing race.

## Verification and next steps

The full unit suite passed 135 tests and the production build/typecheck passed. Focused Chromium verification passed 1/1; the final full unit rerun passed 135 tests and build/typecheck passed. No rollback is needed for rejected patches. Canonical incident registration is checked separately.

## Complete-hiding follow-up

The first revised browser probe accessed the fixture call log before the external SDK script initialized it, raising an undefined-property error before the intended assertion. The poll now treats an absent log as zero calls. The next run reached intentional RED: expected zero notices, received one. This is a fixture readiness mistake, not a product failure; lookup `fixture readiness undefined` returned no directly applicable finding. The executable evidence establishes a test-only readiness race; no new reusable finding is needed beyond waiting for fixture initialization. Product verification is recorded in the task plan.

## Isolated commit verification

The candidate's browser check found the fixed preview port 4173 occupied and exited before tests ran. The listener was preserved. Verification uses a temporary Playwright config on another available port, without changing shipped configuration. The isolated candidate's 130 unit tests and production build/typecheck passed; its focused Chromium regression then passed 1/1 on port 4197. This reinforces the existing port-collision handling guidance; no product fix or additional reusable learning is needed.

The pre-commit privacy gate blocked one home-directory reference in this report. Replacing it with a repository-relative reference preserves the diagnostic information without publishing a machine-local path. The report was restaged for another exact-index privacy check.
