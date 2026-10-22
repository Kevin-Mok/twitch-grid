import { compressToBase64 } from 'lz-string';
import { describe, expect, it } from 'vitest';
import { defaultData, validateData } from './domain';
import { importViewingtonCode } from './viewington';

function rawCode(text: string): string {
  return btoa(String.fromCharCode(...new TextEncoder().encode(text)));
}

describe('verified Viewington profile-code import', () => {
  it.each([
    ['VGVzdCx0d2l0Y2gsbW9uc3RlcmNhdA==', 'Test', ['twitch', 'monstercat']],
    ['MIewtgDgTgpgznGATANAFwO4Es0GMAWKYIAdnGjFLgIZpA==', 'Compressed', ['twitch', 'monstercat']],
    ['EoUwziCGBODGAWACa4pySiMEBoAuA7gJZ64C2A9gHZh4hyR47gA2sYObA1vvCAA7QiZKAHMQVIA=', 'Research research research', ['twitch', 'monstercat', 'eslcs', 'lck', 'theprimeagen']],
  ])('decodes verified reference fixture %#', (code, name, channels) => {
    const profiles = importViewingtonCode(code);
    expect(profiles).toHaveLength(1);
    expect(profiles[0].name).toBe(name);
    expect(profiles[0].session.channels.map((channel) => channel.login)).toEqual(channels);
    expect(profiles[0].session.channels.every((channel) => channel.muted && channel.intent === 'playing' && channel.quality === null)).toBe(true);
    expect(validateData({ ...defaultData(), profiles }).profiles).toEqual(profiles);
  });

  it('handles UTF-8, escaped quoted names, CRLF records and canonical channel casing', () => {
    const profiles = importViewingtonCode(rawCode('"Café, ""late""",Alpha,beta\r\nSecond,gamma\r\n'));
    expect(profiles.map((profile) => profile.name)).toEqual(['Café, "late"', 'Second']);
    expect(profiles[0].session.channels.map((channel) => channel.login)).toEqual(['alpha', 'beta']);
    expect(new Set(profiles.map((profile) => profile.id)).size).toBe(2);
  });

  it.each([
    'Empty,', ',alpha', 'Name,not-a-channel', 'Name,alpha,ALPHA', '"Unclosed,alpha',
    '"Name"junk,alpha', `${'n'.repeat(81)},alpha`,
    `Too many,${Array.from({ length: 33 }, (_, i) => `user${i}`).join(',')}`,
    Array.from({ length: 51 }, (_, i) => `P${i},alpha`).join('\n'),
  ])('rejects invalid profile data %# before returning any profiles', (text) => {
    expect(() => importViewingtonCode(rawCode(text))).toThrow(/Viewington|profile|channel|limit|duplicate/i);
  });

  it('rejects oversized codes before decompression and oversized expansion before import', () => {
    expect(() => importViewingtonCode('A'.repeat(6001))).toThrow(/6000|large|limit/i);
    const bomb = compressToBase64('a'.repeat(1024 * 1024 + 1));
    expect(bomb.length).toBeLessThan(6000);
    expect(() => importViewingtonCode(bomb)).toThrow(/1 MiB|large|limit/i);
  });

  it.each(['', 'not a code', '!!!!', 'AAAA'])('rejects malformed codes %s', (code) => {
    expect(() => importViewingtonCode(code)).toThrow(/Viewington|code/i);
  });
});
