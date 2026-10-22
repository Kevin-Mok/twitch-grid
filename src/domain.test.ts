import { describe, expect, it } from 'vitest';
import {
  addChannels, decodeShare, defaultData, defaultSession, encodeShare, moveChannel,
  newChannel, normalizeChannel, parseBackup, restoreBackup, validateData,
  type AppData,
} from './domain';

function populatedData(): AppData {
  return {
    version: 2,
    session: {
      channels: [
        { login: 'alpha', muted: false, volume: 0.25, quality: '720p60', intent: 'paused' },
        { login: 'beta', muted: true, volume: 1, quality: null, intent: 'playing' },
      ],
      globalQuality: '480p', hideOffline: true, sidebarOpen: false,
      chat: { open: true, channel: 'beta', width: 360 }, layout: 2,
    },
    profiles: [{
      id: 'profile-one', name: 'Evening streams',
      session: {
        channels: [{ login: 'gamma', muted: true, volume: 0.5, quality: null, intent: 'playing' }],
        globalQuality: 'auto', hideOffline: false, sidebarOpen: true,
        chat: { open: false, channel: null, width: 340 }, layout: 'auto',
      },
    }],
    activeProfileId: 'profile-one',
  };
}

describe('channel commands', () => {
  it.each([
    ['  @Alpha_1  ', 'alpha_1'], ['https://www.twitch.tv/ALPHA/', 'alpha'],
    ['twitch.tv/beta?ref=share', 'beta'], ['https://m.twitch.tv/xqc#live', 'xqc'],
  ])('normalizes %s', (input, expected) => {
    expect(normalizeChannel(input)).toBe(expected);
  });

  it.each(['', 'two words', 'with-dash', 'a'.repeat(26), 'https://evil.test/alpha',
    'https://twitch.tv/alpha/videos', 'https://twitch.tv/directory',
    'https://twitch.tv:8080/alpha', 'javascript:alert(1)', 'αlpha'])
  ('rejects invalid channel input %s', (input) => {
    expect(() => normalizeChannel(input)).toThrow(/channel|Twitch/i);
  });

  it('rejects Twitch channel URLs containing userinfo', () => {
    const url = new URL('https://twitch.tv/alpha');
    url.username = 'example';
    expect(() => normalizeChannel(url.href)).toThrow(/channel|Twitch/i);
  });

  it('adds in order, deduplicates, and defaults new streams to muted playback intent', () => {
    const session = populatedData().session;
    const result = addChannels(session, ' ALPHA, twitch.tv/gamma\n@delta beta');
    expect(result.channels.map((channel) => channel.login)).toEqual(['alpha', 'beta', 'gamma', 'delta']);
    expect(result.channels[0]).toEqual({ ...session.channels[0], displayName: 'ALPHA' });
    expect(result.channels[2]).toEqual({ login: 'gamma', muted: true, volume: 1, quality: null, intent: 'playing' });
    expect(session.channels).toHaveLength(2);
    expect(newChannel(' BETA ')).toEqual({ login: 'beta', displayName: 'BETA', muted: true, volume: 1, quality: null, intent: 'playing' });
  });

  it('rejects an invalid batch without adding its valid prefix', () => {
    const session = populatedData().session;
    expect(() => addChannels(session, 'gamma,not-a-login')).toThrow(/channel|Twitch/i);
    expect(session.channels.map((channel) => channel.login)).toEqual(['alpha', 'beta']);
  });

  it('bounds the channel list after deduplication', () => {
    const session = addChannels(defaultSession(), Array.from({ length: 32 }, (_, i) => `user${i}`).join(','));
    expect(addChannels(session, 'user0').channels).toHaveLength(32);
    expect(() => addChannels(session, 'extra')).toThrow(/32/);
  });

  it('reorders without changing channel settings and leaves boundary moves unchanged', () => {
    const session = populatedData().session;
    const moved = moveChannel(session, 'beta', -1);
    expect(moved.channels.map((channel) => channel.login)).toEqual(['beta', 'alpha']);
    expect(moved.channels[1]).toBe(session.channels[0]);
    expect(moveChannel(session, 'alpha', -1)).toBe(session);
    expect(moveChannel(session, 'missing', 1)).toBe(session);
  });
});

