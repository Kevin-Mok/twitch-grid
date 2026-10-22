# Implementation lessons

Use these local lessons when changing this app. Reproduce a boundary failure first, preserve user intent and stored bytes, and distinguish fixture behavior from the upstream Twitch player.

- Reordering keyed React elements can still move iframe browsing contexts. Keep permanent video hosts under one parent and change geometry only; verify DOM identity and navigation counts.
- ResizeObserver contentRect already excludes padding. Use its dimensions directly; regression checks for reserved grid space must assert row/column geometry, since a one-column stack can also have no horizontal overflow.
- When fitting a scaled video grid, verify visible bounds with getBoundingClientRect and Twitch's internal embed minimums with offsetWidth/offsetHeight. A displayed 300px minimum contradicts fitting multiple rows into short viewports.
- SDK setter calls cross an asynchronous frame boundary. Do not overwrite saved audio targets with pre-acknowledgment samples, or mark a quality applied before its handle exists.
- Sidebar quality labels can omit Twitch's `30` FPS suffix. Prefer an exact available ID, then its equivalent 30fps rendition; otherwise a valid 360p choice silently becomes Auto. Keep explicit 60fps choices and per-stream overrides independent.
- A sent quality command is not an acknowledgement. Send changed targets even if cached state already matches, acknowledge only a later sample, bound pending retries, and stop retrying after acknowledgement so native controls stay usable. Test old saved overrides in the actual UI as well as fresh player contexts.
- Unknown player state is not offline. A valid sample after an observation failure clears the error without inventing ONLINE evidence.
- Importing validated data does not grant permission to overwrite unreadable stored data. Keep the storage write gate until the explicit recovery action.
- Build share URLs from the public payload, origin and pathname. Unrelated page queries may contain private data and must not propagate.
- ONLINE, available qualities and a live thumbnail do not prove playback. Record advancing video separately from human audibility, and keep third-party visibility warnings unresolved until a discriminating check passes.

- Removing a visible status label can break readiness checks in unrelated browser scenarios. Search all tests for the old text and use the retained accessible status indicator without weakening playback/quality assertions.

- Twitch playback stats are cached and start at zero. Label the provider explicitly: an averaged decoded/total-frame rate can conceal uneven frame delivery. Treat reported FPS as a diagnostic with unsupported/stale states; do not infer displayed smoothness, source FPS or a GPU/network bottleneck. Public freshness/ad-state gaps must be resolved before an app quality policy uses the metric.
