import { describe, expect, it } from 'vitest';
import { PlayerManager, chooseQuality } from './manager';
import type { Channel } from '../domain';
import type { PlayerEvent, PlayerFactory, PlayerHandle } from './types';

const channel = (login: string): Channel => ({ login, muted: true, volume: 0.5, quality: null, intent: 'playing' });
const tick = () => new Promise<void>(resolve => setTimeout(resolve, 0));
function fixture() {
  const surface = document.createElement('div');
  document.body.append(surface);
  const calls: string[] = [];
  const emitters = new Map<string, (event: PlayerEvent) => void>();
  const observed: Array<[string, Partial<Channel>]> = [];
  const factory: PlayerFactory = async (host, login, emit) => {
    const iframe = document.createElement('iframe');
    iframe.title = login;
    host.append(iframe);
    emitters.set(login, emit);
    calls.push(`create:${login}`);
    const handle: PlayerHandle = {
      play: () => calls.push(`play:${login}`), pause: () => calls.push(`pause:${login}`),
      setMuted: value => calls.push(`mute:${login}:${value}`),
      setVolume: value => calls.push(`volume:${login}:${value}`),
      setQuality: value => calls.push(`quality:${login}:${value}`),
      sample: () => calls.push(`sample:${login}`), destroy: () => { calls.push(`destroy:${login}`); iframe.remove(); },
    };
    return handle;
  };
  const manager = new PlayerManager(surface, factory, () => {}, (login, patch) => observed.push([login, patch]));
  return { manager, surface, calls, emitters, observed };
}

