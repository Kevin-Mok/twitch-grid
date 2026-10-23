import type { Channel } from '../domain';
import type { PlayerEvent, PlayerFactory, PlayerHandle, PlayerSlot, PlayerSnapshot } from './types';
import { twitchStatusProvider } from './status';

export function chooseQuality(preference: string, qualities: string[]): string | null {
  if (qualities.includes(preference)) return preference;
  const thirtyFps = /^\d+p$/.test(preference) ? `${preference}30` : null;
  return (thirtyFps && qualities.includes(thirtyFps) ? thirtyFps : null)
    ?? (qualities.includes('auto') ? 'auto' : qualities[0] ?? null);
}

type Entry = PlayerSlot & { handle?: PlayerHandle; ready: boolean; disposed: boolean; requestedQuality: string | null; qualityAttempts: number | null; pendingMuted: boolean | null; pendingVolume: number | null };
const initialSnapshot = (): PlayerSnapshot => ({ live: 'unknown', playback: 'loading', quality: 'unknown', qualities: [], fallback: null, error: null, lastSignal: Date.now(), audioPending: false, bitrateKbps: null, fps: null });

export class PlayerManager {
  private entries = new Map<string, Entry>();
  private globalQuality = 'auto';
  private priority: string | null = null;
  private closed = false;

  constructor(
    private surface: HTMLElement,
    private factory: PlayerFactory,
    private notify: () => void,
    private observed: (login: string, patch: Partial<Channel>) => void,
  ) {}

  sync(channels: Channel[], globalQuality: string, priority: string | null = null): void {
    if (this.closed) return;
    const qualityChanged = this.globalQuality !== globalQuality;
    const nextPriority = channels.some(channel => channel.login === priority) ? priority : null;
    const priorityChanged = this.priority !== nextPriority;
    this.priority = nextPriority;
    this.globalQuality = globalQuality;
    const keep = new Set(channels.map(channel => channel.login));
    for (const [login, entry] of this.entries) {
      if (!keep.has(login)) { this.dispose(entry); this.entries.delete(login); }
    }
    for (const channel of channels) {
      const entry = this.entries.get(channel.login);
      if (!entry) { this.create(channel); continue; }
      const previous = entry.channel;
      entry.channel = { ...channel };
      if (priorityChanged || (qualityChanged && channel.quality === null) || previous.quality !== channel.quality) entry.requestedQuality = null;
      if (entry.ready && entry.handle) {
        if (previous.muted !== channel.muted) { entry.pendingMuted = channel.muted; entry.handle.setMuted(channel.muted); }
        if (previous.volume !== channel.volume) { entry.pendingVolume = channel.volume; entry.handle.setVolume(channel.volume); }
        entry.snapshot.audioPending = entry.pendingMuted !== null || entry.pendingVolume !== null;
        if (previous.intent !== channel.intent) this.applyIntent(entry);
        this.applyQuality(entry);
      }
    }
  }

  slots(): PlayerSlot[] { return [...this.entries.values()]; }

  private create(channel: Channel): void {
    const element = document.createElement('article');
    element.className = 'player-tile';
    element.dataset.channel = channel.login;
    element.setAttribute('aria-label', `${channel.login} player`);
    const header = document.createElement('div'); header.className = 'tile-header';
    const host = document.createElement('div'); host.className = 'video-host';
    element.append(header, host);
    const entry: Entry = { channel: { ...channel }, element, host, header, snapshot: initialSnapshot(), ready: false, disposed: false, requestedQuality: null, qualityAttempts: null, pendingMuted: channel.muted, pendingVolume: channel.volume };
    this.entries.set(channel.login, entry);
    this.surface.append(element);
    this.factory(host, channel.login, event => this.event(entry, event)).then(handle => {
      if (entry.disposed) { handle.destroy(); return; }
      entry.handle = handle;
      if (entry.ready) this.initialize(entry);
      this.notify();
    }).catch(error => {
      if (!entry.disposed) this.event(entry, { type: 'error', message: error instanceof Error ? error.message : 'Unable to load Twitch player.' });
    });
  }

  private initialize(entry: Entry): void {
    const handle = entry.handle!;
    entry.pendingMuted = entry.channel.muted;
    entry.pendingVolume = entry.channel.volume;
    entry.snapshot.audioPending = true;
    handle.setMuted(entry.channel.muted);
    handle.setVolume(entry.channel.volume);
    this.applyIntent(entry);
    handle.sample();
    this.applyQuality(entry);
  }

  private applyIntent(entry: Entry): void {
    if (entry.channel.intent === 'paused') entry.handle?.pause();
    else entry.handle?.play();
  }

