# Simultaneous playback stops one stream

This report records the desktop playback failure reported after the initial implementation. Preserve the failing behavior as an open issue while publishing the current source; reproduce the real event sequence before attempting a fix.

- Symptom: with `coachboop` and `mrsavage` loaded, only `mrsavage` keeps playing. Starting `coachboop` briefly plays it and then immediately stops it.
- Impact: the core simultaneous watching workflow is not yet accepted, despite deterministic fixture tests passing.
- Evidence: user report and supplied desktop screenshot on 2026-10-22. The screenshot shows the first stream paused and the second active with an audio-preference-pending message. The screenshot includes unrelated personal browser surfaces and is intentionally excluded from public artifacts.
- Lookup: canonical query `Twitch simultaneous playback pause audio initialization` matched `ext-browser-sdk-acknowledgements` and `ext-twitch-playback-evidence`. Their limitations apply: early SDK samples and unlabeled native events require careful tracing, and mocked success is not real playback evidence. Neither finding establishes a fix for this report.
- Investigation: read-only caller review found no explicit cross-channel pause command. Tile Play targets one channel; Pause all is a separate command. The fake SDK immediately emits successful play/playing and does not model the observed failure. Current official Twitch docs do not establish cross-instance coordination behavior.
- Hypotheses: asynchronous startup/pause adoption, SDK audio acknowledgement, or browser/provider policy. None is confirmed. An audio-preference-pending label alone does not prove a shared playback lock.
- Status: unresolved; no application fix was made. The user subsequently requested naming and public repository publication.
- Next steps: reproduce with both currently live channels in an isolated visible browser; record per-channel READY/PLAY/PLAYING/PAUSE/PLAYBACK_BLOCKED and sampled paused/muted/volume before and after each gesture. Add a defining failing regression for the observed sequence, then implement and verify two players advancing simultaneously without repeated force-play.
- Tool limits: the native title endpoint was unavailable; source Git metadata is still unusable. One optional skill read used a missing installed path before reading its catalogued location; no implementation files changed. These tool conditions do not diagnose the playback failure.
- Learning review: unresolved evidence only; record the current hash and applicability in canonical postmortem memory during delivery. No verified playback fix is claimed.