describe('validated backups', () => {
  it('round-trips ordered profiles and all private local settings without sharing references', () => {
    const data = populatedData();
    const result = parseBackup(JSON.stringify(data));
    expect(result).toEqual(data);
    expect(result.session).not.toBe(data.session);
    expect(validateData(result)).toEqual(data);
  });

  it('creates independent defaults', () => {
    const data = defaultData();
    data.session.chat.width = 500;
    expect(defaultData().session.chat.width).not.toBe(500);
    expect(defaultSession().channels).toEqual([]);
  });

  it.each([
    ['future version', (data: AppData) => ({ ...data, version: 3 })],
    ['unknown fields', (data: AppData) => ({ ...data, token: 'private' })],
    ['duplicate profiles', (data: AppData) => ({ ...data, profiles: [...data.profiles, ...data.profiles] })],
    ['missing active profile', (data: AppData) => ({ ...data, activeProfileId: 'missing' })],
    ['string boolean', (data: AppData) => ({ ...data, session: { ...data.session, hideOffline: 'false' } })],
    ['out of bounds layout', (data: AppData) => ({ ...data, session: { ...data.session, layout: 5 } })],
    ['duplicate channel', (data: AppData) => ({ ...data, session: { ...data.session, channels: [data.session.channels[0], data.session.channels[0]] } })],
    ['invalid stored login', (data: AppData) => ({ ...data, session: { ...data.session, channels: [{ ...data.session.channels[0], login: 'ALPHA' }] } })],
    ['invalid volume', (data: AppData) => ({ ...data, session: { ...data.session, channels: [{ ...data.session.channels[0], volume: 1.1 }] } })],
    ['string volume', (data: AppData) => ({ ...data, session: { ...data.session, channels: [{ ...data.session.channels[0], volume: '0.5' }] } })],
    ['NaN volume', (data: AppData) => ({ ...data, session: { ...data.session, channels: [{ ...data.session.channels[0], volume: NaN }] } })],
    ['invalid intent', (data: AppData) => ({ ...data, session: { ...data.session, channels: [{ ...data.session.channels[0], intent: 'buffering' }] } })],
    ['chat to removed channel', (data: AppData) => ({ ...data, session: { ...data.session, chat: { ...data.session.chat, channel: 'missing' } } })],
    ['oversized chat', (data: AppData) => ({ ...data, session: { ...data.session, chat: { ...data.session.chat, width: 9000 } } })],
    ['oversized quality', (data: AppData) => ({ ...data, session: { ...data.session, globalQuality: 'q'.repeat(65) } })],
    ['blank profile name', (data: AppData) => ({ ...data, profiles: [{ ...data.profiles[0], name: '  ' }] })],
    ['oversized profile name', (data: AppData) => ({ ...data, profiles: [{ ...data.profiles[0], name: 'a'.repeat(81) }] })],
    ['oversized profile id', (data: AppData) => ({ ...data, profiles: [{ ...data.profiles[0], id: 'a'.repeat(101) }] })],
    ['more than 50 profiles', (data: AppData) => ({ ...data, activeProfileId: null, profiles: Array.from({ length: 51 }, (_, i) => ({ ...data.profiles[0], id: `p${i}` })) })],
    ['more than 32 channels', (data: AppData) => ({ ...data, session: { ...data.session, channels: Array.from({ length: 33 }, (_, i) => ({ ...data.session.channels[0], login: `user${i}` })) } })],
  ])('rejects %s without coercion', (_label, mutate) => {
    expect(() => validateData(mutate(populatedData()))).toThrow(/version|unexpected|duplicate|profile|boolean|layout|login|volume|intent|chat|quality|name|id|50|32/i);
  });

  it('checks the UTF-8 byte limit before parsing a backup', () => {
    expect(() => parseBackup('é'.repeat(524289))).toThrow(/1 MiB|size|large/i);
    expect(() => parseBackup('{broken')).toThrow(/JSON|backup/i);
  });

  it('merges profiles without overwriting session, names, or colliding IDs', () => {
    const current = populatedData();
    const incoming = populatedData();
    incoming.profiles[0].name = 'Imported';
    incoming.session.channels = [];
    incoming.session.chat.channel = null;
    const result = restoreBackup(current, incoming, 'merge');
    expect(result.session).toEqual(current.session);
    expect(result.activeProfileId).toBe('profile-one');
    expect(result.profiles.map((profile) => profile.name)).toEqual(['Evening streams', 'Imported']);
    expect(result.profiles[0].id).toBe('profile-one');
    expect(result.profiles[1].id).not.toBe('profile-one');
    expect(validateData(result)).toEqual(result);
    expect(incoming.profiles[0].id).toBe('profile-one');
  });

  it('replaces only with a validated complete backup and enforces merge capacity atomically', () => {
    expect(restoreBackup(defaultData(), populatedData(), 'replace')).toEqual(populatedData());
    const current = populatedData();
    current.profiles = Array.from({ length: 50 }, (_, i) => ({ ...current.profiles[0], id: `p${i}` }));
    current.activeProfileId = null;
    expect(() => restoreBackup(current, populatedData(), 'merge')).toThrow(/50/);
    expect(current.profiles).toHaveLength(50);
  });
});

