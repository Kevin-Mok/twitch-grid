# Watching workspace smoke checks

Use these checks against a static production build to verify actual viewing behavior. Start the preview server, choose channels that are live at the time, then check player lifetime, local data and chat. Deterministic automated results are recorded separately in [validation](validation.md).

## Real Twitch playback and lifecycle

- Action: Build with `npm run build`, serve with `npm run preview`, and open the printed URL in desktop Chrome/Chromium. Add one currently live channel and use Twitch’s built-in Play/Unmute controls if needed.
  Expected: The official player loads. Record visible moving video and audible output separately. Autoplay-blocked, content restriction, network and sign-in failures remain explicit limitations rather than claimed success.
- Action: Add five distinct currently live channels. Record viewport, browser, hardware, quality preference and sampled actual qualities. In DevTools retain references to each `.video-host iframe` and observe frame navigation; reorder repeatedly, resize, toggle sidebar/chat, select different chats and change layout/focus.
  Expected: Retained video iframes stay connected under the same parent; no app-created replacement or reload occurs. Smoothness and upstream navigation are observations, not guarantees. Avoid screenshots of private chat/account state.
- Action: Pause one stream manually. Change layout and chat. In a controlled fixture, emit OFFLINE then ONLINE for that channel; in a real channel wait for an actual transition if feasible.
  Expected: Paused intent remains paused. “Play all paused streams” resumes it only on request. A simulated transition proves application handling, not Twitch’s real event delivery.
- Action: Use Twitch’s built-in controls to unmute one video and adjust its volume/quality. Change layout and chat, then reload the page.
  Expected: Other streams retain sound choices and the changed audio settings persist. No extra controls or empty footer space appear below any video; native controls remain reachable. No chat or focus action unmutes another stream.
- Action: Switch to another browser tab for at least a minute, then return. Repeat with a background window if useful.
  Expected: The app performs no visibility-triggered reload or force-play. Record any browser/Twitch suspension; actual audio continuity needs human observation.

## Layout, keyboard and chat

- Action: Open the app in a fresh browser tab, then open `/favicon.svg` on the same origin.
  Expected: The tab icon and SVG retain a purple-and-white 2×2 logo. Normal viewing has no app header logo or title row.
- Action: Check 1, 2, 3, 5 and 8 players at 1440×900 and 1280×800. Also inspect controls at widths 390 and 768. Try 1–4 columns and focus one stream.
  Expected: Video viewports remain at least 400×300; the canvas scrolls when needed. Rows are centered and do not overlap; ordinary app controls remain reachable. Desktop is the primary target.
- Action: Press Ctrl+B while editing the channel input, then focus the sidebar toggle button and press it again.
  Expected: Text editing does not toggle the sidebar. Outside editable controls the shortcut toggles it.
- Action: Open chat for A, switch to B using the header dropdown with mouse and keyboard, drag the divider, use its left/right arrow keys, collapse/reopen, then remove the selected channel.
  Expected: One dropdown stays in the header before and after frame load, with no extra selector row. One chat embed follows the selected channel; width persists. Video hosts and audio remain unchanged. Removed channels resolve to another present channel or the empty state.
- Action: Try Twitch chat login in your usual privacy configuration.
  Expected: The compact header dropdown stays available; login help closes on frame load. Chat help reopens/minimizes the cookie guidance and external “Open chat on Twitch” fallback without reloading chat. Switching channels closes help when the new frame loads. Frame load is not proof of login or messaging success: test normal Twitch interaction separately where the browser allows it. The app does not read messages or access the chat DOM.
- Action: At widths 390, 768, 1280 and 1440, open two streams and chat, then choose Maximize video. Restore with Restore workspace and repeat using Escape while an app control has focus.
  Expected: The header, toolbar and bottom status strip are absent by default, and the workspace fills the browser height. Maximize video hides the sidebar; Restore workspace returns it. Chat and player controls stay available, and the restore button remains reachable. Restoring returns the original sidebar preference. Existing video and chat frames stay connected with unchanged audio. Escape inside Twitch’s own iframe may be handled by Twitch; Restore workspace still works. Minimum player size, aspect ratio and scrolling remain unchanged.

## Data and recovery

- Action: Save profiles with overlapping lists, adjust order/audio/quality and click Update selected profile. Load each profile and restart/reload the browser.
  Expected: Correct settings/order restore. Shared channels preserve their current iframe when switching profiles. Browser restart necessarily creates new players and may require permission to play.
- Action: Download JSON backup. Restore using Merge, then use Replace after confirmation. Import one of the synthetic [Viewington fixture codes](evidence/viewington-profile-fixtures.json).
  Expected: Merge adds profiles and preserves the active workspace. Replace restores all imported data. Compatibility codes become validated profiles, never executable settings.
- Action: Open the app with a synthetic unrelated query such as `?token=private-example`, open Share, copy a link and visit it in a fresh tab. Apply the offered setup. Try an invalid or oversized fragment and a malformed JSON file.
  Expected: The generated URL omits the synthetic query. Applying changes the current watch setup without deleting saved profiles. Invalid input leaves existing data unchanged and shows a useful error. Private audio/chat/profile data is absent from share payloads. Never use a real token for this check.
- Action: In a disposable browser profile, block storage or put malformed/future-version data at `twitch-multiplayer:v2`, then reload.
  Expected: A storage warning appears; original data remains untouched. In-memory viewing still works. Download original data before explicitly enabling saving or replacing it.
- Action: Hide a known offline channel, wait two minutes and use its sidebar reload control. Make it online in a controlled test.
  Expected: Only that explicit reload replaces a player; other streams are unchanged. Offline observers remain mounted and stale status is explicit. Return-online events restore the tile’s original list position. Real hidden return-to-live remains best effort.

## Static hosting and development

- Action: Keep port 5173 occupied with a server you own, then run `npm run dev`.
  Expected: Vite preserves the first listener, selects another port and prints that URL.
- Action: Serve only `dist` on a static host at a different hostname. Open a valid share fragment directly.
  Expected: App assets load without an app backend, secret or dev proxy. Each embed uses the current hostname; ancestor hosts require public `VITE_TWITCH_PARENTS` configuration. The new origin has separate local data.

- Action: Open sidebar Settings at desktop and phone widths. Use Share and Backup & import, change Layout, toggle Chat, then close and reopen the sidebar with its menu button or Ctrl+B.
  Expected: Both transfer dialogs open and close normally, workspace controls remain reachable, and video/chat embeds stay mounted. Storage failures still show an actionable warning.
