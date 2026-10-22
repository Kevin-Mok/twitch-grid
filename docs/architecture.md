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

`Channel.intent` records the requested playing/paused state. Player events describe observed buffering, playing, paused, blocked and error states. User pause events update the saved intent. Global/per-stream commands change intent explicitly; unrelated UI changes issue no play command. OFFLINE/ONLINE do not force playback; paused intent is reapplied when a channel reports ONLINE.

Event-cause limitation: Twitch does not label native user actions versus delayed/recovery events. A late PLAYING event cannot erase paused intent; the app pauses it again. Resume through the global Play paused control. Native PAUSE before OFFLINE may conservatively retain pause after live return. This policy prioritizes explicit pause over guessing the cause of an upstream event.

The adapter starts muted, with SDK autoplay disabled, then applies saved intent when READY. Browsers may still block programmatic play or unmute; Twitch’s native controls and the app’s Play action offer a user gesture. Available qualities come from each player, supporting both documented strings and observed SDK quality objects. Resolve a per-player override first, otherwise global preference; use `auto` if unsupported, otherwise the first available value. Display fallback feedback over the video; inspect the actual quality in Twitch’s own settings. Do not call quality setters before availability is known.

Audio setters cross an asynchronous frame boundary. Track pending mute/volume targets until sampled values acknowledge them; stale startup samples must not overwrite preferences. Once acknowledged, later native changes can update saved settings. A valid sample after a transient observation error clears the error to unknown, not online. Readiness/quality events may arrive before the factory promise resolves; only record an applied quality when a handle actually receives it.

Supported ONLINE/OFFLINE/PLAYING events are the status source. Quality/audio sampling every two seconds reads the player API; it never calls play/reload. Hidden offline tiles remain mounted at full minimum size off the visible canvas. Browser/Twitch visibility policies can suppress future events. Old offline observations become stale after two minutes; explicit sidebar reload rechecks one player. There is no live roster, viewer count or reliable hidden return-to-live polling without additional supported integration. Future browser OAuth metadata would be a separate optional project.

## Data boundaries

Schema version 2 stores `{version,session,profiles,activeProfileId}`. A session contains channels `{login,muted,volume,quality,intent}`, default quality, hide-offline/sidebar flags, layout, and `{open,channel,width}` chat settings. Profiles are named snapshots, not live aliases. Changes persist to the current workspace; updating a saved profile is explicit.

Imports require exact field types and known schema keys. Bounds include 32 channels/session, 50 profiles, 1 MiB backup size, valid logins, unique IDs/logins and sane volume/chat widths. Future schemas and malformed data activate a write gate; the original storage remains untouched. The user can export it before explicitly saving or restoring. Merge validates both sides, preserves the active workspace and repairs imported ID collisions.

Shares use a separate version-1 public payload (ordered login list, default quality, layout). Decode into safe muted defaults and ask the user to Apply. Saved profiles are unaffected. A code/fragment is not trusted merely because it came from this app. JSON backup and Viewington-code import are separate formats.

## Layout rules

The inspected reference tests column counts and maximizes a centered 16:9 tile size, with a centered incomplete last row. This implementation uses an 8px gap and 36px header chrome. It honors Twitch’s minimum 400×300 video viewport; at narrow widths the native player may letterbox video. Auto layout chooses the largest fit, or the smallest vertical scroll canvas when none fits. Manual columns may require horizontal scrolling. Focus enlarges one tile and leaves other instances alive below it.

## Adding a control, panel or provider

1. Define serializable preferences in `domain.ts` only if they should survive reload. Update schema validation and migrations deliberately.
2. For playback, add a narrow adapter operation and manager command. Test that unrelated channels receive no command.
3. For a panel, compose a sibling of `PlayerSurface`; never conditionally remove or move the surface. Keep input shortcuts out of editable controls.
4. A replacement player factory implements `PlayerFactory` and returns a handle with disposal and event emission. A replacement status/chat provider must state its capabilities and limitations.
5. Add a behavior test, then browser assertions for iframe identity and navigation. Run static serving and real-provider smoke checks before claiming integration works.

Rollback is local: export data before schema work, keep old storage keys until migration is verified, and revert the affected module plus its matching documentation. Production hosts need only `dist` assets.
