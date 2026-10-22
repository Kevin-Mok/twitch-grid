import { expect, test } from '@playwright/test';
import { addChannels, defaultData } from '../src/domain';
import { fakeTwitch } from './fake-twitch';

test('quality fallback stays hidden while playback keeps its mounted player', async ({ page }) => {
  const data = defaultData();
  data.session = { ...addChannels(data.session, 'alpha'), globalQuality: '720p' };
  await fakeTwitch(page);
  await page.addInitScript(value => localStorage.setItem('twitch-multiplayer:v2', JSON.stringify(value)), data);
  await page.goto('/');
  const notice = page.locator('[data-channel="alpha"] .tile-message');
  await expect.poll(() => page.evaluate(() => (window as unknown as { __calls?: unknown[][] }).__calls?.filter(call => call[0] === 'quality').length ?? 0)).toBeGreaterThan(0);
  expect(await notice.count()).toBe(0);
  const frame = await page.locator('[data-channel="alpha"] iframe').elementHandle();
  await page.getByRole('button', { name: 'Toggle sidebar (Ctrl+B)', exact: true }).click();
  await page.waitForTimeout(1000);
  await expect(notice).toHaveCount(0);
  expect(await frame!.evaluate(node => node.isConnected)).toBe(true);
});
