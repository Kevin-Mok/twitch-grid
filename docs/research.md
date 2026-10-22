# Viewington reference investigation

This report explains what was inspected in Viewington's web app and Windows release, how the evidence was collected, and which behavior the browser rebuild can safely reproduce. Use the evidence ledger and reproduction steps below with the [feature matrix](feature-parity.md); static desktop findings do not establish Windows runtime parity.

## Scope and environment

Investigated on **2026-10-22**. References were the public [watch page](https://viewington.com/watch) and [release page](https://viewington.com/releases). No original user screenshot was supplied. The screenshots in [evidence/](evidence/) were captured during this investigation.

- REA **6.7.0**, acquired from the official `rea-agents` npm package using a temporary npm cache. The current [README](https://github.com/morluto/rea), [browser observation documentation](https://github.com/morluto/rea/blob/main/docs/browser-observation.md), bundled `reverse-engineer-anything` skill, JavaScript guide, CLI help and relevant schemas were inspected.
- Temporary Node **24.22.1** was used because installed Node22.15 did not meet REA's declared engine range. No system Node selection or agent configuration changed. CLI operation did not require an agent restart; configuring the MCP integration would require reconnection/restart, but was unnecessary here.
- Chrome **156.0.8078.47**, Linux, headless; dedicated temporary profile, password-store basic, CDP restricted to **127.0.0.1:9337**. `chrome-devtools-axi` used named session `rea-viewington` and that explicit browser URL. The user's existing Chrome profile was untouched. Playwright fallback was unnecessary.
- Initial viewport **1440×913**; subsequent checks **1280×800** and **1440×900**. Host reports AMD Ryzen5 5500, 12 logical CPUs. This was a functional investigation, not a GPU/video-throughput benchmark.
- REA was passive: target discovery, DOM/accessibility/storage capture, screenshot capture, a one-minute observation window, artifact inventory/extraction and bounded static analysis. AXI performed clicks, keyboard input, resizing and explicit page instrumentation.
- Origin filters admitted `https://viewington.com`, with `https://embed.twitch.tv` for later relevant captures. The first observation also admitted `https://player.twitch.tv`; the actual reference iframe uses `embed.twitch.tv`, so that early observation does **not** establish complete embedded-player event coverage.
- Raw captures, public bundles, installer and extracted sources stayed under temporary research directories. Repository evidence contains summaries, public screenshots, hashes and synthetic profile fixtures. No credentials, cookies, authorization headers, user session traffic or downloaded application code are shipped.

## Evidence ledger

Full REA identities and limitations are in [rea-evidence-index.json](evidence/rea-evidence-index.json). The following short IDs are used in the feature matrix. UI IDs describe this investigation's actions; they are not invented REA IDs.

| ID | Evidence and reproducible action | Scope / result |
| --- | --- | --- |
| WEB-01 | REA target listing `ev_bcecccb4c77126386d11d8c4b9e76d5b82739762049e5f9a62ea1091856a4199`; initial page `ev_6ffad24574cae1c7d05cc9b486d79827320ab30b48593ebb39f6930a62e143ae` | Fresh `/watch` page; first-run tour, hidden sidebar, public script sources and redacted storage fingerprints. |
| WEB-02 | Initial screenshot `ev_a9de8eebce1b95088b5b2e729fcee180cdfecbb6d90cd2e41c7a29323e44c970` | [First-run screenshot](evidence/reference-initial.png),1440×913. |
| WEB-03 | Bounded captured app-chunk analysis `ev_33c4bc7e96a4130e4f387a88061f3db5fccd98c9385acb4105a7986c0fdb987b` | Selected `3-iwkt2wl_o1i.js`; inert parsing succeeded,55,423 visited AST nodes, zero parse failures. Twelve other inventoried files were outside that analysis. Supporting captured state/profile module was read separately. |
| WEB-04 | Passive observation `ev_65f3fab903ef251ae7bae3c93225912d5d37b5ddafcd94712b99a731a1b662be` | One-minute attach-limited window17:19:54–17:20:54UTC. Main page remained `/watch`. This timeline is not an interaction driver or proof of complete iframe traffic. |
| UI-01 | Skip tour; open sidebar; open Settings; open Keyboard Shortcuts; toggle per-stream quality and live polling; inspect global quality menu | Controls and defaults observed as described below. Polling interval control appears when polling is enabled; default interval30s. |
| UI-02 | Add `Twitch`, then `monstercat`, `eslcs`, `lck`, `theprimeagen`; allow embeds to initialize | Normalized first channel to `twitch`; five ordered entries. Four displayed offline and their video frames disappeared. ESLCS showed live channel/title/viewer metadata. |
| UI-03 | REA screenshot `ev_1ad7265eedb09c20bf080f3fba9e20a1f8dcb23b17cc15ac9baa32d4943cb2f4` | [Stream/sidebar screenshot](evidence/reference-streams.png),1440×913. One visible live player and four offline rows; screenshot includes an intentionally invalid paste input exercised during investigation. |
| UI-04 | Paste raw/compressed synthetic codes; save a five-channel profile; copy profile; rename; inspect edit/load dialogs | Verified format fixtures in [viewington-profile-fixtures.json](evidence/viewington-profile-fixtures.json). Both import variants create saved profiles without changing the current stream list. Save, rename and code generation verified. Load asks before replacing the current list. |
| UI-05 | Capture Settings; Export; Import the exact synthetic export after a real keyboard input event | [Settings screenshot](evidence/reference-settings.png),1440×900; REA `ev_59f1e70ab1734c39ce0458fce4b6fe423eb2ac5ec2e21fc75662671fe381e2de`. Import displayed success. Export format differs from profile codes. |
| UI-06 | Keep a reference to the live iframe; observe iframe additions/removals/load events; Ctrl+B; resize1280×800 then1440×900; keyboard reorder with Space/ArrowDown/Space; select360p | Retained iframe object; zero observed additions/removals/load events in these measured windows. Reorder changed first two channels to `monstercat,twitch`. This establishes application DOM stability for one live frame, not five simultaneous live streams or uninterrupted decoding. |
| UI-07 | With the same instrumentation, load the saved five-channel profile containing every current channel | Old live iframe disconnected; five new iframe additions and one removal observed immediately; retained-channel identity failed in the original. Four offline frames had previously been removed. |
| UI-08 | Inspect top-page resource origins and only app-owned synthetic storage keys | Observed origins: `viewington.com`, `t.viewington.com`, `embed.twitch.tv`, and, after enabling polling, `gql.twitch.tv`. Captured public source contains PostHog integration. No telemetry behavior is copied into the rebuild. |
| DESK-01 | Download official current installer; hash; `file`; REA `inspect-artifact` | Version0.6.8 dated September11,2026. PE32 NSIS self-extracting installer; embedded7z payload. REA `ev_b0193fc4a61c7e95fdbbad55163fd1537731f4f58b45126fa2d7898399f83701` does not by itself enumerate the NSIS payload. |
| DESK-02 | Extract only packaged resources; inspect ASAR with REA | ASAR inventory `ev_48c3a51514a557f0972be105f2fbecdde444727f71d93863203b6ca4e95cd541`. Electron identity confirmed by package manifest, main/preload code and resources, rather than assumed from the filename. |
| DESK-03 | REA safe extraction with unpacked companion icon present | `ev_69f3b92f417130614b65cad46812cd006eadc817ed0715b48719c8c65a04f54a`; extraction completed. |
| DESK-04 | Analyze exact ASAR files `package.json`, `out/main/index.js`, `out/preload/index.js` | `ev_f47f0e8e50130fc7fd9046c1561ce1211b8af7ab73c9cb783a0bf5149cee8b76`; two JavaScript files parsed,25,513 visited AST nodes, zero parse failures.14,452 relevant files unselected. |
| DESK-05 | Read selected extracted renderer chunks and their imports | Main layout, sidebar/profile actions and stream wrapper corroborate desktop feature candidates. Static code only; not Windows interaction evidence. |

## Web findings

The interface uses a dark, video-first canvas with a green accent. The sidebar is an overlay, approximately340px in the captured state; the lone video continued using the full1440px canvas width behind it. It contains channel input, searchable ordered stream rows, save/share controls, saved profiles, paste-code input, global quality, global playback controls and Settings. The first visit presents a ten-step tour. Sidebar controls may remain in the accessibility tree while translated off-screen, so a DOM inventory alone does not prove a control is interactable.

Global quality choices observed: Source, Auto,1080p60,720p60,480p,360p,160p. Per-stream selectors are hidden by default and appear after enabling the setting; their default is Global(Auto). The state module clears per-stream overrides when global quality is applied/reapplied. This is a static call-path finding; actual available transcoding ladders differ by Twitch channel. New streams were muted. Twitch supplies its own playback, volume, quality, fullscreen, follow/subscription and content-classification UI inside the embed; these are distinct from Viewington's app controls.

The Settings dialog exposes drag-from-anywhere, per-stream quality, rounded corners, tooltips, cross-tab sync, four fullscreen audio/quality options, live polling, dark mode, primary color, neutral color, shortcuts and settings transfer. Fresh defaults observed: rounded corners/tooltips/dark mode enabled; other listed toggles disabled. Enabling live polling exposes30s by default; the source lists5/15/30/60s choices. Polling sends Twitch GraphQL requests using Twitch's web-client identifier. This is not the supported Helix API and is intentionally excluded from the rebuild.

Default configurable shortcuts observed: Shift+P mutes all, Shift+1 requests360p, Shift+2 requests source/auto, Shift+M toggles drag-from-anywhere, Shift+R reloads all. Ctrl+B toggles the sidebar. The shortcut dialog offers rebinding and reset. Every possible keybinding/focus-context combination was not executed.

Stream rows have hover actions for pinning, visibility, reload, channel editing and removal; some actions disappear for offline rows. The reference supports undo/redo of removals in its state module, but that path was not exercised. Profile edit supports name changes and channel addition/removal/reordering. Copy and load are separate actions. Clear-list and profile deletion have confirmation UI in source; the final destructive confirmation paths were not part of the retained sample.

### Layout and lifetime

The captured web layout implementation tries every column count from1 through the visible stream count. For each candidate it calculates ceiling row count, subtracts1px gaps, and fits floored16:9 tiles to the available width and height. It chooses the largest tile width, preserving the first candidate on ties. It centers the full grid vertically/horizontally and centers an incomplete final row within the full-grid width. The app does not establish a400×300 Twitch minimum in this algorithm; the rebuild adds a documented scrolling fallback when minimum sizes cannot fit.

Stable-index render order and absolute tile positions are present in the web code. The measured live iframe survived sidebar, resize, keyboard reorder and quality-preference changes. Profile loading is different: loading a profile with the same channel set recreated the iframe. The rebuild's retained-channel profile behavior is an intentional improvement.

The offline sample removed video frames while retaining ordered channel rows and showing an all-offline message when appropriate. That message promises automatic return; this investigation did **not** observe an actual offline-to-live transition. Optional GraphQL polling supplies an independent status observer in the reference. A supported, browser-only event provider cannot honestly promise the same discovery capability after its only iframe is destroyed. The rebuild therefore retains observers and exposes stale/unknown state and explicit refresh limits.

The initially paused ESLCS presentation was not treated as an app policy. A real Play gesture was sent; later screenshots showed game imagery rather than the initial preview/break screen. Sustained frame progress, decoded-video counters, audio output and long-duration continuity were not measured. This is insufficient for a performance or uninterrupted-playback claim.

### Profile and settings formats

Verified profile plaintext is one row per profile: name, then ordered channels, separated by commas; multiple profiles use newlines. A name containing a comma is wrapped in quotes. The reference decoder has a simple quote parser, not a full CSV implementation. The encoder chooses the shorter of LZString `compressToBase64` and UTF8 Base64. The decoder tries LZ first and then UTF8 Base64. There is no JSON envelope around these profile rows. Four safe fixtures include successful imports and exact reference-generated codes.

Profile codes carry channel names and profile labels, not player settings or tokens. The rebuild may accept this narrowly verified format with its own bounded decompression and strict channel/schema validation; it should not copy the reference's permissive parsing. Unicode, embedded-newline names and every historical version were not verified.

Settings transfer is separate: LZ-compressed JSON with `version`, `timestamp`, and an allowlisted `data` object of storage keys. Export/import of the synthetic session succeeded, and the import UI states that it replaces current settings. The reference also has a `settings` query-string import path in code; direct URL application was not exercised. Rebuild backup JSON and watch-fragment sharing are distinct formats and must be labelled accordingly.

Observed storage keys include `multitwitch-streams`, `multitwitch-quality`, `multitwitch-streams-hidden`, `multitwitch-playlists`, per-stream-quality visibility, live-status enablement, and tour completion. Source lists additional appearance, shortcut, fullscreen and sidebar preferences. IndexedDB and Cache Storage were empty in the initial REA capture. Local state is origin/browser-specific; no account sync was established.

## Desktop artifact and findings

Official download: [Viewington0.6.8 Windows installer](https://downloads.viewington.com/viewington-electron-0.6.8-setup.exe), **114,600,167bytes**.

- Installer SHA-256: `615b8532b1b0942c9c15d0042fba1c5c49a452ca5a22125de088da791a1debff`.
- `resources/app.asar`: **121,350,545bytes**, SHA-256 `5fbfd231804053d2c4382970c43d1699981c9e8db6528d8ae5cd06fd9d6b8f95`.
- Manifest: `viewington-electron`, product Viewington, version0.6.8, main `./out/main/index.js`, stated Node24.x. Selected package main/preload code confirms Electron. The desktop Chromium/Electron runtime version was not executed or separately established.
- Release notes mention startup/performance work and a fix for infinite reloading after adding an offline channel. That historical defect is not a feature to reproduce.

The main process creates a native `WebContentsView` per stream with a shared persistent Twitch partition, disabled background throttling, context isolation, sandboxing and no Node integration in stream renderers. IPC controls stream creation/removal, native bounds, mute, quality, playback, reload, status and fullscreen. Separate native overlays carry sidebar/toast/drag presentation. A loopback HTTP server serves packaged stream pages on an ephemeral port; this desktop implementation detail is unnecessary for a hosted static browser app.

Desktop-specific static paths include Twitch sign-in/logout/session reset, persisted window geometry, disk `settings.json`, logs, and `electron-updater` check/download/install controls. Main code checks statuses through Twitch GraphQL and coordinates offline recovery/startup. Renderer chunks contain matching channel/profile code, pin/hide/reload/remove controls, global quality/playback and fullscreen preferences. The inspected desktop sidebar does not establish the web app's complete appearance/keybinding/settings-transfer menu; availability is left unverified where evidence is missing.

| Selected source | SHA-256 |
| --- | --- |
| `package.json` | `ac954457a58650d73a3d9ad181b610e11e88fc187b110ec1a339d6ec183e3d64` |
| `out/main/index.js` | `43e293f0603541439eaeceab9314cc567247bce1c1d1c55b5d8b3332a206de66` |
| `out/preload/index.js` | `9def1f763ade92c1fac80c04674ef22145ed6462e294f4359e22d0e68778ea22` |
| `out/renderer/assets/main-DD87efKi.js` | `d72c1a19589e2b1205fb4236e86866c759d09152fb11e02696c5fcd14cd24fd8` |
| `out/renderer/assets/sidebarOverlay-CWvDfNQL.js` | `563232a8f7aa5fbf03658c5ff4ff514aaf7128c3a4d1f26cb74aa0693df86891` |
| `out/renderer/assets/stream-DQi2Nppt.js` | `e3696b01f6a0a702ebc9cef56068a70951e11a6c9fa309e1e99941fd6d36d4ae` |

## Limitations and remaining reference checks

The full-site REA `analyze-web-bundle --fetch-source-maps` exhausted the approximately4GiB default Node heap. A bounded app-specific static pass succeeded instead. All13 scripts in the successful initial page capture had no declared source-map URL; this does not prove that no map exists anywhere. Source-map recovery was not completed. See the [network incident](postmortem/2026-10-22-reference-research-network.md) and [tool-contract incident](postmortem/2026-10-22-reference-tool-contracts.md) for the failures and corrected scope.

Windows runtime was unavailable on the Linux host. Remaining Windows checks: clean install/startup, native drag/resize/fullscreen lifetime, authentication/session reuse, actual offline-to-live return, updater flow, persistence after restart, rendering/audio/performance and every desktop menu. No Windows installer or extracted target code was executed.

Remaining web checks: five simultaneously live players; genuine controlled offline-to-live transition; suspended-tab return; audio listening; sustained video counters; full per-stream quality ladder; focus/fullscreen audio rules; every rebind/theme/color combination; cross-tab synchronization; direct settings-query import; deletion/undo/redo finalization; malformed settings fuzzing. No complete-parity claim follows from the inspected menus or static source.

The switchable right-hand chat panel, supported-event status provider, strict import validation, JSON backups, self-contained watch fragments and stronger profile-lifetime invariant are intentional rebuild extensions or safety improvements. The original web and selected desktop surfaces did not establish an application-owned switchable chat panel.
