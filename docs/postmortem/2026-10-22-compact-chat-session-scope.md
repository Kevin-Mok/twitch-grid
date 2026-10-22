# Compact chat session commit scoping

Ship only this session's chat help and maximize controls while preserving edits from other sessions. Build and validate a candidate from immutable Git blobs and independently observed session edits before staging.

## Symptoms and impact

The commit-session helper returned `unsafe`: its log reader detected no repo-writing actions because these edits used wrapped custom tool calls. The actual conversation records the pre-write status and successful patches. Newer sessions had also changed overlapping files and committed the one-row header dropdown as 1f271db. Whole-file staging would include unrelated work or undo that committed dropdown.

A candidate-preparation prototype using a generic temporary directory hit `ValueError: substring not found` while adapting smoke docs. The directory's contents differed from the expected snapshot; no shared working-tree source was changed. A read-only listener probe also reported netlink access denied in the sandbox. A probe for .vercel/project.json found no linked deployment file. None is evidence of a product failure.

## Diagnosis and resolution

Canonical postmortem-memory guidance was already consulted for sandbox and tool-boundary issues in the related browser-binding report. Use direct-write fallback allowed by commit-session. Use a unique mkdtemp directory, read each candidate base file from a specific Git commit, preserve the committed dropdown, and add only this session's remaining help/maximize code, tests and matching documentation. Do not infer ownership from timestamps. The unique candidate based on 1f271db built successfully and all 130 unit tests passed. All 19 isolated browser tests subsequently passed (12.5 seconds), including frame retention and maximization at all four widths. The production build includes a passing typecheck. Privacy review is an explicit pre-commit step, separate from these product checks.

## Safety and follow-up

Leave all unrelated working-tree bytes and staged work untouched. Use an isolated index, verify its exact tree, run the required privacy gate, and preserve native hooks. The canonical memory entry needs this report's final hash/alias with a no-new-learning decision: the existing observed-write fallback, immutable candidate and execution-boundary guidance apply.

## Privacy finding

The required exact-index privacy gate blocked one home_path finding in the plan’s recorded check command. Replaced that machine-specific prefix with the repository-relative report path and restaged the reviewed documentation. This is a verified scanner finding; the final privacy gate must pass before a commit attempt. Do not bypass the gate or publish the original absolute home path.
