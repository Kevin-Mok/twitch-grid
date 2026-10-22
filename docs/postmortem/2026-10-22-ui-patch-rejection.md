# UI patch transaction rejected

This records an atomic patch rejection during initial interface creation and the corrected write strategy.

- Symptom: `apply_patch` rejected a transaction that deleted and added `src/App.tsx` in the same patch: “multiple operations target”. No files in that transaction were changed.
- Impact: UI creation delayed; domain and player work remained intact.
- Lookup: canonical postmortem search `apply_patch multiple operations target`; editor transport guidance applies generally, but the error itself identifies the duplicate target.
- Resolution: use one Update operation for the existing file and separate Add operations for new component files. Transfer component assigned separately to its owner.
- Verification: corrected one-target Update and separate Add operations succeeded. Browser validation remains the acceptance check for resulting UI behavior.
- Related harmless read failure: an agent looked for `src/components/ChatPanel.tsx` before its owner had created it; the file was subsequently added. Shared workers must coordinate readiness before dependent reads.
- Learning: existing `ext-patch-operation-contract` documents this exact duplicate-target remedy. Final 128 unit/integration and 18 browser tests verify the resulting application separately from the patch correction. Root owns the report/hash link; targeted check results are recorded in `docs/validation.md`.
