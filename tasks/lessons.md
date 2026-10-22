# Implementation lessons

Use these local lessons when changing this app. Reproduce a boundary failure first, preserve user intent and stored bytes, and distinguish fixture behavior from the upstream Twitch player.

- Reordering keyed React elements can still move iframe browsing contexts. Keep permanent video hosts under one parent and change geometry only; verify DOM identity and navigation counts.
- ResizeObserver contentRect already excludes padding. Use its dimensions directly; regression checks for reserved grid space must assert row/column geometry, since a one-column stack can also have no horizontal overflow.
- SDK setter calls cross an asynchronous frame boundary. Do not overwrite saved audio targets with pre-acknowledgment samples, or mark a quality applied before its handle exists.
- Unknown player state is not offline. A valid sample after an observation failure clears the error without inventing ONLINE evidence.
- Importing validated data does not grant permission to overwrite unreadable stored data. Keep the storage write gate until the explicit recovery action.
- Build share URLs from the public payload, origin and pathname. Unrelated page queries may contain private data and must not propagate.
- ONLINE, available qualities and a live thumbnail do not prove playback. Record advancing video separately from human audibility, and keep third-party visibility warnings unresolved until a discriminating check passes.
