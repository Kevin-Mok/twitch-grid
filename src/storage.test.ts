import { describe, expect, it } from 'vitest';
import { addChannels, defaultData } from './domain';
import { loadData, saveData, STORAGE_KEY } from './storage';

function memoryStorage(initial: Record<string, string> = {}) {
  const values = new Map(Object.entries(initial));
  return {
    getItem: (key: string) => values.get(key) ?? null,
    setItem: (key: string, value: string) => { values.set(key, value); },
  };
}

describe('local persistence', () => {
  it('round-trips validated data through the namespaced storage key', () => {
    const storage = memoryStorage();
    const data = defaultData();
    data.session = addChannels(data.session, 'alpha,beta');
    expect(saveData(storage, data)).toEqual({ ok: true, error: null });
    expect(JSON.parse(storage.getItem('twitch-multiplayer:v2') ?? '')).toEqual(data);
    expect(loadData(storage)).toMatchObject({ data, warning: null, blocked: false });
  });

  it('returns defaults for a new browser without treating it as broken storage', () => {
    expect(loadData(memoryStorage())).toEqual({ data: defaultData(), warning: null, blocked: false, raw: null });
  });

  it.each(['{broken', JSON.stringify({ version: 99 }), JSON.stringify({ version: 2 }), ''])
  ('preserves malformed/future data for explicit recovery', (raw) => {
    const storage = memoryStorage({ [STORAGE_KEY]: raw });
    const result = loadData(storage);
    expect(result.blocked).toBe(true);
    expect(result.warning).toEqual(expect.any(String));
    expect(result.raw).toBe(raw);
    expect(result.data).toEqual(defaultData());
    expect(storage.getItem(STORAGE_KEY)).toBe(raw);
  });

  it('reports unavailable reads and failed writes without throwing', () => {
    const storage = {
      getItem: () => { throw new DOMException('Blocked', 'SecurityError'); },
      setItem: () => { throw new DOMException('Full', 'QuotaExceededError'); },
    };
    expect(loadData(storage)).toMatchObject({ blocked: true, raw: null, data: defaultData(), warning: expect.stringMatching(/storage|browser/i) });
    expect(saveData(storage, defaultData())).toMatchObject({ ok: false, error: expect.stringMatching(/storage|space|quota/i) });
  });

  it('rejects invalid state before changing existing storage', () => {
    const storage = memoryStorage({ [STORAGE_KEY]: 'original' });
    const invalid = { ...defaultData(), version: 9 };
    expect(saveData(storage, invalid as unknown as ReturnType<typeof defaultData>).ok).toBe(false);
    expect(storage.getItem(STORAGE_KEY)).toBe('original');
  });

  it('migrates only the documented namespaced v1 shape without touching its original', () => {
    const raw = JSON.stringify({ version: 1, channels: ['beta', 'alpha'], globalQuality: '720p' });
    const storage = memoryStorage({ 'twitch-multiplayer:v1': raw });
    const result = loadData(storage);
    expect(result.blocked).toBe(false);
    expect(result.warning).toMatch(/migrat/i);
    expect(result.data.session.channels.map((channel) => channel.login)).toEqual(['beta', 'alpha']);
    expect(result.data.session.globalQuality).toBe('720p');
    expect(storage.getItem('twitch-multiplayer:v1')).toBe(raw);
    expect(storage.getItem(STORAGE_KEY)).toBeNull();
  });

  it.each([
    { version: 1, channels: ['alpha', 'alpha'] },
    { version: 1, channels: ['alpha'], token: 'unknown' },
    { version: 1, channels: ['ALPHA'] },
    { version: 2, channels: [] },
  ])('blocks unsupported legacy drift %#', (legacy) => {
    const storage = memoryStorage({ 'twitch-multiplayer:v1': JSON.stringify(legacy) });
    expect(loadData(storage).blocked).toBe(true);
    expect(storage.getItem(STORAGE_KEY)).toBeNull();
  });

  it('never falls back to old data when v2 exists but is malformed', () => {
    const storage = memoryStorage({ [STORAGE_KEY]: 'broken', 'twitch-multiplayer:v1': JSON.stringify({ version: 1, channels: ['alpha'] }) });
    expect(loadData(storage)).toMatchObject({ blocked: true, raw: 'broken' });
  });
});
