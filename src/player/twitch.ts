import { embedParents } from '../chat';
import type { PlayerEvent, PlayerFactory } from './types';

interface TwitchInstance {
  addEventListener(event: string, listener: () => void): void;
  removeEventListener(event: string, listener: () => void): void;
  play(): void; pause(): void;
  setMuted(muted: boolean): void; getMuted(): boolean;
  setVolume(volume: number): void; getVolume(): number;
  setQuality(quality: string): void; getQuality(): string;
  getQualities(): Array<string | { group: string; name?: string }>;
  isPaused(): boolean;
  getPlaybackStats?(): unknown;
}
interface TwitchConstructor {
  new (elementId: string, options: { channel: string; width: string; height: string; parent: string[]; autoplay: boolean; muted: boolean }): TwitchInstance;
  READY: string; ONLINE: string; OFFLINE: string; PLAY: string; PLAYING: string; PAUSE: string; PLAYBACK_BLOCKED: string;
}
declare global { interface Window { Twitch?: { Player: TwitchConstructor } } }

let sdk: Promise<TwitchConstructor> | undefined;
let serial = 0;
function loadSDK(): Promise<TwitchConstructor> {
  if (window.Twitch?.Player) return Promise.resolve(window.Twitch.Player);
  if (sdk) return sdk;
  sdk = new Promise<TwitchConstructor>((resolve, reject) => {
    const script = document.createElement('script');
    script.src = 'https://player.twitch.tv/js/embed/v1.js';
    script.async = true;
    const timer = window.setTimeout(() => finish(new Error('Twitch took too long to load. Check your connection, then reload this stream.')), 20000);
    const finish = (error?: Error) => {
      window.clearTimeout(timer);
      script.onload = null; script.onerror = null;
      if (error || !window.Twitch?.Player) {
        script.remove(); sdk = undefined;
        reject(error ?? new Error('Twitch player API is unavailable.'));
      } else resolve(window.Twitch.Player);
    };
    script.onload = () => finish();
    script.onerror = () => finish(new Error('Twitch could not load. Check your connection or content blocker, then reload this stream.'));
    document.head.append(script);
  });
  return sdk;
}

export const createTwitchPlayer: PlayerFactory = async (host, channel, emit) => {
  const Player = await loadSDK();
  if (!host.isConnected) throw new Error('Player was removed before loading completed.');
  host.id = `twitch-player-${++serial}`;
  const player = new Player(host.id, {
    channel, width: '100%', height: '100%',
    parent: embedParents(window.location.hostname, import.meta.env.VITE_TWITCH_PARENTS ?? ''),
    autoplay: false, muted: true,
  });
  let ready = false;
  let disposed = false;
  let previousStats: unknown;
  let previousRate: unknown;
  let statsChangedAt = 0;
  let previousFps: unknown;
  let previousFpsStats: unknown;
  let fpsChangedAt = 0;
  let fpsQuality = '';
  const fpsSamples: Array<{ at: number; value: number }> = [];
  const listeners: Array<[string, () => void]> = [];
  const eventMap: Array<[string, PlayerEvent['type']]> = [
    [Player.READY, 'ready'], [Player.ONLINE, 'online'], [Player.OFFLINE, 'offline'],
    [Player.PLAY, 'play'], [Player.PLAYING, 'playing'], [Player.PAUSE, 'pause'], [Player.PLAYBACK_BLOCKED, 'blocked'],
  ];
  const sample = () => {
    if (!ready || disposed) return;
    try {
      let bitrateKbps: number | null = null;
      let fps: number | null = null;
      const quality = player.getQuality();
      const paused = player.isPaused();
      try {
        const stats = player.getPlaybackStats?.();
        const reportedFps = stats && typeof stats === 'object' && 'fps' in stats ? stats.fps : undefined;
        const now = Date.now();
        if (stats !== previousFpsStats || reportedFps !== previousFps) {
          previousFpsStats = stats; previousFps = reportedFps; fpsChangedAt = now;
        }
        if (quality !== fpsQuality) { fpsSamples.length = 0; fpsQuality = quality; }
        if (!paused && document.visibilityState === 'visible' && now - fpsChangedAt < 6000 && typeof reportedFps === 'number' && Number.isFinite(reportedFps) && reportedFps > 0) {
          while (fpsSamples.length && now - fpsSamples[0].at >= 10000) fpsSamples.shift();
          if (!fpsSamples.length || now - fpsSamples[fpsSamples.length - 1].at >= 1000) {
            fpsSamples.push({ at: now, value: reportedFps });
            if (fpsSamples.length > 5) fpsSamples.shift();
          }
          fps = fpsSamples.reduce((sum, sample) => sum + sample.value, 0) / fpsSamples.length;
        }
        const reportedRate = stats && typeof stats === 'object' && 'playbackRate' in stats ? stats.playbackRate : undefined;
        // The SDK caches stats; object replacement or a bitrate change refreshes this conservative guard.
        if (stats !== previousStats || reportedRate !== previousRate) {
          previousStats = stats; previousRate = reportedRate; statsChangedAt = Date.now();
        }
        if (document.visibilityState === 'visible' && Date.now() - statsChangedAt < 6000 && typeof reportedRate === 'number' && Number.isFinite(reportedRate) && reportedRate > 0) bitrateKbps = reportedRate;
      } catch { /* Unsupported playback stats must not hide otherwise usable player status. */ }
      if (fps === null) fpsSamples.length = 0;
      const qualities = player.getQualities().map(quality => typeof quality === 'string' ? quality : quality.group).filter(Boolean);
      emit({ type: 'sample', quality, qualities, muted: player.getMuted(), volume: player.getVolume(), paused, bitrateKbps, fps });
    } catch { fpsSamples.length = 0; emit({ type: 'error', message: 'Player status is unavailable. Refresh status or reload this stream.' }); }
  };
  for (const [name, type] of eventMap) {
    const listener = () => {
      if (disposed) return;
      fpsSamples.length = 0;
      if (type === 'ready') { ready = true; window.clearTimeout(readyTimer); }
      emit({ type } as PlayerEvent);
      if (type === 'playing' || type === 'online') sample();
    };
    listeners.push([name, listener]); player.addEventListener(name, listener);
  }
  const readyTimer = window.setTimeout(() => {
    if (!ready && !disposed) emit({ type: 'error', message: 'Twitch has not responded. Check the player message, your connection or content blocker.' });
  }, 25000);
  const sampleTimer = window.setInterval(sample, 2000);
  return {
    play: () => { if (ready) player.play(); },
    pause: () => { if (ready) player.pause(); },
    setMuted: value => { if (ready) player.setMuted(value); },
    setVolume: value => { if (ready) player.setVolume(value); },
    setQuality: value => { if (ready) player.setQuality(value); },
    sample,
    destroy() {
      disposed = true;
      window.clearTimeout(readyTimer); window.clearInterval(sampleTimer);
      for (const [event, listener] of listeners) player.removeEventListener(event, listener);
      // Removing our iframe is the SDK's supported DOM lifetime boundary; it exposes no destroy method.
      host.replaceChildren();
    },
  };
};
