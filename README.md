# Twitch Multiplayer

A static Twitch multistream workspace for viewers who keep several channels open at once. Arrange streams, control their sound independently, switch one chat panel, and save your lineups locally. The implementation concentrates on a difficult browser constraint: changing the layout must preserve each video iframe’s DOM location and lifetime.

This independent rebuild studies [Viewington](https://viewington.com/) without shipping its bundles or using its private services. The compact dark interface prioritizes video. Full parity is not claimed: Windows behavior was inspected statically, and Twitch controls autoplay, live availability and embedded login.

Validation: 128 unit/integration and 18 static-browser tests pass. Real player and chat embeds load, but sustained moving video and audio remain unverified in the isolated test browser; the bare official player also stalled. See [validation evidence and remaining checks](docs/validation.md) before treating this as a verified watching setup.

**Known issue:** a desktop user reported that `mrsavage` keeps playing while starting `coachboop` plays briefly and stops. Simultaneous real playback is unresolved; fixture test success does not establish that this core workflow works. See the [open playback investigation](docs/postmortem/2026-10-22-simultaneous-playback.md).

## Stack and why

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

The dev server binds to `127.0.0.1`, prefers port 5173, and tries another port if it is occupied. Read the printed URL. Preserve other listeners. `npm run dev -- --port 5200` chooses another preferred port; add `--strictPort` only when intentionally requiring one exact port. `--host` exposes the server beyond loopback and should be an explicit local choice.

Build and serve the actual static output:

```sh
npm run build
npm run preview
```

Preview prefers `http://127.0.0.1:4173` and also prints its selected port. `npm run inspect` lists the built files and verifies that the HTML’s asset references resolve; `-- --plain` uses ASCII labels and separators. It does not prove real Twitch playback.

## Everyday use

1. Add channel names or Twitch URLs. Commas and whitespace separate entries; duplicate channels are ignored. New streams start muted.
2. Use the sidebar arrows to reorder. Auto grid fits tiles without cropping. If minimum video sizes cannot fit, the canvas scrolls. Choose 1–4 columns or enlarge a tile with its focus control.
3. Each footer has play/pause, mute, volume, quality preference, status sample and explicit reload. The actual quality appears separately. “Use default” follows the global preference; a per-stream choice overrides it. An unavailable preference falls back to `auto`, then the first supported quality, with a visible explanation.
4. “Play paused” also offers a gesture to start blocked playback. “Pause all” and “Mute all” act independently. Selecting or opening chat never unmutes a stream.
5. Open a stream’s chat, choose another channel, collapse it, or drag its divider. The divider also responds to left/right arrows. Chat login depends on Twitch and browser cookie policy; use “Open chat on Twitch” if the embed cannot sign in.
6. Save named profiles. Load preserves overlapping player instances. “Update selected profile” explicitly saves edits to its lineup/settings; rename and delete are separate controls.

`Ctrl+B` (or `Cmd+B`) toggles the sidebar outside text fields. Escape exits focus mode. The workspace and individual players have fullscreen controls. Removing a stream or clearing the lineup offers Undo; clearing and deleting profiles require confirmation.

Use the tile’s Play button or “Play paused” to resume a saved/manual pause. Twitch’s event API does not identify whether an event came from a user or recovery; the app conservatively preserves paused intent even if a late PLAYING event arrives. Native Twitch pause is remembered, but resuming it should use the app control. A PAUSE event delivered just before OFFLINE may therefore also require an explicit resume. “Audio preference pending” means the SDK has not yet acknowledged a saved audio setting; stale startup values do not erase the preference.

“Hide offline streams” parks only players that have emitted OFFLINE. Their DOM hosts remain alive; return-to-live detection is best effort. Old offline observations are marked stale after two minutes. Use a sidebar channel’s reload button to recheck just that channel. Status requests or SDK errors are not treated as offline. There are no automatic reload loops or force-play timers.

## Local data, backups and sharing

Data is stored under `twitch-multiplayer:v2` on this browser and origin. It includes ordered channels, audio/quality preferences, playback intent, profiles, layout and chat settings. A paused preference is preserved; remembered playing intent does not bypass browser playback permissions.

Private browsing, site-data deletion, another device, another Vercel preview address or a custom domain can mean different or absent storage. Export a JSON backup to transfer it. No profile data is uploaded by this app and it adds no telemetry. Twitch embeds make their own network requests.

- **Merge** adds saved profiles while keeping the current workspace. A backup with no profiles adds none in merge mode. ID collisions receive fresh IDs.
- **Replace** explicitly replaces the workspace and saved profiles after confirmation.
- Malformed, unsupported or inaccessible storage pauses automatic saving. The original stored text remains untouched and can be downloaded. Imports continue in memory under the same protection; explicitly choose Enable saving to replace the stored data after exporting it.
- Backup size: 1 MiB maximum; 32 channels per session, 50 profiles, 80-character profile names. Imports are validated before state changes.
- Share links use `#watch=` fragments; no shortening service or server storage. Only public channel order, layout and default quality are shared; unrelated page query parameters are dropped. Opening a link offers an explicit Apply action and preserves saved profiles. Codes are capped at 6,000 characters; use backup files for larger transfers.
- Viewington raw Base64 and LZString profile-code import is supported for the inspected profile CSV format. Settings exports and future formats are not interchangeable with this app’s schema. The app generates its own share format.

The one supported legacy schema for this app is `twitch-multiplayer:v1` containing `{version:1, channels:string[], globalQuality?:string}`. Migration retains its source key. This is not a migration of arbitrary Viewington localStorage.

## Static Vercel hosting

No deployment is performed by this build task. When you choose to deploy, import the project into Vercel with:

| Setting | Value |
| --- | --- |
| Framework preset | Vite |
| Install command | `npm ci` |
| Build command | `npm run build` |
| Output directory | `dist` |
| Required environment variables | None |

There are no application API routes, serverless/edge functions, SSR, hosted data store or dev proxy. The app uses the root page and URL fragments, so no path-routing rewrite is necessary. This matches [Vercel’s Vite static hosting workflow](https://vercel.com/docs/frameworks/frontend/vite).

Twitch receives `window.location.hostname` as its embed parent, covering localhost, current preview domains and production domains. If the app itself is embedded under other ancestors, set the optional public build variable `VITE_TWITCH_PARENTS` to their comma-separated hostnames (no protocol, path or port). Use HTTPS outside local development. `VITE_` values are visible in the bundle and must never contain secrets. [Twitch video requirements](https://dev.twitch.tv/docs/embed/video-and-clips/) and [chat parameters](https://dev.twitch.tv/docs/embed/chat/).

## Development checks

```sh
npm test
npm run typecheck
npm run build
npm run test:browser
```

Build, typecheck and test scripts need no project-specific flags. Browser tests use static `dist` via Vite preview, not the dev server. They expect installed Chrome at `/usr/bin/google-chrome`; set `PLAYWRIGHT_CHROMIUM_EXECUTABLE` for another Chromium path. The controlled fixture lives only in `tests/` and is never bundled. See [smoke tests](docs/smoke-tests.md) for real Twitch checks, tab suspension, audio and login checks requiring human observation.

This app cannot prevent Twitch ads, restrictions, upstream iframe navigation, network drops, browser tab suspension or hardware decoding limits. No fixed simultaneous 1080p stream count is promised.
