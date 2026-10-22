import type { LiveState, PlayerEvent, PlayerSnapshot } from './types';

export interface LiveStatusProvider {
  readonly capabilities: { readonly metadata: false; readonly returnToLive: 'best-effort' };
  observe(current: LiveState, event: PlayerEvent['type']): LiveState;
}
export const twitchStatusProvider: LiveStatusProvider = {
  capabilities: { metadata: false, returnToLive: 'best-effort' },
  observe(current, event) {
    if (event === 'online' || event === 'playing') return 'online';
    if (event === 'offline') return 'offline';
    if (event === 'error') return 'error';
    if (event === 'sample' && current === 'error') return 'unknown';
    return current;
  },
};
export function statusLabel(snapshot: Pick<PlayerSnapshot, 'live' | 'lastSignal'>, now = Date.now()): string {
  if (snapshot.live === 'offline') return now - snapshot.lastSignal > 120000 ? 'Offline · stale' : 'Offline';
  return snapshot.live === 'online' ? 'Live' : snapshot.live === 'error' ? 'Error' : 'Unknown';
}
