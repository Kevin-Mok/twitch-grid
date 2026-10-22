import { expect, it } from 'vitest';
import { statusLabel, twitchStatusProvider } from './status';

it('never treats sampling failure as offline and makes old hidden status explicit', () => {
  expect(twitchStatusProvider.observe('online', 'error')).toBe('error');
  expect(twitchStatusProvider.observe('offline', 'sample')).toBe('offline');
  expect(twitchStatusProvider.observe('offline', 'online')).toBe('online');
  expect(statusLabel({ live: 'offline', lastSignal: 0 }, 121000)).toBe('Offline · stale');
  expect(statusLabel({ live: 'unknown', lastSignal: 0 }, 121000)).toBe('Unknown');
});
