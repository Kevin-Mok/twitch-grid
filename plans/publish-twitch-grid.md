# Publish Twitch Grid source

Review the current app for public release, create one coherent initial commit with its implementation and supporting documentation, and push it to a new public GitHub repository named `twitch-grid`. Keep runtime failures visible and preserve the original workspace.

## Scope and decisions

- User explicitly authorized a new public GitHub repository and commit-plan-push on 2026-10-22.
- The source workspace has no usable Git metadata and an empty read-only `.git` mount. Prepare a separate ordinary checkout rather than altering that mount.
- Authenticated GitHub account: `Kevin-Mok`. Target: `Kevin-Mok/twitch-grid`, branch `main`.
- One initial commit is the smallest coherent series: app, tests, build configuration, research, smoke checks, living plans, postmortems and README. There is no prior application history to split or rewrite.
- Exclude dependencies, build/test output, sandbox mounts, private/machine-local files, downloaded third-party bundles and the user's desktop screenshot. Review all intended text and image evidence before publishing.
- Run the required shared privacy gate against the exact staged candidate. Keep its local runner outside the published tree when it is not part of the application.
- Do not claim the simultaneous real-playback bug is fixed. No website deployment is requested.

## Checklist

- [x] Capture source status and identify the authenticated account.
- [x] Review and classify every deliverable; machine paths replaced with placeholders in the public copy.
- [x] Create an ordinary checkout and inspect its initial status before tracked edits.
- [x] Run relevant app checks and README review: 128 unit/integration tests, 18 browser tests, typecheck/build/inspection, install with zero vulnerabilities.
- [x] Stage and review the candidate; repair all privacy findings and observe a passing gate. Recheck the final index immediately before committing.
- [ ] Create `feat: add static Twitch multistream workspace`, including this plan.
- [x] Create the new public `Kevin-Mok/twitch-grid` repository and configure origin.
- [ ] Push the complete verified series once.
- [ ] Verify public visibility, remote branch SHA and final worktree state.

## Risks, rollback and validation

Public Git history is durable: exclude private screenshot surfaces, local caches and secrets before the first commit. Gate errors are blocking; ordinary application checks are reported accurately. Preserve all original workspace files and unrelated canonical-memory changes. Before pushing, the new checkout can be retained locally without touching the original. After publication, do not rewrite history or delete the repository without separate instruction.

Run unit/integration tests, TypeScript, production build, static artifact inspection and static-browser tests on the reviewed source. Read the README against actual scripts and known runtime limits. Record results and residuals here before committing, then report the resulting SHA and remote verification in the handoff. Direct verification uses the GitHub repository, its public metadata and a served static app; no test command substitutes for actual playback acceptance.

## Candidate review

The initial copy contained 61 application and companion files; two publication incident reports bring the reviewed tree to 63 files, all attributable to this task or the user-supplied product prompt. The prompt contains product requirements and public references, so it is included with its README link. Four evidence screenshots contain only the isolated reference/app UI and public Twitch content; the user's personal desktop screenshot is excluded. No file exceeds 3 MB. Public documentation uses placeholders for machine paths; exact code and research artifact hashes remain unchanged. Dependencies, static output, browser results, sandbox mounts and a local ignored symlink to the shared privacy scanner remain outside the commit. Environment files are ignored. Git identity uses the account's public GitHub noreply address.

There were no active local Git hooks or upstream settings in the new repository. The shared privacy gate is invoked through the ignored local `scripts/executable_privacy-gate` symlink, using the exact staged index. This tool is a local delivery prerequisite and is not an application dependency.

## Initial commit milestone

`feat: add static Twitch multistream workspace` contains the reviewed source, tests and matching documentation. The README gate is update-in-same-change: known simultaneous-playback failure is explicit, command flags and environment options are documented, and historical no-Git notes are distinguished from this publication. Checks pass with the checkout write permission described in the new postmortem. No app behavior changed during publication. Remaining work after the commit is one upstream push and remote SHA/visibility verification; those receipts are reported in the final handoff rather than invented in the commit.

The first gate blocked two synthetic content matches (browser-version/address ambiguity and URL-userinfo/email ambiguity) plus public Git metadata identity. Equivalent public fixtures and a supported exact public-identity policy resolved all four; the scanner was not changed. The staged whitespace check passes. The public remote now exists, and push remains the final delivery action. Local private scanner/policy files are intentionally excluded, with no eligible source residuals planned.

Canonical learning checks: all nine publication postmortem paths and the original source playback report passed targeted reviewed-hash/alias checks with exit 0. The local source and independent public copy are preserved separately. Final receipt checks are public repository visibility, remote main SHA matching the local commit, and no eligible worktree residuals.
