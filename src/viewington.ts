import { decompressFromBase64 } from 'lz-string';
import { defaultData, defaultSession, MAX_BACKUP_BYTES, MAX_CHANNELS, MAX_PROFILES, MAX_SHARE_LENGTH, newChannel, validateData, type Profile } from './domain';

function checkExpansion(code: string): void {
  const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';
  const input = code.replace(/=+$/, '');
  let position = 0;
  const read = (bits: number): number => {
    let value = 0;
    for (let bit = 0; bit < bits; bit++) {
      if (position >= input.length * 6) throw new Error('Truncated compressed Viewington code.');
      const digit = alphabet.indexOf(input[Math.floor(position / 6)]);
      value |= ((digit >> (5 - position % 6)) & 1) << bit;
      position++;
    }
    return value;
  };
  type Entry = { bytes: number; first: number };
  const literal = (bits: number): Entry => {
    const character = read(bits);
    const bytes = character <= 0x7f ? 1 : character <= 0x7ff ? 2 : 3;
    return { bytes, first: bytes };
  };
  const initial = read(2);
  if (initial === 2) return;
  if (initial !== 0 && initial !== 1) throw new Error('Invalid compressed Viewington code.');
  let previous = literal(initial === 0 ? 8 : 16);
  const dictionary: Array<Entry | undefined> = [undefined, undefined, undefined, previous];
  let size = 4;
  let bits = 3;
  let enlargeIn = 4;
  let outputBytes = previous.bytes;
  // Count expansion before lz-string builds strings; surrogate pairs are conservatively counted as six bytes.
  for (;;) {
    let token = read(bits);
    if (token === 2) return;
    if (token === 0 || token === 1) {
      dictionary[size] = literal(token === 0 ? 8 : 16);
      token = size++;
      enlargeIn--;
    }
    if (enlargeIn === 0) { enlargeIn = 2 ** bits; bits++; }
    const entry = dictionary[token] ?? (token === size ? { bytes: previous.bytes + previous.first, first: previous.first } : undefined);
    if (!entry) throw new Error('Invalid compressed Viewington dictionary.');
    outputBytes += entry.bytes;
    if (outputBytes > MAX_BACKUP_BYTES) throw new Error('Viewington code expands beyond the 1 MiB limit.');
    dictionary[size++] = { bytes: previous.bytes + entry.first, first: previous.first };
    enlargeIn--;
    previous = entry;
    if (enlargeIn === 0) { enlargeIn = 2 ** bits; bits++; }
  }
}

function parseProfiles(csv: string): Profile[] {
  if (new TextEncoder().encode(csv).length > MAX_BACKUP_BYTES) throw new Error('Viewington profile data exceeds the 1 MiB limit.');
  const rows: string[][] = [];
  let fields: string[] = [];
  let field = '';
  let quoted = false;
  let afterQuote = false;
  const pushField = () => {
    fields.push(field);
    if (fields.length > MAX_CHANNELS + 1) throw new Error('A Viewington profile can contain at most 32 channels.');
    field = '';
    afterQuote = false;
  };
  for (let index = 0; index <= csv.length; index++) {
    const character = index === csv.length ? '\n' : csv[index];
    if (quoted) {
      if (index === csv.length) throw new Error('Unclosed quoted Viewington profile name.');
      if (character === '"') {
        if (csv[index + 1] === '"') { field += '"'; index++; }
        else { quoted = false; afterQuote = true; }
      } else field += character;
    } else if (afterQuote && ![',', '\r', '\n'].includes(character)) {
      throw new Error('Unexpected text after a quoted Viewington profile field.');
    } else if (character === '"') {
      if (field) throw new Error('Quotes must surround an entire Viewington profile field.');
      quoted = true;
    } else if (character === ',') {
      pushField();
    } else if (character === '\r' || character === '\n') {
      pushField();
      if (fields.length !== 1 || fields[0] !== '') rows.push(fields);
      if (rows.length > MAX_PROFILES) throw new Error('A Viewington code can contain at most 50 profiles.');
      fields = [];
      if (character === '\r' && csv[index + 1] === '\n') index++;
    } else field += character;
    if (field.length > (fields.length === 0 ? 80 : 25)) throw new Error('Viewington profile name or channel exceeds its length limit.');
  }
  if (!rows.length) throw new Error('Viewington code contains no profiles.');
  const profiles = rows.map(([rawName, ...channels]) => {
    const name = rawName.trim();
    if (!name || /[\u0000-\u001f\u007f]/.test(name)) throw new Error('Viewington profile names must contain visible text.');
    if (!channels.length || channels.some((channel) => !/^[a-z0-9_]{1,25}$/i.test(channel.trim()))) {
      throw new Error('Each Viewington profile must contain valid Twitch channel logins.');
    }
    return { id: crypto.randomUUID(), name, session: { ...defaultSession(), channels: channels.map((channel) => newChannel(channel.trim())) } };
  });
  return validateData({ ...defaultData(), profiles }).profiles;
}

export function importViewingtonCode(input: string): Profile[] {
  const code = input.trim();
  if (!code || code.length > MAX_SHARE_LENGTH || !/^[A-Za-z0-9+/]+={0,3}$/.test(code)) throw new Error('Viewington code must be valid base64 and no longer than 6000 characters.');
  let rawError: Error | null = null;
  try {
    const raw = new TextDecoder('utf-8', { fatal: true }).decode(Uint8Array.from(atob(code), (character) => character.charCodeAt(0)));
    try { return parseProfiles(raw); }
    catch (error) { if (raw.includes(',')) rawError = error instanceof Error ? error : new Error('Invalid Viewington profile data.'); }
  } catch { /* Compressed codes are not necessarily valid UTF-8 base64. */ }
  try {
    checkExpansion(code);
    const decoded = decompressFromBase64(code);
    if (!decoded) throw new Error('The compressed Viewington code is empty or invalid.');
    return parseProfiles(decoded);
  } catch (error) {
    const reason = error instanceof Error ? error.message : 'Invalid profile data.';
    if (reason.includes('1 MiB')) throw new Error(reason);
    throw new Error(`Could not import Viewington code. ${rawError?.message ?? reason}`);
  }
}
