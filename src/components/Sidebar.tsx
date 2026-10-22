import { useState, type Dispatch, type SetStateAction } from 'react';
import type { AppData } from '../domain';

interface Props {
  data: AppData; setData: Dispatch<SetStateAction<AppData>>;
  add(input: string): boolean; remove(login: string): void; clear(): void; refresh(login: string): void;
  reorder(login: string, direction: -1 | 1): void; openChat(login: string): void;
  onError(error: string | null): void; onNotice(message: string): void;
}
export function Sidebar({ data, setData, add, remove, clear, refresh, reorder, openChat, onError, onNotice }: Props) {
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
    <div className="sidebar-settings">
      <label className="check-label"><input type="checkbox" checked={session.hideOffline} onChange={e => setData({ ...data, session: { ...session, hideOffline: e.target.checked } })} />Hide offline streams</label>
      <label className="quality-setting">Default quality<select aria-label="Global quality preference" value={session.globalQuality} onChange={e => setData({ ...data, session: { ...session, globalQuality: e.target.value } })}>{[...new Set(['auto', 'chunked', '1080p60', '1080p', '720p60', '720p', '480p', '360p', '160p', 'audio_only', session.globalQuality])].map(q => <option key={q} value={q}>{q === 'auto' ? 'Auto' : q === 'chunked' ? 'Source' : q === 'audio_only' ? 'Audio only' : q}</option>)}</select></label>
      <p>Applies to streams set to “Use default”.</p>
      {session.hideOffline && <p>Live return is best effort. Use a channel’s ↻ to recheck it without reloading others.</p>}
    </div>
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