describe('public share codes', () => {
  it('shares channel order, global quality and layout while resetting private settings', () => {
    const code = encodeShare(populatedData().session);
    expect(code).toMatch(/^[A-Za-z0-9_-]+$/);
    expect(code.length).toBeLessThanOrEqual(6000);
    const restored = decodeShare(code);
    expect(restored.channels).toEqual([
      { login: 'alpha', muted: true, volume: 1, quality: null, intent: 'playing' },
      { login: 'beta', muted: true, volume: 1, quality: null, intent: 'playing' },
    ]);
    expect(restored.globalQuality).toBe('480p');
    expect(restored.layout).toBe(2);
    expect(restored.chat).toEqual({ open: false, channel: null, width: 240 });
    expect(restored.hideOffline).toBe(false);
    expect(restored.sidebarOpen).toBe(true);
  });

  it.each(['', 'a'.repeat(6001), 'not base64', 'a', 'e30'])('rejects invalid code %s', (code) => {
    expect(() => decodeShare(code)).toThrow(/share|code|version/i);
  });

  it.each([
    { version: 2, channels: [], globalQuality: 'auto', layout: 'auto' },
    { version: 1, channels: ['alpha', 'alpha'], globalQuality: 'auto', layout: 'auto' },
    { version: 1, channels: ['alpha'], globalQuality: 'auto', layout: 'auto', token: 'private' },
    { version: 1, channels: ['https://evil.test'], globalQuality: 'auto', layout: 'auto' },
    { version: 1, channels: Array.from({ length: 33 }, (_, i) => `user${i}`), globalQuality: 'auto', layout: 'auto' },
  ])('rejects unsupported or unsafe shared payload %#', (payload) => {
    const code = btoa(JSON.stringify(payload)).replaceAll('+', '-').replaceAll('/', '_').replace(/=+$/, '');
    expect(() => decodeShare(code)).toThrow(/share|code/i);
  });
});

it('preserves entered name casing through backups and updates casing without duplicating a channel', () => {
  const data = defaultData();
  data.session = addChannels(data.session, 'https://www.twitch.tv/Risezd @CoachBoop risezd');
  expect(data.session.channels.map(c => [c.login, c.displayName])).toEqual([['risezd', 'Risezd'], ['coachboop', 'CoachBoop']]);
  expect(parseBackup(JSON.stringify(data))).toEqual(data);
  const old = addChannels(defaultData().session, 'risezd');
  expect(addChannels(old, 'Risezd').channels).toEqual([{ ...old.channels[0], displayName: 'Risezd' }]);
  expect(() => validateData({ ...data, session: { ...data.session, channels: [{ ...data.session.channels[0], displayName: 'SomeoneElse' }] } })).toThrow(/display name/i);
});
