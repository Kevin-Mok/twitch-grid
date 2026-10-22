# Channel status formatting

Preserve entered Twitch name capitalization while keeping normalized identity, and simplify the tile diagnostics. Update rendering, persisted validation and checks together.

## Atomic plan
- [x] Capture dirty baseline; inspect domain, player header, sidebar/chat and fixtures.
- [x] Define browser expectations for arrow, FPS and no Live; observe RED (missing arrow).
- [x] Define and observe casing RED; preserve entered casing for names and URLs, old backups, duplicate re-entry and backup/profile persistence.
- [x] Render preserved names in header/sidebar/chat, omit online Live text, show numeric FPS and download arrow.
- [x] Run focused/full tests, build/typecheck, update smoke instructions and README.

Scope: optional validated displayName matching lowercase login; no metadata service or guessed casing. Existing lowercase entries keep their spelling until re-entered with casing. Lowercase share-link format stays compatible; JSON backups preserve casing. Keep offline/error/unknown text and the accessible online dot. Preserve unrelated dirty files. Initial implementation did not request commit/push; the later commit-session milestone below authorizes scoped delivery.

Rollback: revert this task's hunks only; remove optional displayName fields before opening data in an older build if necessary.

Cursor prompt: Read this plan; preserve unrelated work. Verify entered Risezd displays as Risezd with identity risezd, re-entry updates casing without replacing frames, backup/profile reload retains casing, and header shows 60 FPS and ↓ bandwidth without Live. For scoped delivery, run unit suite/build and tests/channel-status.spec.ts plus tests/fps-estimate.spec.ts; bandwidth verification stays with the uncommitted bitrate prerequisite. Manually check live/offline headers and reload.

Suggested commit: feat: preserve channel casing and simplify status labels

## Evidence and risks
Browser RED: expected ↓ 0.38 MB/s, received 0.38 MB/s. No official display-name lookup is added; entered spelling is user supplied. FPS remains a provider estimate documented in tooltip and accessible label.


Casing RED observed: displayName undefined instead of Risezd/CoachBoop. GREEN: 149/149 unit tests, build/typecheck, and both new formatting/casing browser scenarios pass. Full browser run: 33 passed, 3 failed because unrelated quality/watch scenarios still waited for the intentionally removed visible Live text. Updated all four readiness assertions to the retained accessible Live dot; rerun pending. Independent read-only review found no correctness blocker. README gate: update_in_same_change for capitalization, FPS and arrows; existing opening/stack/setup hierarchy retained. Updated matching smoke and validation docs. Live Chrome bridge did not start; no live Twitch appearance/smoothness claim. Canonical postmortem ledger registration completed with escalated workspace permission; no new learning beyond existing tooling/assertion guidance.


Final evidence: npm test 149/149 (10 files), npm run build including typecheck exit 0, git diff --check exit 0. Full browser rerun 36 passed/1 failed: a concurrently added FPS scenario still expected Twitch ~60 FPS. Updated its two wording expectations only; focused FPS rerun 1/1 passed. Full suite was not repeated after that assertion-only correction; all 37 scenarios have passing evidence across these runs. Casing browser scenario proves re-entry retains the iframe and updates tile/sidebar/chat, plus reload persistence. No screenshot or real Twitch check. All task implementation/docs complete; no commit/push.


## Commit-session delivery milestone

Scope uses direct-write attribution for session 01a1656f-0848-79b0-b183-5079f5f6f154: helper returned unsafe because nested exec writes were not detected. Captured initial dirty baseline and observed transformations establish owned hunks. Isolated candidate starts from HEAD c7e00dc and includes only casing, accessible online dot/no visible Live, numeric FPS, matching tests/docs/lesson and this plan/report. Pre-existing bitrate, chat-crop and playback work remain excluded, as do secrets and machine-local files. The per-stream arrow depends on the pre-existing bitrate implementation and stays uncommitted with it. The task's casing browser scenario moved to tests/channel-status.spec.ts so it can ship without the pre-existing untracked bitrate suite.

README gate: update_in_same_change for new name/label behavior; install/setup, existing flags, recruiter hook and repo-grounded stack rationale retained. Standalone candidate validation passed as recorded below. Privacy gate uses the canonical ~/linux-config/scripts/executable_privacy-gate from this repository root because no local wrapper exists.

Milestone subject: feat: preserve channel casing and simplify status labels. Review: validate exact staged tree against isolated candidate; rollback through a new revert commit if needed. Push once to origin/main after checks; verify configured Vercel Git deployment without uploading dirty local files.


Commit milestone verification: standalone candidate passed 143/143 unit tests, full 30/30 browser tests and build/typecheck (all exit 0). Independent scope review confirms bitrate/chat-crop/playback edits absent. README repaired its validation summary using this candidate's observed results; recruiter hook/stack/setup/command gate passes. Eligible code/docs/tests complete; no blocker to scoped commit. Per-stream arrow and unrelated pre-existing work remain uncommitted. Next step: privacy gate, commit and one push to origin/main, then verify Vercel Git deployment.