describe('persistent player manager', () => {
  it('reports observed startup pause without erasing the requested playback intent', async () => {
    const f = fixture(); f.manager.sync([channel('alpha')], 'auto'); await tick();
    f.emitters.get('alpha')!({ type: 'ready' });
    f.emitters.get('alpha')!({ type: 'sample', muted: true, volume: 0.5, paused: true, quality: 'auto', qualities: ['auto'] });
    expect(f.manager.slots()[0].snapshot.playback).toBe('paused');
    expect(f.manager.slots()[0].channel.intent).toBe('playing');
    f.manager.destroy();
  });
  it('does not let a delayed PLAYING event override explicit paused intent', async () => {
    const f = fixture();
    f.manager.sync([channel('alpha')], 'auto'); await tick();
    f.emitters.get('alpha')!({ type: 'ready' });
    f.manager.sync([{ ...channel('alpha'), intent: 'paused' }], 'auto');
    f.emitters.get('alpha')!({ type: 'playing' });
    expect(f.manager.slots()[0].channel.intent).toBe('paused');
    expect(f.manager.slots()[0].snapshot.playback).toBe('paused');
    expect(f.observed).not.toContainEqual(['alpha', { intent: 'playing' }]);
    f.manager.destroy();
  });
  it('does not overwrite saved audio from stale startup samples before setters acknowledge', async () => {
    const f = fixture();
    f.manager.sync([{ ...channel('alpha'), muted: false, volume: 0.3 }], 'auto'); await tick();
    f.emitters.get('alpha')!({ type: 'ready' });
    f.emitters.get('alpha')!({ type: 'sample', muted: true, volume: 1, paused: false, quality: 'auto', qualities: ['auto'] });
    expect(f.observed).toEqual([]);
    expect(f.manager.slots()[0].channel).toMatchObject({ muted: false, volume: 0.3 });
    f.emitters.get('alpha')!({ type: 'sample', muted: false, volume: 0.3, paused: false, quality: 'auto', qualities: ['auto'] });
    f.emitters.get('alpha')!({ type: 'sample', muted: true, volume: 0.3, paused: false, quality: 'auto', qualities: ['auto'] });
    expect(f.observed).toContainEqual(['alpha', { muted: true }]);
    f.manager.destroy();
  });
  it('retains exact iframe hosts and DOM order across reorder and overlapping sessions', async () => {
    const f = fixture();
    f.manager.sync(['alpha', 'bravo', 'charlie', 'delta', 'echo'].map(channel), 'auto');
    await tick();
    const frames = [...f.surface.querySelectorAll('iframe')];
    expect(frames).toHaveLength(5);
    f.manager.sync(['echo', 'charlie', 'alpha', 'delta', 'bravo'].map(channel), 'auto');
    await tick();
    expect([...f.surface.querySelectorAll('iframe')]).toEqual(frames);
    f.manager.sync(['bravo', 'alpha', 'foxtrot'].map(channel), 'auto');
    await tick();
    expect(f.surface.querySelector('iframe[title="alpha"]')).toBe(frames[0]);
    expect(f.surface.querySelector('iframe[title="bravo"]')).toBe(frames[1]);
    expect(f.calls.filter(x => x.startsWith('create:'))).toHaveLength(6);
    f.manager.destroy();
  });
  it('preserves manual pause through offline/online and idempotent synchronization', async () => {
    const f = fixture();
    f.manager.sync([channel('alpha')], 'auto'); await tick();
    f.emitters.get('alpha')!({ type: 'ready' });
    f.emitters.get('alpha')!({ type: 'pause' });
    expect(f.observed).toContainEqual(['alpha', { intent: 'paused' }]);
    f.manager.sync([{ ...channel('alpha'), intent: 'paused' }], 'auto');
    const plays = f.calls.filter(x => x.startsWith('play:')).length;
    f.emitters.get('alpha')!({ type: 'offline' });
    f.emitters.get('alpha')!({ type: 'online' });
    f.manager.sync([{ ...channel('alpha'), intent: 'paused' }], 'auto');
    expect(f.calls.filter(x => x.startsWith('play:'))).toHaveLength(plays);
    expect(f.manager.slots()[0].snapshot.live).toBe('online');
    f.manager.destroy();
  });
  it('isolates per-stream commands and reloads only an explicit target', async () => {
    const f = fixture();
    f.manager.sync([channel('alpha'), channel('bravo')], 'auto'); await tick();
    f.emitters.get('alpha')!({ type: 'ready' }); f.emitters.get('bravo')!({ type: 'ready' });
    const before = f.calls.length;
    f.manager.sync([{ ...channel('alpha'), muted: false, volume: 0.8 }, channel('bravo')], 'auto');
    expect(f.calls.slice(before)).toEqual(['mute:alpha:false', 'volume:alpha:0.8']);
    const bravo = f.surface.querySelector('iframe[title="bravo"]');
    f.manager.reload('alpha'); await tick();
    expect(f.surface.querySelector('iframe[title="bravo"]')).toBe(bravo);
    expect(f.calls.filter(x => x === 'create:alpha')).toHaveLength(2);
    f.manager.destroy();
  });
  it('treats provider failure as error without a reload loop', async () => {
    const f = fixture();
    f.manager.sync([channel('alpha')], 'auto'); await tick();
    f.emitters.get('alpha')!({ type: 'error', message: 'Player unavailable' });
    expect(f.manager.slots()[0].snapshot.live).toBe('error');
    f.manager.refresh('alpha');
    expect(f.calls.filter(x => x.startsWith('create:'))).toHaveLength(1);
    f.emitters.get('alpha')!({ type: 'sample', muted: true, volume: 0.5, paused: true, quality: 'auto', qualities: ['auto'] });
    expect(f.manager.slots()[0].snapshot.live).toBe('unknown');
    expect(f.manager.slots()[0].snapshot.error).toBeNull();
    f.manager.destroy();
  });
  it('applies preference when READY and qualities arrive before the asynchronous handle', async () => {
    const surface = document.createElement('div'); document.body.append(surface);
    const qualities: string[] = [];
    const factory: PlayerFactory = async (_host, _channel, emit) => {
      emit({ type: 'ready' });
      emit({ type: 'sample', muted: true, volume: 0.5, paused: true, quality: 'auto', qualities: ['auto', '720p60'] });
      return { play() {}, pause() {}, setMuted() {}, setVolume() {}, setQuality: q => qualities.push(q), sample() {}, destroy() {} };
    };
    const manager = new PlayerManager(surface, factory, () => {}, () => {});
    manager.sync([channel('alpha')], '720p60'); await tick();
    expect(qualities).toEqual(['720p60']); manager.destroy();
  });
});

it('chooses supported quality with an explicit automatic fallback', () => {
  expect(chooseQuality('720p60', ['auto', 'chunked', '720p60'])).toBe('720p60');
  expect(chooseQuality('1080p60', ['auto', '480p'])).toBe('auto');
  expect(chooseQuality('720p60', ['chunked', '480p'])).toBe('chunked');
  expect(chooseQuality('auto', [])).toBeNull();
});
