# Focus leaves background streams visible

The supplied screenshot shows an enlarged stream with other tiles still beneath it. Trace focus layout and quality ownership, add a failing regression, then verify single-stream viewing and temporary quality priority.

- Symptom/impact: focus still shows other streams and competes with their unchanged quality settings.
- Evidence: PlayerSurface passes all visible channels to calculateLayout; its focused branch lays out the remaining tiles below. PlayerManager.sync receives no focus/fullscreen signal.
- Status: resolved in code and controlled browser runtime; sustained real-provider playback remains unverified.
- Memory: `fullscreen focus quality background streams` matched ext-twitch-quality-acknowledgement and ext-twitch-resolution-quality-ids. Their retry and rendition-ID handling applies and will be reused; neither establishes a fullscreen remedy.
- Discovery: optional checkout AGENTS.md and .agent/PLANS.md were absent; quality.ts was absent because chooseQuality lives in manager.ts. Reads were non-mutating; use the located sources and this plan.
- Resolution: selected-only layout, fullscreenchange tracking, transient manager priority and safe video-only quality fallback. Reuse existing retry/acknowledgement rather than persisting temporary quality or recreating players.
- Intentional RED: manager priority regression expected quality requests but got none; browser focus expected one visible tile but received three.
- Verification environment: initial Playwright preview startup failed. Debug logs showed sandbox `connect EPERM 127.0.0.1:4173`; that port already served HTTP 200. Preserved its listener and used an approved loopback run with a temporary alternate-port config on 4174. It reached the expected browser RED. No repository dev-server configuration changed.
- Browser inspection tooling: `chrome-devtools-axi snapshot` returned `BRIDGE_NOT_READY` (bridge not started within 30s). No product diagnosis follows from that failure; use the working controlled Playwright session for visual checks. No bridge retry or system/browser configuration changes are needed.
- Capture harness: a temporary screenshot config with testDir set to all `/tmp` failed on `EACCES` traversing `/tmp/snap-private-tmp`. An isolated `/tmp/twitch-grid-capture` test directory passed desktop/mobile capture without modifying product code.
- Review: first full check passed 152 unit and 40 browser cases plus build. Independent review found that the generic fallback could select Audio only if Auto and numeric video renditions were absent. Add a defining no-Auto regression before choosing Source as safe fallback or skipping an unavailable video request.

- Final evidence: manager/browser defining regressions and no-Auto regression observed RED before fixes; final 152 unit tests, TypeScript/Vite build and all 40 browser tests passed after the last product edit. Independent reviewer found no remaining issues. Desktop/mobile Source screenshots were visually reviewed.
- Follow-up: manually verify real Twitch quality menus, sustained motion and audible output; controlled SDK tests cannot establish bandwidth savings or provider visibility policy. No dependencies, configuration, commit or deployment changes. Canonical memory decision: no new general upstream remedy; existing available-ID/acknowledgement and environment guidance applies, with the task-specific fallback lesson recorded in tasks/lessons.md.
