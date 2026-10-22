import { useCallback, useEffect, useRef, useState } from 'react';
import { addChannels, defaultData, moveChannel, type AppData, type Channel, type LayoutMode, type WatchSession } from './domain';
import { loadData, saveData } from './storage';
import { Sidebar } from './components/Sidebar';
import { PlayerSurface } from './components/PlayerSurface';
import { ChatPanel } from './components/ChatPanel';
import { TransferPanel } from './components/TransferPanel';
import type { PlayerManager } from './player/manager';

function initialData() {
  try { return loadData(window.localStorage); }
  catch { return { data: defaultData(), warning: 'Browser storage is unavailable. Changes stay in memory; download a backup before closing.', blocked: true, raw: null }; }
}
export type Command = 'toggle-sidebar' | 'toggle-chat' | 'pause-all' | 'play-paused' | 'mute-all' | 'reload-all' | 'fullscreen';

export function App() {
  const [initial] = useState(initialData);
  const [data, setData] = useState<AppData>(initial.data);
  const [storageBlocked, setStorageBlocked] = useState(initial.blocked);
  const [storageWarning, setStorageWarning] = useState(initial.warning);
  const [notice, setNotice] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [transfer, setTransfer] = useState<'share' | 'backup' | null>(null);
  const [focus, setFocus] = useState<string | null>(null);
  const [videoMaximized, setVideoMaximized] = useState(false);
  const [undo, setUndo] = useState<WatchSession | null>(null);
  const manager = useRef<PlayerManager | null>(null);
  const session = data.session;
  const current = useRef(data); current.current = data;
  const updateSession = useCallback((update: (session: WatchSession) => WatchSession) => {
    setData(previous => ({ ...previous, session: update(previous.session) }));
  }, []);
  const patchChannel = useCallback((login: string, patch: Partial<Channel>) => {
    updateSession(previous => ({ ...previous, channels: previous.channels.map(channel => channel.login === login ? { ...channel, ...patch } : channel) }));
  }, [updateSession]);

  useEffect(() => {
    if (storageBlocked) return;
    try {
      const result = saveData(window.localStorage, data);
      if (!result.ok) { setStorageWarning(result.error); setStorageBlocked(true); }
    } catch { setStorageWarning('Browser storage is blocked. Download a backup to keep this session.'); setStorageBlocked(true); }
  }, [data, storageBlocked]);

  const run = useCallback((command: Command) => {
    if (command === 'toggle-sidebar') updateSession(s => ({ ...s, sidebarOpen: !s.sidebarOpen }));
    if (command === 'toggle-chat') updateSession(s => ({ ...s, chat: { ...s.chat, open: !s.chat.open, channel: s.chat.channel ?? s.channels[0]?.login ?? null } }));
    if (command === 'pause-all') updateSession(s => ({ ...s, channels: s.channels.map(c => ({ ...c, intent: 'paused' })) }));
    if (command === 'mute-all') updateSession(s => ({ ...s, channels: s.channels.map(c => ({ ...c, muted: true })) }));
    if (command === 'play-paused') for (const slot of manager.current?.slots() ?? []) {
      if (slot.channel.intent === 'paused' || ['paused', 'blocked', 'loading'].includes(slot.snapshot.playback)) manager.current?.start(slot.channel.login);
    }
    if (command === 'reload-all') for (const c of current.current.session.channels) manager.current?.reload(c.login);
    if (command === 'fullscreen') {
      const action = document.fullscreenElement ? document.exitFullscreen() : document.documentElement.requestFullscreen();
      action.catch(() => setError('Fullscreen is unavailable in this browser context.'));
    }
  }, [updateSession]);
  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') { setFocus(null); setVideoMaximized(false); }
      const target = event.target as HTMLElement | null;
      if (target?.closest('input, textarea, select, [contenteditable="true"], dialog')) return;
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'b') { event.preventDefault(); run('toggle-sidebar'); }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [run]);

  const add = (input: string) => {
    try {
      const next = addChannels(session, input);
      const count = next.channels.length - session.channels.length;
      setData({ ...data, session: next }); setError(null);
      setNotice(count ? `Added ${count} ${count === 1 ? 'channel' : 'channels'}. New streams start muted.` : 'Those channels are already in your workspace.');
      return true;
    } catch (cause) { setError(cause instanceof Error ? cause.message : 'Unable to add channels.'); return false; }
  };
  const remove = (login: string) => {
    setUndo(session);
    updateSession(s => {
      const channels = s.channels.filter(c => c.login !== login);
      return { ...s, channels, chat: { ...s.chat, channel: s.chat.channel === login ? channels[0]?.login ?? null : s.chat.channel } };
    });
    if (focus === login) setFocus(null);
    setNotice(`Removed ${login}.`);
  };
  const openChat = (login: string) => updateSession(s => ({ ...s, chat: { ...s.chat, open: true, channel: login } }));
  const clear = () => {
    if (!session.channels.length || !window.confirm('Remove all streams from this workspace? Saved profiles will stay available.')) return;
    setUndo(session); updateSession(s => ({ ...s, channels: [], chat: { ...s.chat, channel: null } }));
    setFocus(null); setNotice('Workspace cleared.');
  };
  const restore = (next: AppData) => {
    setData(next); setFocus(null); setError(null);
    setNotice(storageBlocked ? 'Imported into memory. Download the original stored data, then use Enable saving to replace it explicitly.' : 'Imported configuration and saved locally.');
  };
  const retryStorage = () => {
    if (!window.confirm('Save the current in-memory setup over this site’s stored setup? Download the original data first if you need it.')) return;
    setStorageBlocked(false); setStorageWarning(null);
  };
  const active = data.profiles.find(p => p.id === data.activeProfileId);

  return <div className={`app-shell${videoMaximized ? ' video-maximized' : ''}`}>
    {videoMaximized && <button className="restore-workspace" aria-label="Restore workspace" title="Restore workspace · Escape" onClick={() => setVideoMaximized(false)}>↙ Restore workspace</button>}
    <header className="app-header">
      <button className="icon-button sidebar-toggle" aria-label="Toggle sidebar (Ctrl+B)" title="Toggle sidebar · Ctrl+B" onClick={() => run('toggle-sidebar')}><span aria-hidden="true">☰</span></button>
      <div className="brand"><span className="brand-mark" aria-hidden="true"><i /><i /><i /><i /></span><span>Twitch <strong>Multiplayer</strong></span><span className="beta-label">LOCAL</span></div>
      <div className="workspace-name">{active?.name ?? 'My workspace'}<span>{session.channels.length} {session.channels.length === 1 ? 'stream' : 'streams'}</span></div>
      <div className="header-actions"><button aria-label="Share" onClick={() => setTransfer('share')}>↗ <span>Share</span></button><button aria-label="Backup & import" onClick={() => setTransfer('backup')}>⇅ <span>Backup & import</span></button></div>
    </header>
    {storageWarning && <div className="storage-warning" role="alert"><span>{storageWarning}</span><button onClick={() => setTransfer('backup')}>Back up data</button><button onClick={retryStorage}>Enable saving</button></div>}
    <div className="app-body">
      {session.sidebarOpen && <Sidebar data={data} setData={setData} add={add} remove={remove} clear={clear} refresh={login => manager.current?.reload(login)}
        reorder={(login, direction) => updateSession(s => moveChannel(s, login, direction))}
        openChat={openChat} onError={setError} onNotice={setNotice} />}
      <main className="watch-workspace">
        <div className="watch-toolbar">
          <div className="toolbar-group"><button aria-label="Play paused" title="Start paused or blocked players" onClick={() => run('play-paused')}>▶ <span>Play paused</span></button><button aria-label="Pause all" onClick={() => run('pause-all')}>Ⅱ <span>Pause all</span></button><button aria-label="Mute all" onClick={() => run('mute-all')}>◌ <span>Mute all</span></button><button aria-label="Reload all" title="Recreate every player" onClick={() => run('reload-all')}>↻ <span>Reload all</span></button></div>
          <div className="toolbar-group layout-tools"><label className="select-label"><span>Layout</span><select aria-label="Layout" value={session.layout} onChange={e => updateSession(s => ({ ...s, layout: (e.target.value === 'auto' ? 'auto' : Number(e.target.value)) as LayoutMode }))}><option value="auto">Auto grid</option><option value="1">1 column</option><option value="2">2 columns</option><option value="3">3 columns</option><option value="4">4 columns</option></select></label>
            <button className={session.chat.open ? 'is-active' : ''} aria-label="Toggle chat" aria-pressed={session.chat.open} onClick={() => run('toggle-chat')}>▤ <span>Chat</span></button><button aria-label="Maximize video" title="Hide app bars to maximize video space" onClick={() => setVideoMaximized(true)}>↗ <span>Maximize video</span></button><button aria-label="Fullscreen workspace" title="Fullscreen workspace" onClick={() => run('fullscreen')}>⛶</button></div>
        </div>
        {error && <div className="message error" role="alert"><span>{error}</span><button aria-label="Dismiss error" onClick={() => setError(null)}>×</button></div>}
        {notice && <div className="message notice" role="status"><span>{notice}</span>{undo && <button onClick={() => { updateSession(() => undo); setUndo(null); setNotice('Previous stream list restored.'); }}>Undo</button>}<button aria-label="Dismiss notice" onClick={() => { setNotice(null); setUndo(null); }}>×</button></div>}
        <div className="watch-content">
          <PlayerSurface session={session} managerRef={manager} patchChannel={patchChannel} remove={remove} openChat={openChat} focus={focus} setFocus={setFocus} />
          <ChatPanel settings={session.chat} channels={session.channels} update={chat => updateSession(s => ({ ...s, chat }))} />
        </div>
        <footer className="workspace-footer"><span><i className={storageBlocked ? 'dot warning-dot' : 'dot'} />{storageBlocked ? 'Memory only' : 'Saved in this browser'}</span><span>{session.channels.filter(c => !c.muted && c.volume > 0).length} sound enabled · Twitch embeds require internet</span><span className="shortcut-hint"><kbd>Ctrl</kbd> + <kbd>B</kbd> sidebar</span></footer>
      </main>
    </div>
    <TransferPanel mode={transfer} close={() => setTransfer(null)} data={data} restore={restore} originalRaw={initial.raw} applySession={s => { updateSession(() => s); setFocus(null); setNotice('Shared watch setup applied. Your saved profiles are unchanged.'); }} onError={setError} />
  </div>;
}
