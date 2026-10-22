import type { Channel } from '../domain';
import type { PlayerEvent, PlayerFactory, PlayerHandle, PlayerSlot, PlayerSnapshot } from './types';
import { twitchStatusProvider } from './status';

export function chooseQuality(preference: string, qualities: string[]): string | null {
  return qualities.includes(preference) ? preference : qualities.includes('auto') ? 'auto' : qualities[0] ?? null;
}

type Entry = PlayerSlot & { handle?: PlayerHandle; ready: boolean; disposed: boolean; appliedQuality: string | null; pendingMuted: boolean | null; pendingVolume: number | null };
const initialSnapshot = (): PlayerSnapshot => ({ live: 'unknown', playback: 'loading', quality: 'unknown', qualities: [], fallback: null, error: null, lastSignal: Date.now(), audioPending: false });

export class PlayerManager {
  private entries = new Map<string, Entry>();
  private globalQuality = 'auto';
  private closed = false;

  constructor(
    private surface: HTMLElement,
    private factory: PlayerFactory,
    private notify: () => void,
    private observed: (login: string, patch: Partial<Channel>) => void,
  ) {}

  sync(channels: Channel[], globalQuality: string): void {
    if (this.closed) return;
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
    const entry: Entry = { channel: { ...channel }, element, host, header, snapshot: initialSnapshot(), ready: false, disposed: false, appliedQuality: null, pendingMuted: channel.muted, pendingVolume: channel.volume };
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

  private applyQuality(entry: Entry): void {
    const preference = entry.channel.quality ?? this.globalQuality;
    const selected = chooseQuality(preference, entry.snapshot.qualities);
    entry.snapshot.fallback = selected && selected !== preference ? `${preference} unavailable; using ${selected}` : null;
    if (selected && entry.appliedQuality !== selected && entry.ready && entry.handle) {
      entry.appliedQuality = selected;
      entry.handle.setQuality(selected);
    }
  }

  private event(entry: Entry, event: PlayerEvent): void {
    if (entry.disposed) return;
    const state = entry.snapshot;
    state.live = twitchStatusProvider.observe(state.live, event.type);
    if (event.type !== 'sample') state.lastSignal = Date.now();
    switch (event.type) {
      case 'ready':
        if (!entry.ready) { entry.ready = true; if (entry.handle) this.initialize(entry); }
        break;
      case 'online':
        state.error = null;
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
        const patch: Partial<Channel> = {};
        if (entry.pendingMuted !== null) {
          if (event.muted === entry.pendingMuted) entry.pendingMuted = null;
        } else if (entry.channel.muted !== event.muted) patch.muted = event.muted;
        if (entry.pendingVolume !== null) {
          if (Math.abs(event.volume - entry.pendingVolume) <= 0.015) entry.pendingVolume = null;
        } else if (Math.abs(entry.channel.volume - event.volume) > 0.015) patch.volume = event.volume;
        state.audioPending = entry.pendingMuted !== null || entry.pendingVolume !== null;
        if (Object.keys(patch).length) { Object.assign(entry.channel, patch); this.observed(entry.channel.login, patch); }
        this.applyQuality(entry);
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
