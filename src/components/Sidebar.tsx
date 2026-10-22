import { useState, type Dispatch, type SetStateAction } from 'react';
import type { AppData, LayoutMode } from '../domain';

interface Props {
  data: AppData; setData: Dispatch<SetStateAction<AppData>>;
  add(input: string): boolean; remove(login: string): void; clear(): void; refresh(login: string): void;
  reorder(login: string, direction: -1 | 1): void; openChat(login: string): void;
  onStreamCommand(command: 'play-paused' | 'pause-all' | 'mute-all' | 'reload-all'): void;
  onWorkspaceCommand(command: 'toggle-sidebar' | 'toggle-chat' | 'fullscreen'): void;
  onMaximize(): void; onTransfer(mode: 'share' | 'backup'): void;
  onError(error: string | null): void; onNotice(message: string): void;
}
export function Sidebar({ data, setData, add, remove, clear, refresh, reorder, openChat, onStreamCommand, onWorkspaceCommand, onMaximize, onTransfer, onError, onNotice }: Props) {
  const [input, setInput] = useState('');
  const [filter, setFilter] = useState('');
  const [name, setName] = useState('');
  const session = data.session;
  const save = () => {
    if (!name.trim() || name.trim().length > 80) { onError('Use a profile name between 1 and 80 characters.'); return; }
    if (data.profiles.length >= 50) { onError('You can keep up to 50 profiles. Export a backup before removing older profiles.'); return; }
    const profile = { id: crypto.randomUUID(), name: name.trim(), session: structuredClone(session) };
    setData({ ...data, profiles: [...data.profiles, profile], activeProfileId: profile.id });
    setName(''); onError(null); onNotice(`Saved “${profile.name}”.`);
  };
  return <aside className="sidebar" aria-label="Streams and profiles">
    <div className="sidebar-heading"><span>Workspace</span><button className="sidebar-toggle" aria-label="Toggle sidebar (Ctrl+B)" title="Close sidebar · Ctrl+B" onClick={() => onWorkspaceCommand('toggle-sidebar')}>☰</button></div>
    <section className="stream-controls" aria-labelledby="stream-controls-heading">
      <h2 id="stream-controls-heading"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="m9 3-.5 3-2 1-3-.5L2 10l2.5 2v2L2 16l1.5 3.5 3-.5 2 1 .5 3h4l.5-3 2-1 3 .5L20 16l-2.5-2v-2L20 10l-1.5-3.5-3 .5-2-1-.5-3Z" transform="translate(1 -1) scale(.95)" /><circle cx="12" cy="12" r="3" /></svg>Stream Controls</h2>
      <button disabled={!session.channels.length} onClick={() => onStreamCommand('play-paused')}><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 4v16l14-8Z" /></svg>Play all paused streams</button>
      <button disabled={!session.channels.length} onClick={() => onStreamCommand('pause-all')}><svg viewBox="0 0 24 24" aria-hidden="true"><rect x="5" y="4" width="4" height="16" rx="1" /><rect x="15" y="4" width="4" height="16" rx="1" /></svg>Pause all streams</button>
      <button disabled={!session.channels.length} onClick={() => onStreamCommand('mute-all')}><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M11 4 5 9H2v6h3l6 5ZM16 9l6 6m0-6-6 6" /></svg>Mute all streams</button>
      <button disabled={!session.channels.length} onClick={() => onStreamCommand('reload-all')}><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M20 10a8 8 0 1 0-1 7M20 4v6h-6" /></svg>Reload all streams</button>
    </section>
    <form className="channel-entry" onSubmit={event => { event.preventDefault(); if (add(input)) setInput(''); }}>
      <label htmlFor="channel-input">ADD STREAMS</label>
      <div className="input-action"><input id="channel-input" aria-label="Channel or Twitch URL" value={input} onChange={e => setInput(e.target.value)} placeholder="Channel or Twitch URL" autoComplete="off" spellCheck={false} /><button className="primary" aria-label="Add channels" title="Add channels" disabled={!input.trim()}>+</button></div>
      <p>Paste names or links, separated by commas.</p>
    </form>
    <div className="section-heading"><h2>Streams <span>{session.channels.length.toString().padStart(2, '0')}</span></h2><button className="text-button" onClick={clear} disabled={!session.channels.length}>Clear all</button></div>
    <div className="filter-wrap"><span aria-hidden="true">⌕</span><input aria-label="Filter streams" value={filter} onChange={e => setFilter(e.target.value)} placeholder="Filter your streams" /></div>
    <ol className="channel-list">
      {session.channels.filter(c => c.login.includes(filter.toLowerCase())).map(channel => {
        const index = session.channels.findIndex(c => c.login === channel.login);
        return <li key={channel.login}>
          <span className="channel-avatar" aria-hidden="true">{channel.login.slice(0, 2).toUpperCase()}</span>
          <button className="channel-name" title={`Open chat for ${channel.login}`} onClick={() => openChat(channel.login)}>{channel.login}<small>{channel.intent === 'paused' ? 'Paused' : channel.muted ? 'Muted' : 'Sound on'}</small></button>
          <div className="channel-actions"><button aria-label={`Reload hidden or visible ${channel.login}`} title="Reload this channel to check live status" onClick={() => refresh(channel.login)}>↻</button><button aria-label={`Move ${channel.login} up`} title="Move up" disabled={index === 0} onClick={() => reorder(channel.login, -1)}>↑</button><button aria-label={`Move ${channel.login} down`} title="Move down" disabled={index === session.channels.length - 1} onClick={() => reorder(channel.login, 1)}>↓</button><button aria-label={`Remove ${channel.login}`} title="Remove stream" onClick={() => remove(channel.login)}>×</button></div>
        </li>;
      })}
    </ol>
    {!session.channels.length && <p className="sidebar-empty">Your stream list starts here.</p>}
    {session.channels.length > 0 && !session.channels.some(c => c.login.includes(filter.toLowerCase())) && <p className="sidebar-empty">No channels match “{filter}”.</p>}
    <section className="sidebar-settings" aria-labelledby="settings-heading">
      <div className="section-heading"><h2 id="settings-heading">Settings</h2></div>
      <label className="quality-setting">Layout<select aria-label="Layout" value={session.layout} onChange={e => setData({ ...data, session: { ...session, layout: (e.target.value === 'auto' ? 'auto' : Number(e.target.value)) as LayoutMode } })}><option value="auto">Auto grid</option><option value="1">1 column</option><option value="2">2 columns</option><option value="3">3 columns</option><option value="4">4 columns</option></select></label>
      <div className="settings-actions">
        <button className={session.chat.open ? 'is-active' : ''} aria-label="Toggle chat" aria-pressed={session.chat.open} onClick={() => onWorkspaceCommand('toggle-chat')}>▤ Chat</button>
        <button aria-label="Maximize video" onClick={onMaximize}>↗ Maximize video</button>
        <button aria-label="Fullscreen workspace" onClick={() => onWorkspaceCommand('fullscreen')}>⛶ Fullscreen</button>
        <button aria-label="Share" onClick={() => onTransfer('share')}>↗ Share</button>
        <button aria-label="Backup & import" onClick={() => onTransfer('backup')}>⇅ Backup & import</button>
      </div>
      <label className="check-label"><input type="checkbox" checked={session.hideOffline} onChange={e => setData({ ...data, session: { ...session, hideOffline: e.target.checked } })} />Hide offline streams</label>
      <label className="quality-setting">Default quality<select aria-label="Global quality preference" value={session.globalQuality} onChange={e => setData({ ...data, session: { ...session, globalQuality: e.target.value } })}>{[...new Set(['auto', 'chunked', '1080p60', '1080p', '720p60', '720p', '480p', '360p', '160p', 'audio_only', session.globalQuality])].map(q => <option key={q} value={q}>{q === 'auto' ? 'Auto' : q === 'chunked' ? 'Source' : q === 'audio_only' ? 'Audio only' : q}</option>)}</select></label>
      <p>Applies to streams set to “Use default”.</p>
      {session.hideOffline && <p>Live return is best effort. Use a channel’s ↻ to recheck it without reloading others.</p>}
    </section>
    <section className="profiles">
      <div className="section-heading"><h2>Profiles</h2><span className="muted-label">{data.profiles.length}/50</span></div>
      {!data.profiles.length && <p className="profiles-help">Save a lineup for next time.</p>}
      <ul className="profile-list">{data.profiles.map(profile => <li key={profile.id} className={profile.id === data.activeProfileId ? 'selected' : ''}>
        <button className="profile-load" aria-label={`Load profile ${profile.name}`} onClick={() => { setData({ ...data, activeProfileId: profile.id, session: structuredClone(profile.session) }); onNotice(`Loaded “${profile.name}”.`); }}><span aria-hidden="true">▦</span><span>{profile.name}<small>{profile.session.channels.length} streams</small></span></button>
        <button aria-label={`Rename profile ${profile.name}`} title="Rename profile" onClick={() => { const next = window.prompt('Profile name', profile.name); if (next === null) return; if (!next.trim() || next.trim().length > 80) { onError('Profile names must be 1–80 characters.'); return; } setData({ ...data, profiles: data.profiles.map(p => p.id === profile.id ? { ...p, name: next.trim() } : p) }); }}>✎</button>
        <button aria-label={`Delete profile ${profile.name}`} title="Delete profile" onClick={() => { if (window.confirm(`Delete “${profile.name}”? The current stream lineup will stay open.`)) setData({ ...data, profiles: data.profiles.filter(p => p.id !== profile.id), activeProfileId: data.activeProfileId === profile.id ? null : data.activeProfileId }); }}>×</button>
      </li>)}</ul>
      <form className="profile-save" onSubmit={e => { e.preventDefault(); save(); }}><input aria-label="Profile name" placeholder="Name this lineup" maxLength={80} value={name} onChange={e => setName(e.target.value)} /><button aria-label="Save profile" disabled={!name.trim()}>Save</button></form>
      {data.activeProfileId && <button className="update-profile" onClick={() => { setData({ ...data, profiles: data.profiles.map(p => p.id === data.activeProfileId ? { ...p, session: structuredClone(session) } : p) }); onNotice('Updated the selected profile with this workspace.'); }}>Update selected profile</button>}
    </section>
    <div className="sidebar-foot"><span className="dot" />LOCAL FIRST<span>No account needed</span></div>
  </aside>;
}
