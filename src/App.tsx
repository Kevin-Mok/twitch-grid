import { useCallback, useEffect, useRef, useState } from 'react';
import { addChannels, defaultData, moveChannel, type AppData, type Channel, type WatchSession } from './domain';
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
  const [bitrates, setBitrates] = useState<Record<string, number | null>>({});
  const [videoMaximized, setVideoMaximized] = useState(false);
  const [undo, setUndo] = useState<WatchSession | null>(null);
  const manager = useRef<PlayerManager | null>(null);
  const session = data.session;
  const reportingRates = session.channels.map(channel => bitrates[channel.login]).filter((rate): rate is number => typeof rate === 'number' && Number.isFinite(rate) && rate > 0);
  const totalMBps = reportingRates.reduce((sum, rate) => sum + rate, 0) / 8000;
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

  return <div className={`app-shell${videoMaximized ? ' video-maximized' : ''}`}>
    {videoMaximized && <button className="restore-workspace" aria-label="Restore workspace" title="Restore workspace · Escape" onClick={() => setVideoMaximized(false)}>↙ Restore workspace</button>}
    {!session.sidebarOpen && !videoMaximized && <button className="reopen-sidebar sidebar-toggle" aria-label="Toggle sidebar (Ctrl+B)" title="Open sidebar · Ctrl+B" onClick={() => run('toggle-sidebar')}>☰</button>}
    {storageWarning && <div className="storage-warning" role="alert"><span>{storageWarning}</span><button onClick={() => setTransfer('backup')}>Back up data</button><button onClick={retryStorage}>Enable saving</button></div>}
    <div className="app-body">
      {session.sidebarOpen && <Sidebar bitrates={bitrates} data={data} setData={setData} add={add} remove={remove} clear={clear} refresh={login => manager.current?.reload(login)}
        reorder={(login, direction) => updateSession(s => moveChannel(s, login, direction))}
        openChat={openChat} onStreamCommand={run} onWorkspaceCommand={run} onMaximize={() => setVideoMaximized(true)} onTransfer={setTransfer} onError={setError} onNotice={setNotice} />}
      <main className="watch-workspace">
        {error && <div className="message error" role="alert"><span>{error}</span><button aria-label="Dismiss error" onClick={() => setError(null)}>×</button></div>}
        {notice && <div className="message notice" role="status"><span>{notice}</span>{undo && <button onClick={() => { updateSession(() => undo); setUndo(null); setNotice('Previous stream list restored.'); }}>Undo</button>}<button aria-label="Dismiss notice" onClick={() => { setNotice(null); setUndo(null); }}>×</button></div>}
        <div className="watch-content">
          <div className="video-region">
            <PlayerSurface onBitrates={setBitrates} session={session} managerRef={manager} patchChannel={patchChannel} remove={remove} openChat={openChat} focus={focus} setFocus={setFocus} />
            {!!session.channels.length && <div className="bandwidth-total" role="note" aria-label="Total stream bandwidth in megabytes per second" aria-description={`${reportingRates.length}/${session.channels.length} streams reporting.${reportingRates.length > 0 && reportingRates.length < session.channels.length ? ' Partial total.' : ''} Estimated Twitch playback bandwidth, not actual network download speed.`}>
              ↓ {reportingRates.length ? `${totalMBps.toFixed(2)} MB/s` : '— MB/s'}
            </div>}
          </div>
          <ChatPanel settings={session.chat} channels={session.channels} update={chat => updateSession(s => ({ ...s, chat }))} />
        </div>
      </main>
    </div>
    <TransferPanel mode={transfer} close={() => setTransfer(null)} data={data} restore={restore} originalRaw={initial.raw} applySession={s => { updateSession(() => s); setFocus(null); setNotice('Shared watch setup applied. Your saved profiles are unchanged.'); }} onError={setError} />
  </div>;
}
