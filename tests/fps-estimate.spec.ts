import { expect, test } from '@playwright/test';
import { fakeTwitch } from './fake-twitch';

test('labels FPS within five seconds, clears paused estimates and preserves playback preferences', async ({ page }) => {
  await fakeTwitch(page);
  await page.goto('/');
  await page.getByLabel('Channel or Twitch URL').fill('alpha');
  await page.getByRole('button', { name: 'Add channels', exact: true }).click();
  const tile = page.locator('[data-channel="alpha"]');
  const estimate = tile.locator('.fps-indicator');
  await expect(estimate).toHaveText('FPS —');
  const frame = await tile.locator('iframe').elementHandle();
  await page.evaluate(() => {
    const player = (window as unknown as { __players: Record<string, { getPlaybackStats?: () => unknown }> }).__players.alpha;
    player.getPlaybackStats = () => ({ fps: 60 });
  });
  await expect(estimate).toHaveText('Twitch ~60 FPS', { timeout: 5000 });
  await expect(estimate).toHaveAttribute('title', /does not measure displayed smoothness/);
  const qualityCalls = await page.evaluate(() => (window as unknown as { __calls: unknown[][] }).__calls.filter(call => call[0] === 'quality'));
  await page.evaluate(() => (window as unknown as { __players: Record<string, { pause(): void }> }).__players.alpha.pause());
  await expect(estimate).toHaveText('FPS —');
  await page.getByRole('button', { name: 'Play all paused streams', exact: true }).click();
  await expect(estimate).toHaveText('Twitch ~60 FPS', { timeout: 5000 });
  expect(await frame!.evaluate(el => el.isConnected)).toBe(true);
  const storedChannel = await page.evaluate(() => JSON.parse(localStorage.getItem('twitch-multiplayer:v2')!).session.channels[0]);
  expect(storedChannel).not.toHaveProperty('fps');
  expect(storedChannel.quality).toBeNull();
  expect(await page.evaluate(() => (window as unknown as { __calls: unknown[][] }).__calls.filter(call => call[0] === 'quality'))).toEqual(qualityCalls);
});
