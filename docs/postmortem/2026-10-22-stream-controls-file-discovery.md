# Stream controls file discovery

Two read-only discovery commands assumed optional paths existed. Use the repository file map before opening source files, then continue the sidebar controls work without changing application behavior.

## Symptom and impact

`cat src/components/Sidebar.tsx src/App.tsx src/App.css` exited 1 because `src/App.css` does not exist. `ls -a plans docs .21st` exited 2 because this repository has no `.21st` directory. The requested source files that existed were read; no files or runtime state were changed by these commands.

## Evidence and lookup

The search agent identified the actual stylesheet as `src/style.css` and confirmed the app uses existing components and styles. The query `missing file path repository discovery` returned `ext-missing-shared-feedback-path` (unresolved). Its shared-instruction path case is not the same failure: the canonical feedback log was successfully read here. No remedial product change is justified.

## Resolution and verification

Root cause: an assumed framework stylesheet name and an unchecked optional design-context directory. Read `src/style.css` successfully (exit 0) and use the existing app tokens and supplied screenshot. Status: resolved discovery error; no application defect. No retry of the incorrect reads is needed.

## Learning

No new reusable finding: the existing requirement to map files before reading them covers this operator error. Register this report's reviewed hash and alias in the canonical postmortem ledger; no installed-copy edits. Product verification is tracked in `plans/stream-controls.md`.
