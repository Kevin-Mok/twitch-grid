# Dev port validation exposed a playback test failure

This report records the unrelated regression-suite failure found while making development startup reclaim port 5173. Reproduce the playback assertion separately before changing the player manager.

- Status: unresolved playback assertion; port takeover verified.
- Symptom: `npm test` reported 150 passing tests and one failure in `src/player/manager.test.ts:43`, “retries startup playback on ONLINE…”; expected two calls, received one.
- Impact: the full unit suite is not green. This does not invalidate the separate runtime takeover check.
- Context: both `src/player/manager.ts` and its tests were already modified before this task. This task changed neither. Whether the failure predates this task has not been established by a baseline test run.
- Evidence: the test agent ran the real npm startup twice; the second replaced the first listener on 5173 and served HTTP 200. Typecheck passed. Final startup printed `http://127.0.0.1:5173/`; root HTML and favicon both returned HTTP 200.
- Memory lookup: query `manager startup playback ONLINE expected 2 calls got 1` returned broad unrelated findings; no applicable established remedy was identified. No playback remediation was attempted.
- Root cause: not investigated within this development-command change.
- Commit verification: an exact staged-index export built successfully and reproduced the same single test failure (150 passed). Its player-manager test file matches the staged version, excluding the unrelated working-tree edits. Logs: `/tmp/twitch-grid-index-tests.log` and `/tmp/twitch-grid-index-build.log`.
- Next step: reproduce the named player-manager test against the existing playback work before altering its assertions or implementation.
- Learning: no new general remedy established. Canonical memory ledger registration remains outstanding outside this workspace; installed copies were not edited.

The initial listener inspection was denied by sandbox socket permissions. Runtime verification used approved execution; no command targeted port 5174. The `refresh-config` helper was not available on the command PATH, so configuration refresh was not run.
