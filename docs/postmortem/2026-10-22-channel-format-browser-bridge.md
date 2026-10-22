# Channel formatting browser bridge unavailable

Record why live-browser inspection was unavailable while checking channel labels. Use controlled Chromium checks for application behavior and keep real Twitch verification separate.

## Symptom and impact
`chrome-devtools-axi pages` returned `BRIDGE_NOT_READY`: bridge failed to start within 30 seconds. Live attached-browser inspection could not proceed. Source changes are unaffected.

## Evidence and status
Memory lookup: `BRIDGE_NOT_READY` matched existing execution-environment tooling guidance; this is a bridge startup failure, not evidence of a Twitch/app failure. No bridge retry or dependency installation attempted. Root cause unresolved; controlled Playwright verification is recorded in plans/channel-status-format.md. Sandbox preview startup also required elevated loopback execution for the intentional RED check.

## Next steps and learning
Real Twitch appearance remains a manual check. No new remedy was established. Canonical learning decision: no new learning beyond existing bridge/loopback and stale UI assertion guidance. Register this report in the tracked ledger; installed copies remain untouched.


## Browser assertion follow-up
Full browser verification exposed four tests in quality.spec.ts and watch.spec.ts waiting for visible Live text that this task intentionally removes. Changed those readiness assertions to the same status dot's accessible Live name; quality/playback assertions stay intact. Root cause: callers of removed UI text were missed in the initial mapping. Follow-up: search all test expectations when removing visible labels, including tests whose primary subject differs. Verification is recorded in the task plan.


A concurrently added fps-estimate.spec.ts still expected the old Twitch ~60 FPS wording. Updated only its two wording assertions; timing, tooltip, pause/resume, iframe and quality checks remain intact. Full rerun passed 36 cases with only this stale wording assertion failing; targeted verification follows in the plan. No production playback change was required.


## Scoped commit privacy check
The staged privacy gate blocked an absolute home-directory path in the task plan before any commit was created (category home_path). Replaced the plan's machine-specific path with home-relative notation and restaged the sanitized document. No private values are reproduced here. Gate verification is recorded in the delivery plan. This is a documentation portability/privacy repair; application source and test results are unchanged.
