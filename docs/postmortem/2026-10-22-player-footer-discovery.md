# Player footer discovery probes

This report records harmless discovery failures while removing redundant player footers. Source changes and validation continued using the actual paths.

## Symptom and impact

Read commands named absent optional AGENTS/plan/fixture paths and an incorrect skill root. They exited nonzero without changing data. A ledger inspection assumed a `sources` key; the actual schema uses `reports`, which was inspected successfully. The canonical postmortem helper also rejected the documented `--compact` option; its search without that flag succeeded.

## Evidence and lookup

Query: `file discovery missing skill path`. Finding `ext-optional-path-discovery` applies: inspect actual inventory rather than assume inherited paths. The skill catalog supplied the correct 21st skill root; the observed fixture is `tests/fake-twitch.ts`. The Chrome axi bridge also timed out after 30 seconds without listing pages; use the existing Playwright browser fixture for runtime checks. A sandboxed browser-suite attempt could not bind its preview server; the same suite passed with loopback permission (22/22). The new geometry regression initially assumed a 1px tile border; the current shared stylesheet uses border 0 and an outline. Corrected its bottom-edge assertion to allow 0–1px border instead of requiring 1px. No product failure occurred. Deliberate layout-test RED is excluded.

## Resolution and status

Resolved discovery using actual source/catalog paths. No new learning beyond existing optional-path discovery guidance; helper option documentation drift remains outside this UI change. Product verification is recorded in `plans/remove-player-footers.md`.

## Follow-up

Canonical ledger review/hash registration records no new learning: existing optional-path discovery and sandbox-loopback guidance covers these tooling failures; AXI readiness was not established. Product behavior is verified separately.
