import { test, expect } from '@playwright/test';
import { fakeTwitch } from './fake-twitch';

test('compact panels keep two video columns with chat open', async ({ page }, testInfo) => {
  await fakeTwitch(page);
  await page.goto('/');
  await page.getByLabel('Channel or Twitch URL').fill('coachboop npen mrsavage venofn');
  await page.getByRole('button', { name: 'Add channels', exact: true }).click();
  await page.getByRole('button', { name: 'Dismiss notice' }).click();
  await page.getByRole('button', { name: 'Open chat for coachboop', exact: true }).click();
  const frames = await page.locator('.video-host iframe, .chat-frame').elementHandles();
  for (const width of [1280, 1366, 1440, 1920]) {
    await page.setViewportSize({ width, height: 900 });
    await expect(page.locator('.sidebar')).toHaveCSS('width', '200px');
    await expect(page.locator('.chat-panel')).toHaveCSS('width', '240px');
    await expect.poll(async () => {
      const tiles = await page.locator('.player-tile').all();
      const [first, second] = await Promise.all(tiles.slice(0, 2).map(tile => tile.boundingBox()));
      return !!first && !!second && Math.abs(first.y - second.y) < 1 && second.x > first.x;
    }).toBe(true);
    const viewport = page.locator('.player-viewport');
    expect(await viewport.evaluate(node => node.scrollWidth <= node.clientWidth)).toBe(true);
    await page.screenshot({ path: testInfo.outputPath(`panels-${width}.png`) });
  }
  // Existing wider preferences adapt to the available room without overwriting them.
  await page.setViewportSize({ width: 1280, height: 900 });
  const divider = page.getByRole('separator', { name: 'Resize chat' });
  await divider.focus();
  for (let i = 0; i < 25; i++) await page.keyboard.press('ArrowLeft');
  await expect(divider).toHaveAttribute('aria-valuenow', '640');
  expect((await page.locator('.chat-panel').boundingBox())!.width).toBeLessThanOrEqual(248);
  for (const [width, height] of [[1280, 900], [1440, 730], [2048, 973]]) {
    await page.setViewportSize({ width, height });
    await expect.poll(async () => page.locator('.player-tile').evaluateAll(tiles => {
      const [a, b, c, d] = tiles.map(tile => tile.getBoundingClientRect());
      return a.y === b.y && c.y === d.y && c.y > a.y
        && a.x === c.x && b.x === d.x && b.x > a.x;
    })).toBe(true);
    expect(await page.locator('.player-viewport').evaluate(node =>
      node.scrollWidth <= node.clientWidth && node.scrollHeight <= node.clientHeight,
    )).toBe(true);
    await page.screenshot({ path: testInfo.outputPath(`wide-chat-${width}.png`) });
  }
  await page.setViewportSize({ width: 390, height: 900 });
  await expect(page.getByRole('button', { name: 'Play all paused streams', exact: true })).toBeVisible();
  await page.screenshot({ path: testInfo.outputPath('panels-mobile.png') });
  for (const frame of frames) expect(await frame.evaluate(node => node.isConnected)).toBe(true);
});
