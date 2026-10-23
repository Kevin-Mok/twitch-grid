# Twitch Multiplayer

A static Twitch multistream workspace for viewers who keep several channels open at once. Arrange streams, control their sound independently, switch one chat panel, and save your lineups locally. The implementation concentrates on a difficult browser constraint: changing the layout must preserve each video iframe’s DOM location and lifetime.

This independent rebuild studies [Viewington](https://viewington.com/) without shipping its bundles or using its private services. The compact dark interface prioritizes video. Full parity is not claimed: Windows behavior was inspected statically, and Twitch controls autoplay, live availability and embedded login.

Validation: the isolated channel-status candidate passes 143 unit/integration tests, all 30 browser tests, and builds successfully. Its browser checks cover preserved channel spelling across reload, accessible live status, numeric FPS and retained iframe identity alongside the existing workspace checks. Real sustained moving video, audio and embedded login remain unverified; see [validation evidence and remaining checks](docs/validation.md) and the [channel-status plan](plans/channel-status-format.md).

**Known issue:** a desktop user reported that `mrsavage` keeps playing while starting `coachboop` plays briefly and stops. Simultaneous real playback is unresolved; fixture test success does not establish that this core workflow works. See the [open playback investigation](docs/postmortem/2026-10-22-simultaneous-playback.md).

Fullscreen/focus priority: the isolated commit candidate passes 146 unit tests, the TypeScript/Vite build and all 34 controlled browser tests. Single-stream visibility and temporary quality restoration are covered; real playback and bandwidth savings remain manual checks. See the [fullscreen plan](plans/fullscreen-priority.md).

## Tech Stack and Why Chosen

| Layer | Choice | Reason |
| --- | --- | --- |
| Interface | React + TypeScript | Typed domain boundaries and accessible native controls; React portals render controls around permanent player hosts. |
| Build | Vite | Produces static HTML, JavaScript and CSS in `dist`; no application server or API routes. |
| Players and chat | Official Twitch embeds | Playback needs no app API key; video and chat lifetimes are independent. |
| Local data | Versioned localStorage | Small ordered lists and preferences need neither a database nor an account. |
| Compatibility | lz-string | Imports verified compressed Viewington profile codes alongside raw UTF-8 Base64 codes. |
| Verification | Vitest + Playwright | Domain validation plus real DOM identity and frame-navigation assertions with a controllable Twitch fixture. |

## Explore the implementation

- [Evidence-backed feature matrix](docs/feature-parity.md) and [reference investigation](docs/research.md)
- [Architecture and extension guide](docs/architecture.md)
- [Manual smoke checks](docs/smoke-tests.md) and [validation results](docs/validation.md)
- [Implementation plan](plans/twitch-multiplayer.md) and [continuation prompt](prompts/continue-twitch-multiplayer.md)

The supplied [build prompt](viewington-codex-prompt.txt) is the original scope. Tests cover invalid and oversized imports, storage recovery, layout minimums, quality fallback and instance retention. See validation results for executed checks and remaining real-integration limits.

## Install and run

Use Node 22.12 or newer (Node 22.15 was used for this build) and npm. No sudo, secrets, Twitch account or environment file is required for core viewing. From this directory:

```sh
npm ci
npm run dev
```

The dev server binds to `http://127.0.0.1:5173`. On Linux, `npm run dev` uses `fuser` (from `psmisc`) to force-stop any process using TCP port 5173 before starting Vite. Other ports are left alone. If the port cannot be freed, startup fails instead of selecting another port. The cleanup always targets 5173, even when passing Vite flags. `--host` exposes the server beyond loopback and should be an explicit local choice.

Build and serve the actual static output:

```sh
npm run build
npm run preview
```

Preview prefers `http://127.0.0.1:4173` and also prints its selected port. `npm run inspect` lists the built files and verifies that the HTML’s asset references resolve; `-- --plain` uses ASCII labels and separators. It does not prove real Twitch playback.

## Everyday Usage

1. Add channel names or Twitch URLs. Commas and whitespace separate entries; duplicate channels are deduplicated; re-entering with capitalization updates the displayed spelling. New streams start muted.
2. Use the sidebar arrows to reorder. The desktop sidebar is 200px wide and new chat panels start at 240px. Wider saved chat preferences are capped to reserve two video columns where space permits; widening the window restores the preferred width. Four streams with chat use a 2×2 Auto grid from 1280px at normal browser zoom, including with a capped wide chat preference. The entire video grid scales proportionally to fit one viewport, including headers and gaps, without canvas scrolling. Twitch's internal embed minimums are preserved; controls appear smaller in short windows or large lineups. Choose 1–4 columns or show only one stream with its focus control.
3. Use Twitch’s built-in controls inside each video for play/pause, mute, volume and quality. There is no extra control bar below players. Channel headers keep chat, focus, fullscreen and remove actions; reload individual streams from the sidebar. Saved audio preferences remain supported; changing the sidebar default quality applies it to every current stream.
4. The sidebar’s **Stream Controls** section provides “Play all paused streams”, “Pause all streams”, “Mute all streams” and “Reload all streams”. They act on the full lineup, including channels excluded by the sidebar filter, and are disabled when the lineup is empty. Play also offers a gesture to start blocked playback; pause and mute act independently. Reload recreates every player while preserving saved playback, sound and quality preferences. The top bars and bottom status strip are removed so the workspace uses the full browser height. Open the sidebar to access workspace controls. Selecting or opening chat never unmutes a stream.
5. Open a stream’s chat and use the dropdown in its header to switch channels. Login help automatically closes when the chat frame loads; loading does not prove login or messaging works. **Chat help** reopens or minimizes the cookie guidance and “Open chat on Twitch” fallback. Drag the divider or use its left/right arrows to resize; the arrow in the chat header closes the panel.
6. Use **Maximize video** in sidebar **Settings** to hide the sidebar. **Restore workspace** or Escape brings it back without reloading embeds or changing saved sidebar preferences. Video keeps its proportions and all rows fit the available height.
7. Save named profiles. Load preserves overlapping player instances. “Update selected profile” explicitly saves edits to its lineup/settings; rename and delete are separate controls.

The sidebar uses compact text and spacing, with channel actions beside names so more streams fit vertically. The fitted player grid uses CSS zoom rather than transform downscaling so Chrome continues to recognize on-screen Twitch players as visible for autoplay and API Play.

Default resolution labels such as 360p and 480p match Twitch's corresponding `360p30` and `480p30` rendition IDs. Changing Default quality applies it to every current stream and clears older per-stream overrides; the updated lineup persists locally. Saved profiles keep their settings until explicitly updated. The manager makes up to three attempts to apply a quality request and reapplies after an offline/online recovery. Once acknowledged, native Twitch quality changes remain usable. Unavailable preferences fall back silently; player errors remain visible.

`Ctrl+B` (or `Cmd+B`) toggles the sidebar outside text fields. Escape or Show all streams exits focus mode. Focus and individual-player fullscreen show only the selected stream and temporarily request Source quality (highest available video quality if Source is unavailable); background players remain mounted at their lowest available video quality. Exiting restores saved quality preferences. Playback intent, audio and saved settings stay unchanged; workspace fullscreen alone does not reprioritize streams. Sidebar **Settings** contains Layout, Chat, Maximize video, Fullscreen, Share and Backup & import. The floating menu button reopens a normally closed sidebar; maximized mode has Restore workspace. Individual players also have fullscreen controls. Removing a stream or clearing the lineup offers Undo; clearing and deleting profiles require confirmation.

Use “Play all paused streams” to resume a saved/manual pause. Twitch’s event API does not identify whether an event came from a user or recovery; the app conservatively preserves paused intent even if a late PLAYING event arrives. Native Twitch pause is remembered, but resuming it should use the app control. A PAUSE event delivered just before OFFLINE may therefore also require an explicit resume. “Audio preference pending” means the SDK has not yet acknowledged a saved audio setting; stale startup values do not erase the preference.

“Hide offline streams” parks only players that have emitted OFFLINE. Their DOM hosts remain alive; return-to-live detection is best effort. Old offline observations are marked stale after two minutes. Use a sidebar channel’s reload button to recheck just that channel. Status requests or SDK errors are not treated as offline. There are no automatic reload loops or force-play timers.

Channel names preserve the capitalization you enter, including Twitch URLs. Re-enter an existing channel with the desired spelling (for example `Risezd`) to update its label without adding another player. Names persist in profiles and JSON backups; old lowercase names remain lowercase until updated. Share links continue to carry lowercase logins. No Twitch metadata lookup is performed. Live tiles keep their green status dot without a redundant Live label; other statuses remain visible.

Stream headers show the current quality immediately before FPS, for example `480p 30 FPS` for `480p30`. When playback FPS is unavailable, the rendition suffix supplies advertised FPS, identified in the tooltip and accessible label. A valid playback estimate takes precedence. Auto, Source and Audio only remain readable labels.

Each player header shows Twitch-reported playback bitrate, for example `↓ 0.40 MB/s`. The sidebar’s **Stream bitrate** and a small `↓ 1.00 MB/s` total at the bottom-right of the video area, beside chat, sum currently reporting streams in **megabytes per second**. The readout stays visible with the sidebar closed and lets clicks pass through. Partial coverage and reporting counts remain in the sidebar and accessible description. This is estimated playback bandwidth, **not actual network download speed**; paused, hidden, unsupported or stale readings are unavailable rather than counted as zero. Metrics are transient and do not drive quality changes; focus/player fullscreen temporarily prioritizes the selected stream as described above. See [playback diagnostics and limits](docs/validation.md#stream-bitrate-diagnostics).

Each player header shows a `30 FPS` estimate (identified as Twitch-reported in its tooltip and accessible label) within two seconds of valid stats becoming available, then averages up to five readings over at most ten seconds. This is provider playback throughput, not measured visible smoothness. `FPS —` means neither playback nor advertised FPS is available. Pause, invalid/stale/hidden stats and quality changes reset the averaging window. Saved Auto and manual quality preferences remain unchanged; focus/player fullscreen applies temporary viewing priorities. See [FPS validation](docs/validation.md#fast-labeled-fps-estimate).

## Local data, backups and sharing

Data is stored under `twitch-multiplayer:v2` on this browser and origin. It includes ordered channels, audio/quality preferences, playback intent, profiles, layout and chat settings. A paused preference is preserved; remembered playing intent does not bypass browser playback permissions. Play all paused streams sends Play to every current player without filtering on cached SDK state, preserving existing iframes and audio/quality preferences. On ONLINE, unconfirmed playing intent receives another Play request; confirmed playing and explicit pause are preserved.

Private browsing, site-data deletion, another device, another Vercel preview address or a custom domain can mean different or absent storage. Export a JSON backup to transfer it. No profile data is uploaded by this app and it adds no telemetry. Twitch embeds make their own network requests.

- **Merge** adds saved profiles while keeping the current workspace. A backup with no profiles adds none in merge mode. ID collisions receive fresh IDs.
- **Replace** explicitly replaces the workspace and saved profiles after confirmation.
- Malformed, unsupported or inaccessible storage pauses automatic saving. The original stored text remains untouched and can be downloaded. Imports continue in memory under the same protection; explicitly choose Enable saving to replace the stored data after exporting it.
- Backup size: 1 MiB maximum; 32 channels per session, 50 profiles, 80-character profile names. Imports are validated before state changes.
- Share links use `#watch=` fragments; no shortening service or server storage. Only public channel order, layout and default quality are shared; unrelated page query parameters are dropped. Opening a link offers an explicit Apply action and preserves saved profiles. Codes are capped at 6,000 characters; use backup files for larger transfers.
- Viewington raw Base64 and LZString profile-code import is supported for the inspected profile CSV format. Settings exports and future formats are not interchangeable with this app’s schema. The app generates its own share format.

The one supported legacy schema for this app is `twitch-multiplayer:v1` containing `{version:1, channels:string[], globalQuality?:string}`. Migration retains its source key. This is not a migration of arbitrary Viewington localStorage.

## Static Vercel hosting

Production is live at [twitchgrid.vercel.app](https://twitchgrid.vercel.app). The Vercel project **twitchgrid** in **kevin-mok** is connected to `Kevin-Mok/twitch-grid`; pushes to **main** automatically deploy to production through Vercel’s GitHub integration. Deployment settings are saved in Vercel, so no GitHub Actions workflow, repository secret or local upload is required. Other branch pushes use Vercel previews.

The configured static build settings are:

| Setting | Value |
| --- | --- |
| Framework preset | Vite |
| Install command | `npm ci` |
| Build command | `npm run build` |
| Output directory | `dist` |
| Required environment variables | None |

There are no application API routes, serverless/edge functions, SSR, hosted data store or dev proxy. The app uses the root page and URL fragments, so no path-routing rewrite is necessary. This matches [Vercel’s Vite static hosting workflow](https://vercel.com/docs/frameworks/frontend/vite).

Twitch receives `window.location.hostname` as its embed parent, covering localhost, current preview domains and production domains. If the app itself is embedded under other ancestors, set the optional public build variable `VITE_TWITCH_PARENTS` to their comma-separated hostnames (no protocol, path or port). Use HTTPS outside local development. `VITE_` values are visible in the bundle and must never contain secrets. [Twitch video requirements](https://dev.twitch.tv/docs/embed/video-and-clips/) and [chat parameters](https://dev.twitch.tv/docs/embed/chat/).

## Development Command Reference

```sh
npm test
npm run typecheck
npm run build
npm run test:browser
```

Build, typecheck and test scripts need no project-specific flags. Browser tests use static `dist` via Vite preview, not the dev server. They expect installed Chrome at `/usr/bin/google-chrome`; set `PLAYWRIGHT_CHROMIUM_EXECUTABLE` for another Chromium path. The controlled fixture lives only in `tests/` and is never bundled. See [smoke tests](docs/smoke-tests.md) for real Twitch checks, tab suspension, audio and login checks requiring human observation.

This app cannot prevent Twitch ads, restrictions, upstream iframe navigation, network drops, browser tab suspension or hardware decoding limits. No fixed simultaneous 1080p stream count is promised.
