# Initial public candidate privacy review

This report records a blocked staged privacy check before the initial public commit. Classify each safe diagnostic locally, remove private material or explicitly bind reviewed public content to the scanner's supported policy, and rerun the exact candidate before any commit.

- Symptom: the mandatory shared staged privacy gate returned exit 1 with four findings in the email and IP-address categories.
- Impact: commit and push are blocked until every finding is resolved; no candidate has been committed or published.
- Evidence: `python3 scripts/executable_privacy-gate check` scanned the staged initial tree and refused it. The independent human-equivalent content review found no real credentials or private account session, but does not replace this required gate.
- Status: verified workaround. The two synthetic content matches were repaired, and only the confirmed public GitHub noreply identity pair was approved through the supported external private policy. No scanner finding was ignored or bypassed.
- Next steps: consult canonical privacy-gate guidance, inspect the four hashed diagnostic locations locally, repair or approve only verified public values using the supported exact-content mechanism, restage, and require a clean gate immediately before committing.

- Companion hygiene check: `git diff --cached --check` identified an extra blank line at EOF in the supplied prompt copy. Only the public copy was normalized; the original user file remains unchanged. This is a whitespace repair, not an application behavior change.

- Lookup: canonical `privacy gate public noreply email loopback ip exact content approvals` matched `local-privacy-reviewed-content-approvals`; its exact-public-identity policy and private-prohibition precedence are applicable. Content approvals cannot suppress the email/IP categories.
- Classification: the IP finding was a four-part browser version, not a network endpoint; the email finding was URL userinfo in a synthetic malformed-Twitch-URL fixture. The remaining two findings were the author and committer's confirmed public GitHub noreply identity.
- Repairs: public browser evidence now records its major version. The userinfo test constructs a URL and assigns its synthetic username explicitly, retaining the same Twitch host and username-rejection coverage. No private value was encoded or hidden. Original machine-path evidence stays in the original workspace.
- Metadata resolution: the scanner's supported external mode-0600 policy approves only the exact confirmed public GitHub noreply name/email pair. No private rules path was configured previously; independently loaded built-in path checks and content approvals remain unchanged. The scanner itself was not changed and no content-category exception was broadened.

- Verification: the corrected staged candidate passed the canonical privacy gate with exit 0; the staged whitespace check also passed. After the equivalent userinfo fixture rewrite, all 128 unit/integration tests and TypeScript checks passed again. The final candidate is checked again immediately before committing.
- Limits: heuristic scans do not prove arbitrary encoded or binary content safe; all four screenshots were independently inspected. The private policy and local scanner symlink are excluded from the repository.
