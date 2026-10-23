# Architecture and extensions

This guide explains how domain state, permanent player hosts and browser integrations fit together. Follow the ownership boundaries below when adding a control, panel or provider, then run lifecycle checks before changing how tiles mount.

## Ownership

| Module | Owns | Must not own |
| --- | --- | --- |
| `domain.ts` | Typed sessions/profiles, channel normalization, bounded validation, backup merge/replace, public shares | DOM, players, network requests |
| `storage.ts` | Namespaced load/save, explicit migration, storage errors | Silent data erasure, player objects |
| `App.tsx` | Serializable state, typed commands, persistence gate | Iframe construction or visual reparenting |
| `player/manager.ts` | Instance registry, permanent host elements, desired versus observed state, quality resolution | Profile serialization or chat selection |
| `player/twitch.ts` | Official SDK loading, event listeners, read-only sampling, adapter cleanup | Private APIs, tokens, retry loops |
| `player/status.ts` | Supported-event status capability and stale offline presentation | Treating failed observations as offline |
| `layout.ts` | Pure tile rectangles and scroll-canvas dimensions | Player lifetime or playback |
| `components/PlayerSurface.tsx` | Resize observation, CSS placement and React control portals | Reordering the registry’s DOM children |
| `chat.ts`, `ChatPanel.tsx` | Typed chat provider, parent hostnames, one embed and width/selection controls | Cross-origin message reads, audio changes |
| `viewington.ts` | Validated compatibility import of observed profile codes | Reference bundles or settings injection |

## Player lifetime invariant

Each normalized channel has one registry entry containing an article, video host and header. The manager appends it to one permanent surface exactly once. React renders its header controls and tile message overlays using portals. Reorder, resize, focus and panel changes update only tile transforms and dimensions. The surface stays at the same place in the React tree.

Reconciliation is by normalized login. New channels create entries; removed channels dispose listeners/timers and their iframe. An overlapping profile keeps its retained entries. Explicit reload intentionally creates a new entry for one channel. Async SDK completion checks whether the entry was removed and cleans up instead of leaking a second player. The manager also has teardown for actual component unmounting.

Do not render players as a CSS grid of reordered React elements. Stable keys alone can still move iframe elements. Do not use portals to move the video iframe between parents. Portals here target only controls around an iframe that stays put.

## Playback, quality and status

`Channel.intent` records the requested playing/paused state. Player events describe observed buffering, playing, paused, blocked and error states. User pause events update the saved intent. Global/per-stream commands change intent explicitly; unrelated UI changes issue no play command. On ONLINE, paused intent is reapplied; playing intent retries Play only while playback remains unconfirmed. Confirmed PLAYING is left alone. The explicit Play all action sends Play to every current channel without filtering on cached SDK state. Twitch getters read a cached _playerState, so sampling synchronously cannot establish a fresh iframe acknowledgement. Play all preserves existing frames and audio/quality preferences.

Event-cause limitation: Twitch does not label native user actions versus delayed/recovery events. A late PLAYING event cannot erase paused intent; the app pauses it again. Resume through the global Play paused control. Native PAUSE before OFFLINE may conservatively retain pause after live return. This policy prioritizes explicit pause over guessing the cause of an upstream event.

The adapter starts muted, with SDK autoplay disabled, then applies saved intent when READY. Browsers may still block programmatic play or unmute; Twitch’s native controls and the app’s Play action offer a user gesture. Available qualities come from each player, supporting both documented strings and observed SDK quality objects. Resolve a per-player override first, otherwise global preference; use `auto` if unsupported, otherwise the first available value. Display fallback feedback over the video; inspect the actual quality in Twitch’s own settings. Do not call quality setters before availability is known.

Audio setters cross an asynchronous frame boundary. Track pending mute/volume targets until sampled values acknowledge them; stale startup samples must not overwrite preferences. Once acknowledged, later native changes can update saved settings. A valid sample after a transient observation error clears the error to unknown, not online. Readiness/quality events may arrive before the factory promise resolves; only record an applied quality when a handle actually receives it.

Supported ONLINE/OFFLINE/PLAYING events are the status source. Quality/audio sampling every two seconds reads the player API; it never calls play/reload. Hidden offline tiles remain mounted at full minimum size off the visible canvas. Browser/Twitch visibility policies can suppress future events. Old offline observations become stale after two minutes; explicit sidebar reload rechecks one player. There is no live roster, viewer count or reliable hidden return-to-live polling without additional supported integration. Future browser OAuth metadata would be a separate optional project.

## Data boundaries

Schema version 2 stores `{version,session,profiles,activeProfileId}`. A session contains channels `{login,muted,volume,quality,intent}`, default quality, hide-offline/sidebar flags, layout, and `{open,channel,width}` chat settings. Profiles are named snapshots, not live aliases. Changes persist to the current workspace; updating a saved profile is explicit.

Imports require exact field types and known schema keys. Bounds include 32 channels/session, 50 profiles, 1 MiB backup size, valid logins, unique IDs/logins and sane volume/chat widths. Future schemas and malformed data activate a write gate; the original storage remains untouched. The user can export it before explicitly saving or restoring. Merge validates both sides, preserves the active workspace and repairs imported ID collisions.

