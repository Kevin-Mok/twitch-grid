import { afterEach, expect, it, vi } from 'vitest';
import { createTwitchPlayer } from './twitch';
import type { PlayerEvent, PlayerHandle } from './types';

let handle: PlayerHandle | undefined;
afterEach(() => { handle?.destroy(); handle = undefined; vi.useRealTimers(); delete window.Twitch; document.body.replaceChildren(); vi.restoreAllMocks(); });

it('samples only valid Twitch playback bitrate and expires cached snapshots without affecting status', async () => {
  vi.useFakeTimers();
  const listeners = new Map<string, () => void>();
  let stats: unknown = { playbackRate: 3100 };
  let failStats = false;
  class Player {
    static READY = 'ready'; static ONLINE = 'online'; static OFFLINE = 'offline'; static PLAY = 'play';
    static PLAYING = 'playing'; static PAUSE = 'pause'; static PLAYBACK_BLOCKED = 'blocked';
    addEventListener(event: string, listener: () => void) { listeners.set(event, listener); }
    removeEventListener(event: string) { listeners.delete(event); }
    play() {} pause() {} setMuted() {} setVolume() {} setQuality() {}
    getMuted() { return true; } getVolume() { return 0.5; }
    getQuality() { return 'auto'; } getQualities() { return [{ group: 'auto' }, { group: '720p60' }]; }
    isPaused() { return false; }
    getPlaybackStats() { if (failStats) throw new Error('unsupported'); return stats; }
  }
  window.Twitch = { Player };
  const host = document.createElement('div'); document.body.append(host);
  const events: PlayerEvent[] = [];
  handle = await createTwitchPlayer(host, 'alpha', event => events.push(event));
  listeners.get('ready')!();
  handle.sample();
  expect(events.at(-1)).toMatchObject({ type: 'sample', bitrateKbps: 3100, quality: 'auto' });
  await vi.advanceTimersByTimeAsync(8000);
  expect(events.at(-1)).toMatchObject({ type: 'sample', bitrateKbps: null });
  (stats as { playbackRate: number }).playbackRate = 2800;
  handle.sample();
  expect(events.at(-1)).toMatchObject({ type: 'sample', bitrateKbps: 2800 });
  for (const playbackRate of [6000, 0, -1, NaN, Infinity, '3000', undefined]) {
    stats = { playbackRate }; handle.sample();
    expect(events.at(-1)).toMatchObject({ type: 'sample', bitrateKbps: playbackRate === 6000 ? 6000 : null });
  }
  stats = null; handle.sample();
  expect(events.at(-1)).toMatchObject({ type: 'sample', bitrateKbps: null });
  failStats = true; handle.sample();
  expect(events.at(-1)).toMatchObject({ type: 'sample', bitrateKbps: null, quality: 'auto' });
  failStats = false;
  vi.spyOn(document, 'visibilityState', 'get').mockReturnValue('hidden');
  stats = { playbackRate: 6000 }; handle.sample();
  expect(events.at(-1)).toMatchObject({ type: 'sample', bitrateKbps: null });
  const before = events.length;
  handle.destroy(); handle = undefined;
  await vi.advanceTimersByTimeAsync(10000);
  expect(events).toHaveLength(before);
  expect(listeners.size).toBe(0);
});

it('estimates FPS within five seconds, refines recent samples and resets unusable windows', async () => {
  vi.useFakeTimers();
  const listeners = new Map<string, () => void>();
  let stats: unknown = { fps: 0 };
  let paused = false;
  let quality = 'auto';
  class Player {
    static READY = 'ready'; static ONLINE = 'online'; static OFFLINE = 'offline'; static PLAY = 'play';
    static PLAYING = 'playing'; static PAUSE = 'pause'; static PLAYBACK_BLOCKED = 'blocked';
    addEventListener(event: string, listener: () => void) { listeners.set(event, listener); }
    removeEventListener(event: string) { listeners.delete(event); }
    play() {} pause() {} setMuted() {} setVolume() {} setQuality() {}
    getMuted() { return true; } getVolume() { return 0.5; }
    getQuality() { return quality; } getQualities() { return ['auto', '360p30']; }
    isPaused() { return paused; }
    getPlaybackStats() { return stats; }
  }
  window.Twitch = { Player };
  const host = document.createElement('div'); document.body.append(host);
  const events: PlayerEvent[] = [];
  handle = await createTwitchPlayer(host, 'alpha', event => events.push(event));
  listeners.get('ready')!(); listeners.get('playing')!();
  stats = { fps: 20 };
  await vi.advanceTimersByTimeAsync(2000);
  expect(events.at(-1)).toMatchObject({ fps: 20 });
  stats = { fps: 40 };
  await vi.advanceTimersByTimeAsync(2000);
  expect(events.at(-1)).toMatchObject({ fps: 30 });
  handle.sample(); // Repeated refreshes must not overweight a cached reading.
  expect(events.at(-1)).toMatchObject({ fps: 30 });
  for (let i = 0; i < 5; i++) {
    stats = { fps: 60 };
    await vi.advanceTimersByTimeAsync(2000);
  }
  expect(events.at(-1)).toMatchObject({ fps: 60 });
  await vi.advanceTimersByTimeAsync(6000);
  expect(events.at(-1)).toMatchObject({ fps: null });
  stats = { fps: 24 }; handle.sample();
  expect(events.at(-1)).toMatchObject({ fps: 24 });
  quality = '360p30'; stats = { fps: 30 }; handle.sample();
  expect(events.at(-1)).toMatchObject({ fps: 30 });
  paused = true; handle.sample();
  expect(events.at(-1)).toMatchObject({ fps: null });
  paused = false; stats = { fps: 50 }; handle.sample();
  expect(events.at(-1)).toMatchObject({ fps: 50 });
  vi.spyOn(document, 'visibilityState', 'get').mockReturnValue('hidden');
  handle.sample();
  expect(events.at(-1)).toMatchObject({ fps: null });
  vi.restoreAllMocks();
  for (const fps of [0, -1, NaN, Infinity, '60', undefined]) {
    stats = { fps }; handle.sample();
    expect(events.at(-1)).toMatchObject({ fps: null });
  }
  stats = { fps: 25 }; handle.sample();
  expect(events.at(-1)).toMatchObject({ fps: 25 });
  listeners.get('pause')!(); stats = { fps: 45 }; handle.sample();
  expect(events.at(-1)).toMatchObject({ fps: 45 });
  vi.setSystemTime(Date.now() + 30000);
  stats = { fps: 15 }; handle.sample();
  expect(events.at(-1)).toMatchObject({ fps: 15 });
});
