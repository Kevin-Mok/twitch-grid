# Publication checks need checkout write permission

This report separates an execution-permission failure from application test failures. Run validation with authorized write access to the new checkout, preserve unrelated processes, and report the resulting checks without treating them as real Twitch playback proof.

- Symptom: initial non-escalated Vitest and production-build attempts reported `ENOENT` while creating Vite temporary config files under `node_modules/.vite-temp` in the separate publication checkout.
- Impact: those attempts failed before meaningful application verification; source files and test expectations were not changed.
- Evidence: the checkout is outside the original session's default writable root. The exact operation was `mkdir` on the checkout's `node_modules/.vite-temp` directory. The tests agent repeated the same commands with approved scoped access. The underlying exception was ENOENT, not EACCES; no filesystem ownership diagnosis is claimed.
- Lookup: canonical `Vite EACCES vite-temp outside writable root` returned VPS-prefix, container-ownership and scaffolding-directory findings. They are not matching root causes here; ordinary authorized checkout writes and successful same-command retries identify the session sandbox boundary. This root review followed the agent's retries; it does not retroactively claim a pre-retry lookup. The tests agent confirmed no canonical lookup was performed before retry.
- Resolution/status: verified workaround through authorized command execution. No ownership, global permissions, sandbox policy, source code or test expectations changed.
- Verification: dependency install reported zero vulnerabilities; 128 unit/integration tests, typecheck, production build, artifact inspection and all 18 browser tests passed with approved access. Sanitized output is in `docs/evidence/validation-automated.log`.
- Remaining limits: simultaneous real Twitch playback is still an open defect. The approved checks establish fixture behavior and static build validity only.
- Learning: no new reusable root-cause finding beyond applying the session's declared writable-root boundary. Register the report/hash and preserve this evidence scope in canonical memory.
