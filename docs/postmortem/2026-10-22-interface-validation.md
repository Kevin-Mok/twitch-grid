# Initial interface validation failures

This living report tracks integration findings during the first complete browser build and their regression evidence.

## Accessible control names

- Symptom: static-browser suite passed 3/5; tests could not find exact “Show all streams” and “Play paused” buttons after the expected interactions.
- Impact: accessible control names included decorative glyphs, making announced names and exact accessible selectors inconsistent with the plain labels.
- Evidence: `tests/watch.spec.ts` lines 25 and 39; Playwright error contexts show the rendered UI rather than a page crash. Unit tests 122/122, typecheck and build had passed.
- Lookup: canonical memory searched for `accessible button label icon Playwright`. No prior remedy substitutes for inspecting the actual accessibility snapshot.
- Resolution: snapshots confirmed glyph-prefixed accessible names; explicit plain aria-labels added to decorative icon/text controls. Lifecycle assertions unchanged.
- Verification: next integrated run passed both original failures and 16/17 browser scenarios. The remaining new scenario expected “invalid” but the warning used “not valid”; its warning assertion now targets the actual actionable storage message and retains the byte-preservation assertion.

## Transfer test type narrowing

- Symptom: TypeScript TS2339 at `src/components/TransferPanel.test.ts:146` for `.mock` on a function-or-Vitest-mock union.
- Cause: test props allow callback overrides, widening the inferred type.
- Resolution: use `vi.mocked(props.restore)` at the test assertion. Production behavior unchanged.
- Lookup: tests agent searched canonical memory for TS2339/Vitest union; no applicable finding.
- Verification: subsequent integrated typecheck, build and 122 unit tests passed.

Canonical memory registration is owned by the root agent; targeted check results are recorded in `docs/validation.md` after this report is finalized.

## Independent review regressions

- Delayed PLAYING after explicit pause could rewrite saved intent. Added a defining regression before changing event handling.
- Startup audio samples can precede postMessage setter acknowledgements and overwrite saved preferences. Added a regression with stale samples followed by acknowledgment and a native-mute fixture change.
- App restore unconditionally released the storage write gate, allowing a merge import to replace unreadable original storage without explicit permission. Added a browser regression importing a verified Viewington code over corrupt storage.

All three reproduced as intentional RED: wrong paused intent, unexpected audio patch, and replacement of `{broken-json` by imported JSON. Additional READY-before-handle quality and error→valid-sample recovery tests also failed. Fixes preserve paused intent until explicit app Play, wait for audio acknowledgments, delay applied-quality bookkeeping until a handle exists, clear observation errors to unknown, and retain the storage write gate across imports. Final regression verification passed: 128 unit/integration tests, 18 browser tests, typecheck and production build, with exit statuses in `docs/evidence/validation-automated.log`.

Real SDK inspection independently observed saved default volume 1 changed to the SDK's early 0.5 sample before this fix, and a preview player remaining paused after initial programmatic play. The tile now displays the sampled paused state while retaining playing intent and offers an explicit Play gesture.

Browser tooling note: one manual click used an outdated chrome-devtools-axi generation reference and returned STALE_REF before acting. Refresh the snapshot and use the current reference; no application state changed.

A later read-only visibility probe had an extra parenthesis and was rejected before execution. Splitting the nested expression into a named result corrects script transport; it provides no product evidence by itself.

## Share URL privacy review

- Symptom: final evidence review found generated watch links copied the current page's unrelated query parameters.
- Impact: a URL opened with private parameters could include those values in a subsequently shared link; the watch payload itself already excluded private preferences.
- Evidence: `TransferPanel.tsx` concatenated `location.search`; no app feature consumes query parameters.
- Resolution: synthetic private query regression failed as expected, then generated URLs were changed to omit `location.search`. Final 128 unit/integration and 18 browser tests passed. No real private values were used or shared.
- Lookup: canonical `share link query parameters privacy` returned unrelated privacy-gate and metadata guidance; no existing URL-share remedy was established. The source concatenation and failing assertion provided direct evidence.

## Real Twitch playback investigation

- Symptom: the real ESLCS embed reports ONLINE and available qualities, yet remains on the Play preview after app and native Play gestures. Console reports Twitch autoplay disabled for “style visibility”.
- Evidence: a 1148×646 iframe at 1440×913; ancestors have opacity 1, visible visibility and no filters; browser IntersectionObserver v2 reports ratio 1 and isVisible true. After app Play, intended state stays playing and only public UPDATE_STATE messages arrive for 12 seconds, with no PLAY, PLAYING or PAUSE. Official chat loads its welcome and compose controls.
- Lookup: docs review found no documented exact visibility algorithm. Twitch's official embed policy prohibits obscuration and defines minimum sizes. The public support thread `https://discuss.dev.twitch.com/t/embed-api-autoplay-disabled/64205` reports the same warning without a definitive cause. These are hypotheses, not an established remedy.
- Control result: a bare official SDK player at 1000×600, without app layout or initialization setters, emitted READY/ONLINE but no PLAYING. After native Play, currentTime was 1.512999 and unchanged five seconds later, fps 0 and bufferSize 0. This reproduces incomplete startup outside the app; the precise underlying cause remains unresolved.
- Status/next step: real moving video and human audio remain unverified. Retest in a normal visible desktop browser and compare before changing app behavior; do not infer successful playback from ONLINE or mock tests. SDK events cannot distinguish all native user pauses from recovery pauses; the conservative intent limitation remains documented.
- Visibility-probe boundary: switching AXI's selected tab did not generate document visibility events in this headless run. The iframe remained identical/connected, but no true background-tab behavior is claimed.
- Tool transport: a nested diagnostic expression and one orchestration cell were rejected for syntax before execution; corrected probes ran. The docs agent's direct SDK download failed DNS, consistent with the recorded sandbox network restriction; no failed download was used as evidence.
