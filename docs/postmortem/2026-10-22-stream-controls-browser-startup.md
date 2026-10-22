# Stream controls browser check startup

The focused browser regression could not start its static preview server. Diagnose the test environment before treating the result as a failure of the new UI.

## Symptom and impact

The baseline `npm run build` passed (exit 0). `npm run test:browser -- --grep 'sidebar stream controls'` exited 1 with `Process from config.webServer was not able to start. Exit code: 1`. No browser test ran, so the intended missing-controls RED result has not yet been observed. Application source is still unchanged.

## Lookup and evidence

Query: `listen EPERM browser webServer sandbox`. Returned browser sandbox guidance concerns Chrome launch and asynchronous SDK state rather than a confirmed preview-server cause. The generic Playwright error alone does not establish a port collision or denied bind. Inspect server startup output and the existing interface-validation report before a retry.

## Resolution and verification

The tests agent read the canonical skill and found `ext-sandbox-loopback` with query `webServer failed to start Vite preview EADDRINUSE`. Direct preview startup confirmed `listen EPERM: operation not permitted 127.0.0.1:4173`, exit 1. This establishes a denied bind rather than a port collision.

With approved loopback escalation, the same focused browser command started the server and executed one test. It reached the intended RED: the Stream Controls region and Play all paused streams button were missing. No listener was stopped, and no app or test-server configuration changed. Status: verified environment workaround; restricted loopback remains unchanged.

## Learning

No new reusable finding: `ext-sandbox-loopback` already describes the restriction and permission workaround. Register this report's current hash and alias in canonical memory. A running test server proves neither new UI correctness nor real Twitch playback; product verification remains in `plans/stream-controls.md`.

## Browser reference refresh

A visual-inspection fill used generation 1 after resizing advanced the browser snapshot to generation 2. AXI rejected it with `STALE_REF` before changing the page. The existing interface-validation report documents this same reference-lifetime rule. Refresh the snapshot after viewport changes and use its current input reference; no product change or new reusable finding is needed.
