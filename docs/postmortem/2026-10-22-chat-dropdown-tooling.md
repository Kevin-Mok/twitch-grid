# Chat dropdown tooling limitations

The UI task can proceed with local source context and tests. Optional context loading and several assumed documentation paths were unavailable.

## Evidence and status

- AGENTS.md, .agent/PLANS.md and vitest.config.ts are absent in this checkout; supplied instructions and vite.config.ts provide the relevant context.
- Initial Impeccable path under ~/.agents was absent; the catalog path under ~/.codex/skills was read successfully.
- Impeccable context exited 127: engine 0.1.14 is absent and its default cache is outside writable roots. Use existing component/CSS as visual authority; no install is needed.
- Postmortem lookup rejected --compact; local helper help confirms this version accepts only a query and --knowledge. Retry using its actual interface.

## Lookup and applicability

Query: `impeccable engine unavailable missing file discovery`. Missing files and optional engine availability do not affect application behavior. No product workaround is needed. Canonical learning updates outside the workspace remain outstanding; do not edit installed skill copies.

- Chrome AXI pages exited 1 with BRIDGE_NOT_READY after its startup deadline. Use screenshots from the existing Playwright suite for visual review; no retry or bridge installation needed.

- Browser runner could not bind 4173 inside the sandbox (EPERM); approved retry found an existing listener. Preserve it and run the same suite with a temporary configuration on port 4277.

## Resolution and verification

Continue with the existing React/native-select pattern. Record application test results in plans/chat-header-dropdown.md. These failures concern tooling only, not Twitch playback or login.

Final result: all 131 unit tests, production build and 22 browser tests passed. Browser verification succeeded using a temporary config on port 4277; desktop/mobile screenshots reviewed. No existing listener or project configuration changed. External canonical learning registration remains outstanding.
