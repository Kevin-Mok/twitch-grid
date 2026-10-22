# Workspace Git metadata unavailable

This report records the initial repository-status failure and the safe working boundary for this build.

- Symptom/evidence: `git status --short` in `<source-workspace>` returned 128, “not a git repository”. The folder contains a read-only sandbox `.git` mount with no usable metadata and the supplied prompt.
- Impact: Git history, staging and commit verification are unavailable; application files can still be created within the writable workspace.
- Lookup: searched canonical postmortem knowledge for `not a git repository empty workspace` and `not a git repository`. Broad environment findings do not establish a Git repair for this mount.
- Applicability: no command-runner failure; ordinary commands work. Do not initialize or replace the protected metadata mount.
- Resolution/status: work directly in the provided folder, preserve initial files, report no commit. No repair of Git is claimed.
- Verification: directory listing confirmed only supplied prompt and restricted mounts before implementation.
- Learning: no reusable new finding; this is a supplied-environment boundary. Root owns canonical hash registration through normal scoped filesystem permission. Check results are recorded in `docs/validation.md`.
