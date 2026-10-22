# Vercel automatic deployment setup

Track setup of the twitchgrid Vercel project and automatic deployment from this repository's main branch. Separate local CLI failures from project configuration and deployed runtime evidence.

## Initial failure and impact

Vercel CLI 59.1.3 could not write its update-check lock/log under the Vercel user-cache package-updates directory in the restricted sandbox. This does not indicate a project build failure. No Vercel project or deployment has been changed yet.

## Lookup and next steps

Read canonical postmortem-memory and queried Vercel authentication read-only cache. Prior ext-vercel-authentication reports warn that a push does not prove deployment; authenticate only if needed and retain local work. Use normal tool permission for CLI cache/network access, inspect login and existing projects, then connect only the intended repository/project. Current status: setup in progress, live deployment unverified.

## Progress

Normal tool escalation resolved cache/network access. CLI authenticated as kevin-mok. Explicit project lookup found no twitchgrid project; creation succeeded. Configured Vite, npm ci, npm run build, dist. Linked only /tmp/twitchgrid-vercel-deploy exported from committed c7e00dc, avoiding dirty workspace/.aws. Link automatically downloaded an OIDC .env.local into that temporary export; do not upload the local export, use a Git-source deployment instead. Git connection and runtime verification follow.

## Resolution and verification

Resolved CLI cache/network limitation with normal escalation; credentials already worked and no login or global config edit was needed. Created twitchgrid under kevin-mok, connected GitHub Kevin-Mok/twitch-grid, productionBranch main, Vite/npm ci/npm run build/dist. Initial Git-source production deployment dpl_6Fd47s29v4YFDLbHsnVYxFaZv5pJ is READY at https://twitchgrid.vercel.app, exact committed SHA c7e00dc62a829177a13f936d680d8ab070c87b35 verified via API. Root HTML and JS/CSS assets returned200. A temporary link-generated OIDC .env.local was removed without uploading it. Future push-trigger execution and real Twitch playback/audio were not tested.

Learning decision: no new reusable failure guidance. Existing execution-environment/cache and Vercel external-access guidance applies; this account's valid credentials do not retrospectively resolve unrelated authentication reports. Normal permission and a committed Git-source deployment are verified; no speculative application fix, hook bypass or CI secret was introduced.

## Commit privacy gate

The first documentation commit attempt was blocked by the required exact-index privacy gate (home_path category) because this report recorded a machine-specific absolute cache location. No commit was created and no hook bypass was attempted. Lookup privacy gate home_path confirmed the existing public privacy boundary. Replaced that location with a non-identifying cache description, retained diagnostic meaning, and staged the sanitized report for a fresh exact-index check. Verification and commit retry follow.

Sanitized exact-index privacy check passed. This verifies the correction without scanner exceptions; the final commit candidate must pass the same gate again immediately before commit. No new learning beyond existing public privacy guidance; canonical report hash must be updated to this reviewed sanitized version.
