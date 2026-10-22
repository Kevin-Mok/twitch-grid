export type LayoutMode = 'auto' | 1 | 2 | 3 | 4;
export interface Channel {
  login: string;
  muted: boolean;
  volume: number;
  quality: string | null;
  intent: 'playing' | 'paused';
}
export interface WatchSession {
  channels: Channel[];
  globalQuality: string;
  hideOffline: boolean;
  sidebarOpen: boolean;
  chat: { open: boolean; channel: string | null; width: number };
  layout: LayoutMode;
}
export interface Profile { id: string; name: string; session: WatchSession }
export interface AppData {
  version: 2;
  session: WatchSession;
  profiles: Profile[];
  activeProfileId: string | null;
}

export const MAX_CHANNELS = 32;
export const MAX_PROFILES = 50;
export const MAX_BACKUP_BYTES = 1024 * 1024;
export const MAX_SHARE_LENGTH = 6000;

export function defaultSession(): WatchSession {
  return {
    channels: [], globalQuality: 'auto', hideOffline: false, sidebarOpen: true,
    chat: { open: false, channel: null, width: 340 }, layout: 'auto',
  };
}

export function defaultData(): AppData {
  return { version: 2, session: defaultSession(), profiles: [], activeProfileId: null };
}

export function normalizeChannel(input: string): string {
  let login = input.trim().replace(/^@/, '');
  if (/^(https?:\/\/|(?:www\.|m\.)?twitch\.tv\/)/i.test(login)) {
    let url: URL;
    try { url = new URL(/^https?:\/\//i.test(login) ? login : `https://${login}`); }
    catch { throw new Error('Enter a Twitch channel login or a twitch.tv/channel URL.'); }
    const match = /^\/([a-z0-9_]{1,25})\/?$/i.exec(url.pathname);
    const reserved = ['directory', 'videos', 'downloads', 'settings', 'search', 'subscriptions', 'wallet', 'inventory', 'store', 'bits', 'turbo', 'p', 'moderator', 'creatorcamp', 'login', 'signup', 'jobs', 'privacy', 'terms'];
    if (!['twitch.tv', 'www.twitch.tv', 'm.twitch.tv'].includes(url.hostname)
      || url.username || url.password || url.port || !match || reserved.includes(match[1].toLowerCase())) {
      throw new Error('Use a Twitch channel URL, such as twitch.tv/channel, without extra path segments.');
    }
    login = match[1];
  }
  login = login.toLowerCase();
  if (!/^[a-z0-9_]{1,25}$/.test(login)) {
    throw new Error('A Twitch channel login must contain 1–25 letters, numbers, or underscores.');
  }
  return login;
}

export function newChannel(login: string): Channel {
  return { login: normalizeChannel(login), muted: true, volume: 1, quality: null, intent: 'playing' };
}

export function addChannels(session: WatchSession, input: string): WatchSession {
  const logins = input.split(/[\s,]+/).filter(Boolean).map(normalizeChannel);
  if (!logins.length) throw new Error('Enter at least one Twitch channel.');
  const existing = new Set(session.channels.map((channel) => channel.login));
  const added = [...new Set(logins)].filter((login) => !existing.has(login));
  if (session.channels.length + added.length > MAX_CHANNELS) throw new Error('A session can contain at most 32 channels.');
  return added.length ? { ...session, channels: [...session.channels, ...added.map(newChannel)] } : session;
}

export function moveChannel(session: WatchSession, login: string, direction: -1 | 1): WatchSession {
  const index = session.channels.findIndex((channel) => channel.login === login);
  const next = index + direction;
  if (index < 0 || next < 0 || next >= session.channels.length) return session;
  const channels = [...session.channels];
  [channels[index], channels[next]] = [channels[next], channels[index]];
  return { ...session, channels };
}

function object(input: unknown, label: string, keys: string[]): Record<string, unknown> {
  if (typeof input !== 'object' || input === null || Array.isArray(input)) throw new Error(`${label} must be an object.`);
  const value = input as Record<string, unknown>;
  const unexpected = Object.keys(value).find((key) => !keys.includes(key));
  if (unexpected) throw new Error(`${label} has an unexpected field: ${unexpected}.`);
  return value;
}

function text(input: unknown, label: string, limit: number): string {
  if (typeof input !== 'string' || !input.trim() || input.length > limit) throw new Error(`${label} must contain 1–${limit} characters.`);
  return input;
}

function boolean(input: unknown, label: string): boolean {
  if (typeof input !== 'boolean') throw new Error(`${label} must be a boolean.`);
  return input;
}

function number(input: unknown, label: string, min: number, max: number): number {
  if (typeof input !== 'number' || !Number.isFinite(input) || input < min || input > max) throw new Error(`${label} must be a number from ${min} to ${max}.`);
  return input;
}

function login(input: unknown): string {
  if (typeof input !== 'string' || !/^[a-z0-9_]{1,25}$/.test(input)) throw new Error('Stored channel login must contain 1–25 lowercase letters, numbers, or underscores.');
  return input;
}

function quality(input: unknown): string {
  if (typeof input !== 'string' || !/^[a-zA-Z0-9_:-]{1,64}$/.test(input)) throw new Error('Quality must contain 1–64 letters, numbers, underscores, colons, or dashes.');
  return input;
}

function layout(input: unknown): LayoutMode {
  if (input !== 'auto' && input !== 1 && input !== 2 && input !== 3 && input !== 4) throw new Error('Layout must be auto or 1–4 columns.');
  return input;
}

function channelList(input: unknown): Channel[] {
  if (!Array.isArray(input) || input.length > MAX_CHANNELS) throw new Error('A session must contain an array of at most 32 channels.');
  const logins = new Set<string>();
  return input.map((item) => {
    const channel = object(item, 'Channel', ['login', 'muted', 'volume', 'quality', 'intent']);
    const channelLogin = login(channel.login);
    if (logins.has(channelLogin)) throw new Error(`Duplicate channel login: ${channelLogin}.`);
    logins.add(channelLogin);
    if (channel.intent !== 'playing' && channel.intent !== 'paused') throw new Error('Channel intent must be playing or paused.');
    return {
      login: channelLogin,
      muted: boolean(channel.muted, 'Channel muted'),
      volume: number(channel.volume, 'Channel volume', 0, 1),
      quality: channel.quality === null ? null : quality(channel.quality),
      intent: channel.intent,
    };
  });
}

function session(input: unknown): WatchSession {
  const value = object(input, 'Session', ['channels', 'globalQuality', 'hideOffline', 'sidebarOpen', 'chat', 'layout']);
  const channels = channelList(value.channels);
  const chat = object(value.chat, 'Chat', ['open', 'channel', 'width']);
  const chatChannel = chat.channel === null ? null : login(chat.channel);
  if (chatChannel !== null && !channels.some((channel) => channel.login === chatChannel)) throw new Error('Chat channel must belong to the session.');
  return {
    channels, globalQuality: quality(value.globalQuality),
    hideOffline: boolean(value.hideOffline, 'Hide offline'),
    sidebarOpen: boolean(value.sidebarOpen, 'Sidebar open'),
    chat: { open: boolean(chat.open, 'Chat open'), channel: chatChannel, width: number(chat.width, 'Chat width', 240, 640) },
    layout: layout(value.layout),
  };
}

export function validateData(input: unknown): AppData {
  const data = object(input, 'Backup', ['version', 'session', 'profiles', 'activeProfileId']);
  if (data.version !== 2) throw new Error('Unsupported backup version. This app supports version 2.');
  if (!Array.isArray(data.profiles) || data.profiles.length > MAX_PROFILES) throw new Error('A backup must contain an array of at most 50 profiles.');
  const ids = new Set<string>();
  const profiles = data.profiles.map((inputProfile) => {
    const profile = object(inputProfile, 'Profile', ['id', 'name', 'session']);
    const id = text(profile.id, 'Profile ID', 100);
    if (ids.has(id)) throw new Error(`Duplicate profile ID: ${id}.`);
    ids.add(id);
    return { id, name: text(profile.name, 'Profile name', 80), session: session(profile.session) };
  });
  const activeProfileId = data.activeProfileId === null ? null : text(data.activeProfileId, 'Active profile ID', 100);
  if (activeProfileId !== null && !ids.has(activeProfileId)) throw new Error('Active profile ID does not match a saved profile.');
  return { version: 2, session: session(data.session), profiles, activeProfileId };
}

export function parseBackup(raw: string): AppData {
  if (new TextEncoder().encode(raw).length > MAX_BACKUP_BYTES) throw new Error('Backup exceeds the 1 MiB size limit.');
  let parsed: unknown;
  try { parsed = JSON.parse(raw); }
  catch { throw new Error('Backup is not valid JSON.'); }
  return validateData(parsed);
}

export function restoreBackup(current: AppData, incoming: AppData, mode: 'merge' | 'replace'): AppData {
  const imported = validateData(incoming);
  if (mode === 'replace') return imported;
  if (mode !== 'merge') throw new Error('Choose merge or replace when restoring a backup.');
  const existing = validateData(current);
  if (existing.profiles.length + imported.profiles.length > MAX_PROFILES) throw new Error('Merging would exceed the limit of 50 profiles.');
  const ids = new Set(existing.profiles.map((profile) => profile.id));
  const profiles = imported.profiles.map((profile) => {
    let id = profile.id;
    while (ids.has(id)) id = crypto.randomUUID();
    ids.add(id);
    return { ...profile, id };
  });
  return { ...existing, profiles: [...existing.profiles, ...profiles] };
}

export function encodeShare(input: WatchSession): string {
  const validated = session(input);
  const payload = { version: 1, channels: validated.channels.map((channel) => channel.login), globalQuality: validated.globalQuality, layout: validated.layout };
  const code = btoa(JSON.stringify(payload)).replaceAll('+', '-').replaceAll('/', '_').replace(/=+$/, '');
  if (code.length > MAX_SHARE_LENGTH) throw new Error('Share code exceeds 6000 characters. Use a JSON backup instead.');
  return code;
}

export function decodeShare(code: string): WatchSession {
  if (!code || code.length > MAX_SHARE_LENGTH || !/^[A-Za-z0-9_-]+$/.test(code)) throw new Error('Invalid share code, or code exceeds 6000 characters. Use a JSON backup for larger transfers.');
  try {
    const decoded = atob(code.replaceAll('-', '+').replaceAll('_', '/'));
    if (btoa(decoded).replaceAll('+', '-').replaceAll('/', '_').replace(/=+$/, '') !== code) throw new Error('Invalid base64 encoding.');
    const shared = object(JSON.parse(decoded) as unknown, 'Share code', ['version', 'channels', 'globalQuality', 'layout']);
    if (shared.version !== 1) throw new Error('Unsupported share version.');
    if (!Array.isArray(shared.channels) || shared.channels.length > MAX_CHANNELS) throw new Error('Share codes can contain at most 32 channels.');
    return session({
      ...defaultSession(),
      channels: shared.channels.map((value) => newChannel(login(value))),
      globalQuality: shared.globalQuality, layout: shared.layout,
    });
  } catch (error) {
    throw new Error(`Invalid share code: ${error instanceof Error ? error.message : 'unrecognized data'}`);
  }
}
