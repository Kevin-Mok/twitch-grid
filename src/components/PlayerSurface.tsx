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
}
export function PlayerSurface({ session, managerRef, patchChannel, openChat, remove, focus, setFocus }: Props) {
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
    const element = viewport.current!;
    const observer = new ResizeObserver(entries => {
      const { width, height } = entries[0].contentRect;
      setSize({ width: Math.max(1, width - 16), height: Math.max(1, height - 16) });
    });
    observer.observe(element); return () => observer.disconnect();
  }, []);

  const visible = session.channels.filter(channel => !session.hideOffline || slots.find(slot => slot.channel.login === channel.login)?.snapshot.live !== 'offline');
  const focusIndex = focus ? visible.findIndex(c => c.login === focus) : -1;
  const layout = calculateLayout(visible.length, size.width, size.height, session.layout, focusIndex >= 0 ? focusIndex : null);
  useLayoutEffect(() => {
    for (const slot of slots) {
      const index = visible.findIndex(channel => channel.login === slot.channel.login);
      const tile = index >= 0 ? layout.tiles[index] : { x: 0, y: -10000, width: 400, height: 372 };
      Object.assign(slot.element.style, { width: `${tile.width}px`, height: `${tile.height}px`, transform: `translate(${tile.x}px, ${tile.y}px)` });
      slot.element.classList.toggle('parked', index < 0);
      slot.element.classList.toggle('focused', slot.channel.login === focus);
      slot.element.inert = index < 0;
      slot.element.setAttribute('aria-hidden', String(index < 0));
    }
  }, [slots, layout, visible, focus]);

  return <div className="player-viewport" ref={viewport}>
    {focus && <button aria-label="Show all streams" className="focus-exit" onClick={() => setFocus(null)}>↙ Show all streams</button>}
    {!session.channels.length && <div className="empty-workspace"><div className="empty-grid" aria-hidden="true"><span /><span /><span /><span /></div><p className="eyebrow">ONE WORKSPACE. EVERY STREAM.</p><h1>Make room for your favorites.</h1><p>Add Twitch channels from the sidebar.<br />Arrange your view, pick your sound, and settle in.</p><span className="empty-note">Your profiles stay in this browser.</span></div>}
    {!!session.channels.length && !visible.length && <div className="all-offline"><h2>Your streams are offline</h2><p>Their players remain loaded to watch for live events.<br />If status becomes stale, show offline streams and reload a channel.</p></div>}
    <div className="player-surface" ref={surface} style={{ width: layout.width, height: layout.height }} />
    {slots.map(slot => {
      const channel = session.channels.find(c => c.login === slot.channel.login);
      if (!channel) return null;
      const state = slot.snapshot;
      const showPlay = channel.intent === 'paused' || state.playback === 'blocked' || state.playback === 'paused';
      const stale = state.live === 'offline' && Date.now() - state.lastSignal > 120000;
      const label = statusLabel(state);
      return [
        createPortal(<><span className={`live-indicator ${state.live}`} /><strong>{channel.login}</strong><span className={`status-label ${state.live}`}>{label}</span><div className="tile-heading-actions"><button aria-label={`Open chat for ${channel.login}`} title="Open chat" onClick={() => openChat(channel.login)}>▤</button><button aria-label={focus === channel.login ? `Unfocus ${channel.login}` : `Focus ${channel.login}`} title="Enlarge stream" onClick={() => setFocus(focus === channel.login ? null : channel.login)}>⤢</button><button aria-label={`Fullscreen ${channel.login}`} title="Fullscreen player" onClick={() => { void slot.element.requestFullscreen().catch(() => {}); }}>⛶</button><button aria-label={`Remove player ${channel.login}`} title="Remove stream" onClick={() => remove(channel.login)}>×</button></div></>, slot.header, `${channel.login}-header`),
        createPortal(<><button className="play-toggle" aria-label={`${showPlay ? 'Play' : 'Pause'} ${channel.login}`} title={state.playback === 'blocked' ? 'Click to allow playback' : showPlay ? 'Play' : 'Pause'} onClick={() => { if (showPlay) managerRef.current?.start(channel.login); else patchChannel(channel.login, { intent: 'paused' }); }}>{showPlay ? '▶' : 'Ⅱ'}</button>
          <button aria-label={`${channel.muted ? 'Unmute' : 'Mute'} ${channel.login}`} title={channel.muted ? 'Unmute' : 'Mute'} className={channel.muted ? '' : 'sound-on'} onClick={() => patchChannel(channel.login, { muted: !channel.muted })}>{channel.muted ? '◌' : '◖'}</button>
          <input className="volume-slider" aria-label={`Volume for ${channel.login}`} type="range" min="0" max="1" step="0.01" value={channel.volume} onChange={e => patchChannel(channel.login, { volume: Number(e.target.value) })} />
          <span className="quality-actual" title={`Actual quality: ${state.quality}. ${state.fallback ?? ''}`}>{state.playback === 'blocked' ? 'Click play' : state.playback === 'buffering' ? 'Buffering' : state.quality === 'unknown' ? 'Connecting' : state.quality === 'chunked' ? 'Source' : state.quality}</span>
          <select aria-label={`Quality for ${channel.login}`} title={state.fallback ?? 'Quality preference'} value={channel.quality ?? ''} onChange={e => patchChannel(channel.login, { quality: e.target.value || null })}><option value="">Use default</option>{[...new Set([...state.qualities, ...(channel.quality ? [channel.quality] : [])])].map(q => <option key={q} value={q}>{q === 'chunked' ? 'Source' : q}</option>)}</select>
          <button aria-label={`Refresh status for ${channel.login}`} title="Refresh available player status (does not reload)" onClick={() => managerRef.current?.refresh(channel.login)}>⌁</button><button aria-label={`Reload ${channel.login}`} title="Reload this player" onClick={() => managerRef.current?.reload(channel.login)}>↻</button>
          {(state.error || state.fallback || stale || state.audioPending) && <span className="tile-message" role={state.error ? 'alert' : undefined}>{state.error ?? state.fallback ?? (state.audioPending ? 'Audio preference pending. Use the audio controls to retry if it stays pending.' : 'Status is stale. Reload this channel to check again.')}</span>}
        </>, slot.footer, `${channel.login}-footer`),
      ];
    })}
  </div>;
}
