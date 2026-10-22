import { useRef } from 'react';
import type { Channel, WatchSession } from '../domain';
import { embedParents, twitchChat } from '../chat';

interface Props { settings: WatchSession['chat']; channels: Channel[]; update(settings: WatchSession['chat']): void }
export function ChatPanel({ settings, channels, update }: Props) {
  const drag = useRef<{ x: number; width: number } | null>(null);
  if (!settings.open) return null;
  const selected = channels.find(c => c.login === settings.channel)?.login ?? null;
  const resize = (width: number) => update({ ...settings, width: Math.min(640, Math.max(240, Math.round(width))) });
  let url = ''; let configError: string | null = null;
  try { if (selected) url = twitchChat.embedUrl(selected, embedParents(window.location.hostname, import.meta.env.VITE_TWITCH_PARENTS ?? '')); }
  catch (cause) { configError = cause instanceof Error ? cause.message : 'Invalid chat configuration.'; }
  return <aside className="chat-panel" aria-label="Twitch chat" style={{ width: settings.width }}>
    <div className="chat-resizer" role="separator" aria-label="Resize chat" aria-orientation="vertical" aria-valuenow={settings.width} aria-valuemin={240} aria-valuemax={640} tabIndex={0}
      onKeyDown={event => { if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') { event.preventDefault(); resize(settings.width + (event.key === 'ArrowLeft' ? 16 : -16)); } }}
      onPointerDown={event => { drag.current = { x: event.clientX, width: settings.width }; event.currentTarget.setPointerCapture(event.pointerId); }}
      onPointerMove={event => { if (drag.current) resize(drag.current.width + drag.current.x - event.clientX); }}
      onPointerUp={() => { drag.current = null; }} onPointerCancel={() => { drag.current = null; }} />
    <div className="chat-header"><span className="eyebrow">STREAM CHAT</span><button aria-label="Collapse chat" title="Collapse chat" onClick={() => update({ ...settings, open: false })}>→</button></div>
    <div className="chat-channel"><span className="chat-hash">#</span><select aria-label="Chat channel" value={selected ?? ''} onChange={event => update({ ...settings, channel: event.target.value || null })}><option value="" disabled>Choose a channel</option>{channels.map(c => <option key={c.login} value={c.login}>{c.login}</option>)}</select></div>
    {configError ? <p role="alert">{configError}</p> : selected ? <iframe className="chat-frame" title={`Twitch chat for ${selected}`} src={url} /> : <div className="chat-empty"><h3>A place for the conversation.</h3><p>Add a stream, then choose its chat.</p></div>}
    <div className="chat-note"><p>Login or chat unavailable? Your browser may restrict embedded cookies.</p>{selected && <a href={twitchChat.externalUrl(selected)} target="_blank" rel="noopener noreferrer">Open chat on Twitch ↗</a>}</div>
  </aside>;
}
