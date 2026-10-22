# Deploy twitchgrid on commits

Connect the current main branch of Kevin-Mok/twitch-grid to the Vercel project twitchgrid, enable automatic Git deployments, and verify the deployed result.

## Scope and decisions

User explicitly authorizes Vercel configuration and deployment under twitchgrid. Current branch main, upstream origin/main. Prefer native Vercel GitHub integration over CI secrets/workflows. Deploy committed source only; preserve unrelated dirty work captured before edits. No app behavior, dependency, credential, or global Codex configuration changes. Plan Mode unavailable; use this atomic plan.

## Checklist

- [x] Capture Git baseline; identify branch, upstream, CLI and supported tools.
- [x] Verify Vercel identity/scope and existing project ownership.
- [x] Create/link twitchgrid and connect Kevin-Mok/twitch-grid main for production auto deployments.
- [x] Verify production deployment and deployment-on-commit settings.
- [x] Update README, smoke checklist and exact evidence/limits.

Risks: app data is origin-local and is not migrated between local and deployed URLs. Never deploy .aws or unrelated dirty source. Check project ownership and GitHub access before mutation. Rollback: disconnect repository integration if requested, without deleting production or rewriting history.

Failure and memory lookup: see docs/postmortem/2026-10-22-vercel-auto-deploy.md. Initial CLI update cache was read-only; retry only with normal permission or a task-local cache.

## Verified evidence

Vercel CLI 59.1.3 authenticated as kevin-mok. Project twitchgrid created and configured framework vite, install npm ci, build npm run build, output dist. CLI git connect succeeded for Kevin-Mok/twitch-grid. API GET project confirmed GitHub link repoId 1430140229 and productionBranch main; no vercel.json overrides disable Git deployments. Native Vercel Git integration deploys pushes by default. gitProviderOptions.createDeployments disabled only means GitHub Deployment API annotations are disabled, not Vercel builds; repository_dispatch callbacks also remain disabled.

POST /v13/deployments with GitHub gitSource repoId/ref/main/exact SHA created production deployment dpl_6Fd47s29v4YFDLbHsnVYxFaZv5pJ from committed c7e00dc62a829177a13f936d680d8ab070c87b35. Vercel inspect reports Ready; verified public domain twitchgrid.vercel.app belongs to this project and aliases this deployment. Fresh HTTP checks: root200, title Twitch Multiplayer, built JavaScript200 and CSS200. Fresh deployment API confirms readyState READY, target production, GitHub ref main and exact c7e00dc62a829177a13f936d680d8ab070c87b35 in both gitSource and GitHub commit metadata.

No local source upload, dependency install, app code, GitHub Actions, repository secret or global configuration change. Link used a temporary committed export; its automatically generated OIDC environment file was deleted. All pre-existing dirty work is preserved. README and grouped smoke checks updated. No commit/push was performed for this setup task. Saved external Vercel settings persist independently of these documentation edits. Future push-trigger execution and real Twitch playback/audio have not been exercised in this turn; automatic Git configuration and initial Git-source production deployment are verified separately.

Continuation: inspect vercel project twitchgrid under scope kevin-mok; verify productionBranch main and newest Git commit after the next authorized push; check public URL and assets. Do not upload the dirty checkout or overwrite unrelated settings. Suggested docs commit: docs: record twitchgrid automatic deployments.

Final deployed browser smoke: isolated Chrome context loaded public HTTPS URL with HTTP200; empty-workspace heading, channel input and Add channels button visible; zero uncaught page errors. No channels added or saved user data changed. Final Vercel project inspection reconfirmed Vite/npm ci/npm run build/dist and root directory '.', Node24.x. Canonical incident learning registration and targeted check passed with no errors/new/changed/unregistered aliases. Work complete; external Vercel configuration is saved, production URL verified, documentation remains uncommitted alongside protected prior work.

## Delivery milestone: docs: record twitchgrid automatic deployments

User invoked commit-session after setup. Scope helper for thread 01a16566-f6f6-77c3-bd22-79ca38f779f2 again reported no successful wrapped writes, so the directly observed edits define scope: README Static Vercel hosting paragraph, docs/smoke-tests.md Automatic Vercel deployment section, this plan and the setup incident only. Build the candidate from HEAD 245cf7b to preserve all unrelated committed and dirty changes. No app code or local Vercel credentials are eligible.

README recruiter-sync: update_in_same_change, replacing stale no-deployment text with verified public URL, project/branch and saved settings. Existing recruiter hook, stack rationale, install/use/command reference remain. Validation: scoped Markdown diff and fresh Vercel deployment inspection; no source changes require another unit suite. Exact candidate privacy gate and Git hooks must pass before commit.

Milestone status: Vercel configuration complete, initial production deployment and browser rendering verified. Commit/push documentation to main → origin/main, then verify Vercel automatically deploys that exact new commit; no manual redeployment should obscure this trigger test. Retain every unrelated dirty file/hunk and the separate linux-config learning-ledger edit. Rollback is a new docs revert if requested; do not remove the working external project.

Fresh pre-commit trigger evidence: deployment API lists source git, production READY for 898197d, c3d9b38 and latest 245cf7b800242f2ec3fba5ee110eed5da671545c (deployment dpl_6yV5kFS7fYCFHPKzmReYcmNnnUew). These automatic deployments occurred after the initial CLI Git-source deployment and confirm push-trigger execution. The new documentation commit will provide a further exact-commit check after push. Real Twitch playback/audio remains unverified.

First commit attempt: exact-candidate privacy gate blocked home_path in the setup incident; no commit created. Sanitized the task-owned absolute cache path without changing scanner rules, restage and rerun gate. Record successful retry and push in the delivery output.
