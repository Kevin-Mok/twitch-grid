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
  const listeners: Array<[string, () => void]> = [];
  const eventMap: Array<[string, PlayerEvent['type']]> = [
    [Player.READY, 'ready'], [Player.ONLINE, 'online'], [Player.OFFLINE, 'offline'],
    [Player.PLAY, 'play'], [Player.PLAYING, 'playing'], [Player.PAUSE, 'pause'], [Player.PLAYBACK_BLOCKED, 'blocked'],
  ];
  const sample = () => {
    if (!ready || disposed) return;
    try {
      const qualities = player.getQualities().map(quality => typeof quality === 'string' ? quality : quality.group).filter(Boolean);
      emit({ type: 'sample', quality: player.getQuality(), qualities, muted: player.getMuted(), volume: player.getVolume(), paused: player.isPaused() });
    } catch { emit({ type: 'error', message: 'Player status is unavailable. Refresh status or reload this stream.' }); }
  };
  for (const [name, type] of eventMap) {
    const listener = () => {
      if (disposed) return;
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
