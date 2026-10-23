# Fullscreen session shipping environment

Ship only the fullscreen session changes while preserving older dirty work. Use observed edits when the scope helper cannot read wrapped writes, validate the isolated candidate, and verify the deployed Git commit.

- Scope helper: exit 0 with status unsafe, no detected wrapped writes or baseline. This is an attribution limitation; the session's captured pre-write status and successful edits establish the fallback. No files were staged from the helper's empty candidate list.
- Vercel CLI help: commands printed help, but the update worker attempted writes to the read-only user cache and reported EROFS for its package-update lock/log. This does not establish a deployment failure. Existing Vercel setup evidence documents the same cache boundary.
- Impact: no user work lost, no commit or push attempted yet. Use a task-local XDG cache for CLI requests; preserve the global cache and credentials.
- Status: isolated candidate validated (146 unit tests, build/typecheck and 34 browser tests passed). Commit/push/deployment verification follows. No product bug inferred from helper/cache warnings.
- Next: validate candidate, run exact-index privacy gate and hooks, commit/push to origin/main, inspect exact-commit Vercel deployment and public assets. Record outcome in the fullscreen plan.

Memory lookup: queried Vercel cache EROFS package updates, then read the matching repository setup incident 2026-10-22-vercel-auto-deploy.md. Its read-only-cache boundary applies exactly; reuse a task-local XDG cache and normal network permission rather than changing product settings. No new general remedy is inferred.
