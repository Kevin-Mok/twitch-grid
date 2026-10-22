# FPS investigation tooling limits

This report records tooling failures while checking the Twitch FPS boundary, so missing runtime evidence cannot be mistaken for a successful playback check.

## Symptom and impact

The canonical postmortem helper rejected the installed skill's `--compact` option (exit 2). A network-restricted curl probe did not produce `/tmp/twitch-embed-fps.js`; the following file inspection failed. A source inspection also attempted absent `vitest.config.ts`. No application files or live settings were affected.

## Evidence and status

- Repeated memory lookup without `--compact` succeeded. Relevant findings: `ext-twitch-playback-evidence` (unresolved runtime startup), `ext-browser-sdk-acknowledgements`, and `ext-twitch-native-resume-intent` (code fixes only). None establishes the cause of lag or trustworthy presented FPS.
- Current official documentation is reachable with the web tool. It describes `getPlaybackStats().fps` as playback FPS, unavailable on some browsers, without defining source/decoded/presented semantics.
- Canonical knowledge updates require normal workspace approval; the installed helper documentation and source CLI disagree on `--compact`. Use the helper's actual usage output. The final review registration/check is recorded in the task plan.

## Next steps

Use supported browser tools and official sources. Preserve the FPS acceptance gate until metric semantics and live availability can be established. Do not fabricate a frame counter or infer achieved FPS from a quality label.


## Additional tooling evidence

The Chrome bridge's pages/snapshot requests returned `BRIDGE_NOT_READY`; CUA inventory exposed no browsers. A separate isolated installed Chromium probe succeeded after normal loopback/browser permission approval, so live metrics could still be investigated. The public SDK download succeeded after normal network approval. The Impeccable launcher could not install its missing engine in the read-only home cache; its suggested context reference was absent. Existing component/CSS design context and the skill's craft reference were read directly. No settings or cache permissions were changed.

Root causes: stale skill/helper contract for `--compact`, restricted network on the initial curl attempt, absent optional config/reference files, unavailable Chrome bridge and missing design engine outside writable roots. Workarounds: supported helper arguments, approved public SDK fetch, existing Vite config, isolated Chromium and incumbent UI styling. Application behavior was not involved. Real live probe returned PLAYING and 57–60 FPS for both public embeds. No GPU/network bottleneck or user-desktop repair is established.

The initial browser regression run also hit the known sandbox loopback-server restriction; the approved retry passed all 26 browser cases. This is environment evidence, not an app failure. Review added an intentional RED test for in-place FPS updates; that expected test failure is exempt from incident recording.

Learning decision: no new reusable remedy beyond existing environment/tool-contract guidance. These failures were investigation tooling limits, not a playback fix. Register this report in the canonical ledger without changing installed skill copies.

During the later MB/s badge visual check, isolated preview startup again met the same known loopback sandbox restriction. The authorized loopback retry passed; typecheck/build and focused browser1/1 passed, with clean desktop/mobile screenshots. This adds no new remedy or playback claim.

During the screenshot-directed video-corner refinement, the configured preview port4173 was occupied by an unidentified listener. The test agent preserved it and did not count the failed startup as RED evidence. Use a temporary isolated Playwright configuration/port for this task, leaving tracked configuration and other listeners unchanged; record acceptance only after the assertion runs.

The isolated temporary Playwright configuration initially needed webServer.cwd explicitly set to the repository so npm could resolve its script. Only that temporary config was corrected; the defining value-only assertion then ran and failed for the intended Total-prefix mismatch. Production/tracked config and the occupied listener were unchanged.

Final isolated4291 typecheck/build and bitrate+compact-chat cases passed2/2; desktop/mobile screenshots confirmed requested video-corner placement. The occupied4173 listener remained untouched. Only the temporary config/owned preview lifecycle changed; no new general remedy beyond port isolation and explicit runner cwd.

During scoped commit review, the reviewer initially ran Git diff/status inside the plain temporary candidate directory, which intentionally contains no `.git`. Those commands reported “not a git repository” and made no changes. Review continued by comparing candidate files with immutable committed blobs from the source checkout. This is a tooling-context correction; no application failure or new general remedy was found.
