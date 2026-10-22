import { defaultData, MAX_BACKUP_BYTES, parseBackup, validateData, type AppData } from './domain';

export const STORAGE_KEY = 'twitch-multiplayer:v2';

function migrateV1(raw: string): AppData {
  if (new TextEncoder().encode(raw).length > MAX_BACKUP_BYTES) throw new Error('Legacy data exceeds the 1 MiB size limit.');
  const input: unknown = JSON.parse(raw);
  if (typeof input !== 'object' || input === null || Array.isArray(input)) throw new Error('Unsupported legacy storage format.');
  const legacy = input as Record<string, unknown>;
  if (legacy.version !== 1 || !Array.isArray(legacy.channels)
    || Object.keys(legacy).some((key) => !['version', 'channels', 'globalQuality'].includes(key))) {
    throw new Error('Unsupported legacy storage format.');
  }
  const data = defaultData();
  return validateData({
    ...data,
    session: {
      ...data.session,
      channels: legacy.channels.map((login) => ({ login, muted: true, volume: 1, quality: null, intent: 'playing' })),
      globalQuality: legacy.globalQuality === undefined ? 'auto' : legacy.globalQuality,
    },
  });
}

export function loadData(storage: Pick<Storage, 'getItem'>): { data: AppData; warning: string | null; blocked: boolean; raw: string | null } {
  let raw: string | null = null;
  try {
    raw = storage.getItem(STORAGE_KEY);
    if (raw !== null) return { data: parseBackup(raw), warning: null, blocked: false, raw };
    raw = storage.getItem('twitch-multiplayer:v1');
    if (raw !== null) {
      return { data: migrateV1(raw), warning: 'Migrated version 1 local data. The original remains stored until you remove it.', blocked: false, raw };
    }
    return { data: defaultData(), warning: null, blocked: false, raw: null };
  } catch (error) {
    const reason = error instanceof Error ? error.message : 'Unknown storage error.';
    return {
      data: defaultData(), blocked: true, raw,
      warning: `Local storage could not be loaded. Existing data has not been changed. ${reason} Export a backup or explicitly reset storage before saving.`,
    };
  }
}

export function saveData(storage: Pick<Storage, 'setItem'>, data: AppData): { ok: boolean; error: string | null } {
  try {
    const raw = JSON.stringify(validateData(data));
    if (new TextEncoder().encode(raw).length > MAX_BACKUP_BYTES) throw new Error('Data exceeds the 1 MiB size limit.');
    storage.setItem(STORAGE_KEY, raw);
    return { ok: true, error: null };
  } catch (error) {
    const reason = error instanceof Error ? error.message : 'Unknown storage error.';
    return { ok: false, error: `Could not save to local storage. Keep a JSON backup and check browser storage permissions or available space. ${reason}` };
  }
}
