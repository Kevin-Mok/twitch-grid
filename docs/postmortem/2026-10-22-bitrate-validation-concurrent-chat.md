# Bitrate validation during concurrent chat changes

Record the production-build failure during bitrate validation, preserve unrelated work, and verify a coherent source snapshot before browser acceptance.

## Symptom and impact

The test agent passed 133 unit tests and typecheck, then `npm run build` failed on TypeScript errors: missing `showChrome` in chat fixtures in `src/components/ChatPanel.test.ts:65` and `src/domain.test.ts:91–93,99`. Since the same build runs TypeScript before Vite, no fresh production bundle exists from that attempt; browser results against an old bundle cannot validate bitrate behavior.

## Evidence and current status

The bitrate changes do not modify ChatSettings or chat fixtures. Other sessions are modifying chat/domain files in the shared checkout. Earlier status records and fresh source inspection distinguish those from this task. Canonical incident knowledge previously consulted covers tool/evidence boundaries; no past remedy establishes these fixtures are correct. Status: investigating concurrent schema/fixture updates before one fresh build. Preserve their changes; do not weaken validation or claim old-dist acceptance.

## Next steps

Inspect current showChrome schema and fixtures. If the concurrent edit has finished, run fresh typecheck/build and only then the browser suite. Record final results here. Do not change unrelated chat behavior merely to silence errors.


## Resolution and verification

The chat task owner confirmed its expected RED schema tests were in progress and subsequently implemented the missing field/default/legacy normalization. No bitrate-task edits were made to those files. Fresh unit tests passed 136/136, typecheck and production build exited 0. The fresh full browser suite passed the bitrate and chat-crop cases; the sole failure (27/28 passing) was the grid task owner's newly introduced intentional narrow-panels two-column RED predicate. The grid owner had explicitly notified this task before the result; it is intentional TDD evidence, not an unrelated production repair assigned here. Coordinate a coherent final build/browser run after that task's GREEN and do not overwrite either task's files.

Root cause: concurrent TDD edits changed the shared source snapshot between successful typecheck and build, then between regression definitions and their implementation. Remedy: coordinate owners, preserve edits and rebuild before acceptance. The old-dist browser attempt is rejected as evidence. No new general learning beyond preserving source-snapshot/evidence boundaries; canonical registration follows after final verification.

The grid owner subsequently applied its one-line contentRect measurement fix and confirmed bitrate changes were preserved. Its full suite runs on an isolated port; this task runs a fresh build and focused bitrate/native-playback checks. No port listener was stopped. The initial chat build failure is resolved; final coherent regression evidence is maintained in the bitrate plan.