Shares use a separate version-1 public payload (ordered login list, default quality, layout). Decode into safe muted defaults and ask the user to Apply. Saved profiles are unaffected. A code/fragment is not trusted merely because it came from this app. JSON backup and Viewington-code import are separate formats.

## Layout rules

The inspected reference tests column counts and maximizes a centered 16:9 tile size, with a centered incomplete last row. This implementation uses a logical 8px gap and 36px header chrome. `calculateLayout` preserves Twitch’s internal 400×300 video viewport minimum; the native player may letterbox video. Auto layout chooses the largest fit, or the shortest logical canvas when minimums cannot fit. PlayerSurface uniformly fits logical tiles with CSS zoom and translation-only transforms, including manual columns and focus mode, so all rows fit without scrolling. Transform downscaling makes Chromium trackVisibility report otherwise visible embeds as invisible, blocking Twitch API Play/autoplay; zoom retains visibility while preserving the internal minimum. Translation coordinates are divided by zoom so displayed positions remain unchanged. Player fullscreen resets zoom to 1. Headers scale with the video, so dense lineups have smaller controls. Permanent hosts remain mounted; clipping the fixed-size surface prevents unscaled boxes or parked hosts from creating scrollbars. Focus and player fullscreen lay out only the selected channel, parking every other host offscreen with inert and aria-hidden applied. A fullscreenchange listener also recognizes a fullscreen iframe through its containing tile. Workspace fullscreen alone has no selected channel. The manager receives a transient priority login: selected uses chunked (Source), or the highest numeric video rendition then Auto; background uses the lowest numeric video rendition then Auto, then Source if Auto is absent; if no video/Auto/Source choice exists, issue no request rather than selecting Audio only. Numeric renditions sort by resolution then frame rate. The existing bounded request/acknowledgement path applies these preferences and restores saved channel/global quality on exit. Stored settings, playback intent and audio are unchanged. A focused offline channel remains visible so the viewer can inspect or reload it.

## Adding a control, panel or provider

1. Define serializable preferences in `domain.ts` only if they should survive reload. Update schema validation and migrations deliberately.
2. For playback, add a narrow adapter operation and manager command. Test that unrelated channels receive no command.
3. For a panel, compose a sibling of `PlayerSurface`; never conditionally remove or move the surface. Keep input shortcuts out of editable controls.
4. A replacement player factory implements `PlayerFactory` and returns a handle with disposal and event emission. A replacement status/chat provider must state its capabilities and limitations.
5. Add a behavior test, then browser assertions for iframe identity and navigation. Run static serving and real-provider smoke checks before claiming integration works.

Rollback is local: export data before schema work, keep old storage keys until migration is verified, and revert the affected module plus its matching documentation. Production hosts need only `dist` assets.


## FPS estimates

The optional Twitch getPlaybackStats().fps field feeds the existing two-second poll. Accept finite positive values in a visible, unpaused player. First valid reading is immediate; average up to five readings at least one second apart, expiring history at ten seconds. A conservative six-second cache guard refreshes on stats object replacement or FPS change; Twitch provides no public sample timestamp. Invalid/hidden/paused observations, lifecycle events, quality changes and status errors reset averaging. Manager gates numeric FPS on ONLINE + PLAYING and clears it on transitions. The header shows a numeric FPS estimate, with Twitch identified in its tooltip and accessible label; it never claims presented smoothness. No persisted data or quality policy changes.

## Playback bitrate diagnostics

The Twitch adapter reads the documented optional `getPlaybackStats().playbackRate` (Kbps) inside its existing two-second sampling loop. It accepts finite positive values in a visible document; missing, zero, malformed or throwing stats yield `null` without suppressing quality/audio status. The cached SDK object's replacement or bitrate-value change refreshes a conservative six-second unchanged-snapshot expiry. This is not a public timestamp guarantee. No per-frame work, extra timers, cross-origin DOM access or new network calls are introduced; existing destroy cleanup removes subscriptions and polling.

The manager exposes `bitrateKbps` only for ONLINE + PLAYING and clears it on lifecycle events. `PlayerSurface` renders each tile's value in decimal MB/s (Kbps / 8000) and passes a transient channel-to-bitrate record to App/Sidebar. Sidebar filters it to the current lineup, sums reporting values, and labels the reporting fraction and partial totals. Unknown/paused readings are omitted without claiming zero traffic. App renders a compact value-only total from the current lineup at the bottom-right of a stable `.video-region` flex wrapper, immediately before chat. The readout sits outside the scrolling viewport, so resizing/opening chat moves the video corner without moving/remounting players. It is independent of sidebar visibility, prefixes its value with `↓`, and keeps partial coverage/reporting counts in its accessible description. The readout uses pointer-events:none so it cannot intercept player controls. These values are not persisted, and do not feed quality selection.

The UI calls the metric playback bitrate, not network download speed. It does not measure HTTP transfer bursts, buffering traffic, transport overhead, other applications or the user's internet capacity. Provider FPS cannot establish smooth visual frame pacing; the separately committed FPS estimate remains unchanged. No FPS-based adaptive-quality loop or FPS guarantee exists; the temporary focus/fullscreen quality policy is independent of these diagnostics and leaves saved preferences unchanged.


Rollback removes only diagnostics sample/snapshot/props/UI/tests/docs. Preserve unrelated layout, native-playback and chat changes. A true download-speed or presented-FPS feature requires additional supported evidence rather than relabeling these values.
