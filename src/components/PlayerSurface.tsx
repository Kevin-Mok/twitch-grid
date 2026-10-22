import { useEffect, useLayoutEffect, useRef, useState, type MutableRefObject } from 'react';
import { createPortal } from 'react-dom';
import type { Channel, WatchSession } from '../domain';
import { calculateLayout } from '../layout';
import { PlayerManager } from '../player/manager';
import { createTwitchPlayer } from '../player/twitch';
import type { PlayerSlot } from '../player/types';
import { statusLabel } from '../player/status';

interface Props {
  session: WatchSession; managerRef: MutableRefObject<PlayerManager | null>;
  patchChannel(login: string, patch: Partial<Channel>): void;
  openChat(login: string): void; remove(login: string): void;
  focus: string | null; setFocus(login: string | null): void;
  onBitrates(bitrates: Record<string, number | null>): void;
}
export function PlayerSurface({ session, managerRef, patchChannel, openChat, remove, focus, setFocus, onBitrates }: Props) {
  const surface = useRef<HTMLDivElement>(null);
  const viewport = useRef<HTMLDivElement>(null);
  const [slots, setSlots] = useState<PlayerSlot[]>([]);
  const [size, setSize] = useState({ width: 900, height: 700 });
  const [revision, setRevision] = useState(0);
  const observed = useRef(patchChannel); observed.current = patchChannel;

  useLayoutEffect(() => {
    const manager = new PlayerManager(surface.current!, createTwitchPlayer, () => setRevision(x => x + 1), (login, patch) => observed.current(login, patch));
    managerRef.current = manager;
    return () => { managerRef.current = null; manager.destroy(); };
  }, [managerRef]);
  useLayoutEffect(() => {
    const manager = managerRef.current!;
    manager.sync(session.channels, session.globalQuality);
    setSlots(manager.slots());
  }, [session.channels, session.globalQuality, managerRef, revision]);
  useEffect(() => {
    onBitrates(Object.fromEntries(slots.map(slot => [slot.channel.login, slot.snapshot.bitrateKbps])));
  }, [slots, revision, onBitrates]);
  useEffect(() => {
    const element = viewport.current!;
    const observer = new ResizeObserver(entries => {
      const { width, height } = entries[0].contentRect;
      setSize({ width: Math.max(1, width), height: Math.max(1, height) });
    });
    observer.observe(element); return () => observer.disconnect();
  }, []);

  const visible = session.channels.filter(channel => !session.hideOffline || slots.find(slot => slot.channel.login === channel.login)?.snapshot.live !== 'offline');
  const focusIndex = focus ? visible.findIndex(c => c.login === focus) : -1;
  const layout = calculateLayout(visible.length, size.width, size.height, session.layout, focusIndex >= 0 ? focusIndex : null);
  const scale = Math.min(1, size.width / layout.width, size.height / layout.height);
  useLayoutEffect(() => {
    for (const slot of slots) {
      const index = visible.findIndex(channel => channel.login === slot.channel.login);
      const tile = index >= 0 ? layout.tiles[index] : { x: 0, y: -10000, width: 400, height: 336 };
      const x = (size.width - layout.width * scale) / 2 + tile.x * scale;
      const y = (size.height - layout.height * scale) / 2 + tile.y * scale;
      Object.assign(slot.element.style, { width: `${tile.width}px`, height: `${tile.height}px`, transform: `translate(${x}px, ${y}px) scale(${scale})` });
      slot.element.classList.toggle('parked', index < 0);
      slot.element.classList.toggle('focused', slot.channel.login === focus);
      slot.element.inert = index < 0;
      slot.element.setAttribute('aria-hidden', String(index < 0));
    }
  }, [slots, layout, visible, focus, scale, size]);

  return <div className="player-viewport" ref={viewport}>
    {focus && <button aria-label="Show all streams" className="focus-exit" onClick={() => setFocus(null)}>↙ Show all streams</button>}
    {!session.channels.length && <div className="empty-workspace"><div className="empty-grid" aria-hidden="true"><span /><span /><span /><span /></div><p className="eyebrow">ONE WORKSPACE. EVERY STREAM.</p><h1>Make room for your favorites.</h1><p>Add Twitch channels from the sidebar.<br />Arrange your view, pick your sound, and settle in.</p><span className="empty-note">Your profiles stay in this browser.</span></div>}
    {!!session.channels.length && !visible.length && <div className="all-offline"><h2>Your streams are offline</h2><p>Their players remain loaded to watch for live events.<br />If status becomes stale, show offline streams and reload a channel.</p></div>}
    <div className="player-surface" ref={surface} style={{ width: size.width, height: size.height }} />
    {slots.map(slot => {
      const channel = session.channels.find(c => c.login === slot.channel.login);
      if (!channel) return null;
      const state = slot.snapshot;
      const stale = state.live === 'offline' && Date.now() - state.lastSignal > 120000;
      const label = statusLabel(state);
      const name = channel.displayName ?? channel.login;
      const rendition = /^(\d+p)(\d+(?:\.\d+)?)$/.exec(state.quality);
      const fps = state.fps ?? (rendition ? Number(rendition[2]) : null);
      const advertisedFps = state.fps === null && rendition !== null;
      const quality = !state.quality || state.quality === 'unknown' ? null : state.quality === 'auto' ? 'Auto' : state.quality === 'chunked' ? 'Source' : state.quality === 'audio_only' ? 'Audio only' : rendition?.[1] ?? state.quality;
      return [
        createPortal(<><span className={`live-indicator ${state.live}`} role="img" aria-label={label} /><strong>{name}</strong>{state.live !== 'online' && <span className={`status-label ${state.live}`}>{label}</span>}<span className="quality-indicator" role="note" aria-label={`${channel.login}: current playback quality ${quality ?? 'unavailable'}`} title="Current Twitch-reported quality. Auto lets Twitch choose; Source uses the original stream.">{quality ?? 'Quality —'}&nbsp;</span><span className="fps-indicator" role="note" aria-label={`${channel.login}: ${advertisedFps ? 'advertised stream FPS' : 'Twitch estimated playback FPS'} ${fps === null ? 'unavailable' : fps.toFixed(0)}`} title={advertisedFps ? "Advertised stream FPS from the current quality; playback FPS is unavailable. This does not measure displayed smoothness." : "Estimated Twitch playback FPS: first valid reading within two seconds, then averaged over up to ten seconds. This does not measure displayed smoothness."}>{fps === null ? 'FPS —' : `${fps.toFixed(0)} FPS`}</span><span className="bitrate-indicator" role="note" aria-label={`${channel.login}: playback bitrate ${state.bitrateKbps === null ? 'unavailable' : `${(state.bitrateKbps / 8000).toFixed(2)} megabytes per second`}`} title="Twitch-reported playback bitrate, not actual network download speed.">{state.bitrateKbps === null ? 'Bitrate —' : `↓ ${(state.bitrateKbps / 8000).toFixed(2)} MB/s`}</span><div className="tile-heading-actions"><button aria-label={`Open chat for ${channel.login}`} title="Open chat" onClick={() => openChat(channel.login)}>▤</button><button aria-label={focus === channel.login ? `Unfocus ${channel.login}` : `Focus ${channel.login}`} title="Enlarge stream" onClick={() => setFocus(focus === channel.login ? null : channel.login)}>⤢</button><button aria-label={`Fullscreen ${channel.login}`} title="Fullscreen player" onClick={() => { void slot.element.requestFullscreen().catch(() => {}); }}>⛶</button><button aria-label={`Remove player ${channel.login}`} title="Remove stream" onClick={() => remove(channel.login)}>×</button></div></>, slot.header, `${channel.login}-header`),
        createPortal(<>{state.error ? <span className="tile-message" role="alert">{state.error}</span> : (stale || state.audioPending) && <span className="tile-message">{state.audioPending ? 'Audio preference pending. Use Twitch’s audio controls to retry if it stays pending.' : 'Status is stale. Reload this channel to check again.'}</span>}
        </>, slot.element, `${channel.login}-message`),
      ];
    })}
  </div>;
}
