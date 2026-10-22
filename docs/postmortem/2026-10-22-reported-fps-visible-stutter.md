# Reported FPS does not match visible smoothness

Investigate the user's report that four Twitch streams appear closer to 15 FPS while the app reports roughly 45–60 FPS. Correct misleading diagnostic wording and separate the counter's meaning from the unresolved playback problem.

## Symptom, impact and current status

The supplied screenshot shows Stream A 44, Stream C 42, Stream B 44 and Stream D 43 FPS. The user reports substantially worse visible smoothness. A static screenshot cannot establish actual presented FPS or a bottleneck. Status: playback degradation unresolved; numeric diagnostic meaning is confirmed to be narrower than the plain “FPS” label suggests.

## Lookup and evidence

Canonical lookup `Twitch FPS decoded dropped frames misleading stutter` matched unresolved `ext-twitch-playback-evidence`; earlier SDK event fixes do not establish a remedy. Official Twitch Embed API documents playback fps and dropped-frame count, but not presented frames or frame pacing: https://dev.twitch.tv/docs/embed/video-and-clips/ . Current sampled SDK frame-rate tracking uses decoded-frame count deltas over approximately four seconds in the inspected player-core build. It does not establish smooth presentation. There is insufficient evidence to subtract dropped frames from reported FPS and claim an accurate visual FPS.

## Immediate plan

- Observe a failing browser expectation for an explicitly “Twitch” labeled reading; correct the visible label and accessible explanation without changing quality or claiming a lag fix.
- Ask whether pausing three streams makes the remaining stream smooth; compare one stream against four before assigning a CPU/GPU/network cause.
- Keep Twitch Auto and all saved manual preferences unchanged. Do not invent a displayed-frame metric from parent requestAnimationFrame or quality labels.
- Run the focused browser check, typecheck and build; record outcomes and remaining runtime limits.

## Cause, resolution and limits

Confirmed diagnostic issue: a plain numeric FPS label invites interpretation as visible smoothness. The UI needs to name the provider metric directly. The actual cause of stuttering remains unknown. The normal desktop browser is not attached to this session; an isolated automated probe cannot establish the user's display/GPU behavior. No claim that 45 reported FPS means 45 evenly presented frames.

RED evidence: the focused browser test expected `Twitch 30.0 FPS` but observed `30.0 FPS`; the expected assertion failed before the UI change. The visible provider prefix and screen-smoothness caveat are now implemented; verification pending.


## User correction and follow-up scope

The user reports the renamed 63–64 FPS labels still look like 15 FPS. Prefixing the provider did not make the reading useful for visible smoothness. They confirm one stream is smooth and request download speed for all streams. Retire the visible numeric FPS counter; show displayed FPS as unavailable, and implement the independently documented playback bitrate field with a per-stream and combined display. Label it bitrate, never actual network download speed. A single smooth stream supports investigating combined workload; it does not alone distinguish CPU/GPU/network. Scope and verification move to `plans/stream-bitrate-diagnostics.md`.

The interim prefix-only fix passed fresh typecheck/build and focused browser test (1/1); that proves wording, not a lag fix. Final bitrates verification and learning registration follow before handoff.


## Final diagnostic correction and remaining issue

The visible numeric FPS counter is removed; `FPS —` explicitly means displayed FPS is unavailable. The supported bandwidth diagnostic now reads Twitch playbackRate in Kbps and labels per-stream/combined decimal Mbps as playback bitrate, never actual download speed. Adapter/manager/browser defining RED failures were observed before implementation. Fresh 136 unit tests, typecheck and build passed; the bitrate browser case passed, including partial coverage, pause/removal/unavailable states, header containment and non-persistence. A live built-app probe reported 3.11 +3.14 =6.25 Mbps for two simultaneously advancing videos. Pausing both made the total unavailable and retained both iframes. Successful real resume was not observed in the bounded follow-up.

Resolution scope: misleading metric presentation corrected and bitrate request implemented. Original multi-stream stutter remains unresolved. The user says one stream is smooth, which supports investigating combined workload but does not isolate GPU/CPU/network. No app automatic quality policy, hidden speed test or manufactured presented-FPS estimate was added. Detailed final regression evidence is maintained in the bitrate plan and validation document.

## Current delivery state

The earlier retirement and Mbps descriptions above record interim phases. Final bandwidth displays use decimal MB/s (Kbps /8000), with a compact `↓` total beside chat. A separate user-approved task subsequently restored a clearly labeled Twitch FPS estimate in commit `c7e00dc`; this bandwidth commit preserves that accepted prerequisite. Neither the provider estimate nor playback bitrate measures presented-frame smoothness, and the original multi-stream stutter remains unresolved. Current checks and delivery scope are in the bitrate plan.
