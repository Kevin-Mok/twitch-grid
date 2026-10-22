# Reference research network access

This report records the network limitation encountered while acquiring the official REA documentation for the Viewington investigation, and the evidence used to continue safely.

- Symptom: sandboxed `curl -fsSL` to `raw.githubusercontent.com` returned exit 6 (`Could not resolve host`); the dependent file read had no downloaded file.
- Impact: the first shell attempts could not acquire official CLI documentation and temporary research tooling. The web browsing tool remained available for the official pages.
- Evidence: first attempt on 2026-10-22, output `curl: (6) Could not resolve host: raw.githubusercontent.com` for README and browser-observation documentation. No repository source or user browser was changed.
- Current status: verified workaround. The scoped escalated download succeeded with exit 0; official REA help and schema are available. Downloads remain under `<temporary-research-directory>`.
- Knowledge lookup: canonical query `curl Could not resolve host sandbox network DNS` returned `ext-sandbox-loopback`. Its restriction/approved-route distinction is relevant, but its `bwrap` startup symptom is not the present DNS symptom; no claim of the same cause is made. The approved retry established the network workaround directly.
- Resolution: use scoped escalated downloads for official research inputs. No agent configuration changed. REA 6.7.0 was acquired transiently; its Node22.15 engine warning prompted a supported temporary Node24 runtime rather than relying on unsupported execution.
- Related root-task evidence: sandboxed npm registry access failed with `EAI_AGAIN registry.npmjs.org`. A scoped escalated `npm view` succeeded; project dependency installation then completed with 91 packages and zero audit vulnerabilities.
- Verification: research inputs were acquired through the scoped approved route, the evidence report was delivered, and the isolated browser session was stopped. Windows runtime and full-site source-map analysis remain explicitly unverified in `docs/research.md`.
- Next steps: retain the documented platform restrictions and root-owned canonical learning review; no broader network permission change is needed.
- Learning update: root agent owns aggregate canonical ledger reconciliation/check. The canonical directory is outside this worker's writable scope. This is a new occurrence of the existing approved-route network restriction pattern, not evidence that the historical bwrap loopback root cause applies here.