  private applyQuality(entry: Entry, retry = false): void {
    let preference: string | null = entry.channel.quality ?? this.globalQuality;
    if (this.priority) {
      const videoQualities = entry.snapshot.qualities.filter(quality => /^\d+p\d*(?:\.\d+)?$/.test(quality))
        .sort((a, b) => parseInt(a) - parseInt(b) || Number(a.split('p')[1] || 0) - Number(b.split('p')[1] || 0));
      const fallback = entry.snapshot.qualities.includes('auto') ? 'auto' : entry.snapshot.qualities.includes('chunked') ? 'chunked' : null;
      preference = entry.channel.login === this.priority
        ? entry.snapshot.qualities.includes('chunked') ? 'chunked' : videoQualities.at(-1) ?? fallback
        : videoQualities[0] ?? fallback;
    }
    if (!preference) return;
    const selected = chooseQuality(preference, entry.snapshot.qualities);
    entry.snapshot.fallback = selected && selected !== preference && selected !== `${preference}30` ? `${preference} unavailable; using ${selected}` : null;
    if (!selected || !entry.ready || !entry.handle) return;
    if (entry.requestedQuality !== selected) {
      entry.requestedQuality = selected; entry.qualityAttempts = 1;
      entry.handle.setQuality(selected);
      return;
    }
    if (!retry || entry.qualityAttempts === null) return;
    if (entry.snapshot.quality === selected) { entry.qualityAttempts = null; return; }
    // Retry only unacknowledged requests; native quality changes after acknowledgement remain usable.
    if (entry.qualityAttempts < 3) {
      entry.qualityAttempts++;
      entry.handle.setQuality(selected);
    }
  }

  private event(entry: Entry, event: PlayerEvent): void {
    if (entry.disposed) return;
    const state = entry.snapshot;
    const reconnecting = event.type === 'online' && state.live === 'offline';
    state.live = twitchStatusProvider.observe(state.live, event.type);
    if (event.type !== 'sample') { state.lastSignal = Date.now(); state.bitrateKbps = null; state.fps = null; }
    switch (event.type) {
      case 'ready':
        if (!entry.ready) { entry.ready = true; if (entry.handle) this.initialize(entry); }
        break;
      case 'online':
        state.error = null;
        if (reconnecting) entry.requestedQuality = null;
        if (entry.channel.intent === 'paused') entry.handle?.pause();
        break;
      case 'offline': state.error = null; break;
      case 'play':
        state.playback = 'buffering';
        break;
      case 'playing':
        state.error = null;
        if (entry.channel.intent === 'paused') {
          state.playback = 'paused'; entry.handle?.pause();
        } else state.playback = 'playing';
        break;
      case 'pause':
        state.playback = 'paused';
        if (state.live !== 'offline' && state.live !== 'error' && entry.ready && entry.channel.intent !== 'paused') {
          entry.channel.intent = 'paused'; this.observed(entry.channel.login, { intent: 'paused' });
        }
        break;
      case 'blocked': state.playback = 'blocked'; break;
      case 'error': state.playback = 'error'; state.error = event.message; break;
      case 'sample': {
        state.error = null;
        if (state.playback !== 'blocked') {
          if (event.paused) state.playback = 'paused';
          else if (state.playback === 'error' || state.playback === 'loading') state.playback = 'buffering';
        }
        state.quality = event.quality || 'unknown';
        state.qualities = [...event.qualities];
        state.bitrateKbps = state.live === 'online' && state.playback === 'playing' && typeof event.bitrateKbps === 'number' && Number.isFinite(event.bitrateKbps) && event.bitrateKbps > 0 ? event.bitrateKbps : null;
        state.fps = state.live === 'online' && state.playback === 'playing' && typeof event.fps === 'number' && Number.isFinite(event.fps) && event.fps > 0 ? event.fps : null;
        const patch: Partial<Channel> = {};
        if (entry.pendingMuted !== null) {
          if (event.muted === entry.pendingMuted) entry.pendingMuted = null;
        } else if (entry.channel.muted !== event.muted) patch.muted = event.muted;
        if (entry.pendingVolume !== null) {
          if (Math.abs(event.volume - entry.pendingVolume) <= 0.015) entry.pendingVolume = null;
        } else if (Math.abs(entry.channel.volume - event.volume) > 0.015) patch.volume = event.volume;
        state.audioPending = entry.pendingMuted !== null || entry.pendingVolume !== null;
        if (Object.keys(patch).length) { Object.assign(entry.channel, patch); this.observed(entry.channel.login, patch); }
        this.applyQuality(entry, true);
        break;
      }
    }
    this.notify();
  }

  start(login: string): void {
    const entry = this.entries.get(login);
    if (!entry) return;
    entry.channel.intent = 'playing';
    this.observed(login, { intent: 'playing' });
    entry.handle?.play();
  }

  reload(login: string): void {
    const entry = this.entries.get(login);
    if (!entry) return;
    const channel = { ...entry.channel };
    this.dispose(entry); this.entries.delete(login); this.create(channel); this.notify();
  }

  refresh(login: string): void { this.entries.get(login)?.handle?.sample(); }

  private dispose(entry: Entry): void {
    entry.disposed = true;
    entry.handle?.destroy();
    entry.element.remove();
  }

  destroy(): void {
    this.closed = true;
    for (const entry of this.entries.values()) this.dispose(entry);
    this.entries.clear();
  }
}
