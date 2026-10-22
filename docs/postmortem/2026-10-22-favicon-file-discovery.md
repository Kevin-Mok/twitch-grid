# Favicon asset discovery

An asset lookup assumed a `public` directory existed. This report records the failed lookup and the corrected favicon asset location.

- Symptom/evidence: `ls -la public` returned exit 2 because the directory did not exist; a chained standards read was skipped and subsequently completed separately.
- Impact: No application changes or data loss.
- Lookup: `file discovery nonexistent directory` matched `ext-optional-path-discovery`; applicable because an optional asset directory was assumed before inventory.
- Cause/resolution: The logo exists as CSS rather than an image. Read-only inventory confirmed this; create a matching SVG in Vite's public directory.
- Runtime probes: `curl` to port 5173 returned exit 7. Vite then reported occupied ports 5173–5175 and started at 5176, but a subsequent separate command could not connect there either (exit 7). The initial assumption of no listener was unsupported; command network isolation is suspected, not established.
- Verification: `npm run build` passed; executable assertions confirmed the built HTML icon link and byte-identical emitted SVG.
- Status: Asset location resolved and production artifact verified. HTTP/browser verification remains unconfirmed; no further network retries.
- Ledger check: Targeted `check --postmortem` returned exit 1 (`new`) because the report is not registered in the canonical linux-config ledger, which remains outside writable roots.
- Commit preparation: Initial staging returned exit 128 because `.git/index.lock` could not be created on the sandbox's read-only Git directory. No index changes occurred; request elevated execution for the explicitly authorized scoped commit.
- Learning: Existing optional-path discovery guidance covers this incident; no new general learning. Canonical ledger update is outside the writable workspace and remains outstanding.
- Privacy check: The initial staged report was blocked for a local home-directory path. Remove that unnecessary machine-specific path before rerunning the gate. Concurrent work replaced the shared task-status document; preserve it and use a favicon-specific status document.
