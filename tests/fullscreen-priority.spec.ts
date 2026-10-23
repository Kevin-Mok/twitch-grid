import { test, expect } from '@playwright/test';
import { fakeTwitch } from './fake-twitch';

test('focus and fullscreen isolate a stream and restore quality without replacing players', async ({ page }) => {
  await fakeTwitch(page); await page.goto('/');
  await page.getByLabel('Channel or Twitch URL').fill('alpha bravo charlie');
  await page.getByRole('button', { name: 'Add channels', exact: true }).click();
  await expect(page.locator('[data-channel="charlie"]').getByRole('img', { name: 'Live', exact: true })).toBeVisible();
  const frames = await page.locator('.video-host iframe').elementHandles();
  const saved = await page.evaluate(() => localStorage.getItem('twitch-multiplayer:v2'));
  const qualities = () => page.evaluate(() => Object.values((window as unknown as { __players: Record<string, { quality: string }> }).__players).map(p => p.quality));
  const visible = page.locator('.player-tile:not(.parked)');

  await page.getByRole('button', { name: 'Focus bravo', exact: true }).click();
  await expect(visible).toHaveCount(1);
  await expect(visible).toHaveAttribute('data-channel', 'bravo');
  await expect.poll(qualities).toEqual(['480p', 'chunked', '480p']);
  await expect(page.getByRole('button', { name: 'Focus alpha', exact: true })).toHaveCount(0);
  await page.getByRole('button', { name: 'Show all streams', exact: true }).click();
  await expect(visible).toHaveCount(3);
  await expect.poll(qualities).toEqual(['auto', 'auto', 'auto']);

  await page.getByRole('button', { name: 'Fullscreen alpha', exact: true }).click();
  await expect.poll(() => page.evaluate(() => document.fullscreenElement?.getAttribute('data-channel'))).toBe('alpha');
  await expect(visible).toHaveCount(1);
  await expect.poll(qualities).toEqual(['chunked', '480p', '480p']);
  await page.evaluate(() => document.exitFullscreen());
  await expect(visible).toHaveCount(3);
  await expect.poll(qualities).toEqual(['auto', 'auto', 'auto']);

  await page.getByRole('button', { name: 'Focus charlie', exact: true }).click();
  await page.keyboard.press('Escape');
  await expect(visible).toHaveCount(3);
  await expect.poll(qualities).toEqual(['auto', 'auto', 'auto']);
  for (const frame of frames) expect(await frame.evaluate(node => node.isConnected)).toBe(true);
  expect(await page.evaluate(() => localStorage.getItem('twitch-multiplayer:v2'))).toBe(saved);
  expect(await page.evaluate(() => Object.values((window as unknown as { __players: Record<string, { muted: boolean; paused: boolean }> }).__players).every(p => p.muted && !p.paused))).toBe(true);
});

test('priority survives offline and reload, clears on removal, and follows native iframe fullscreen', async ({ page }) => {
  await fakeTwitch(page); await page.goto('/');
  await page.getByLabel('Channel or Twitch URL').fill('alpha bravo');
  await page.getByRole('button', { name: 'Add channels', exact: true }).click();
  await expect(page.locator('[data-channel="bravo"]').getByRole('img', { name: 'Live', exact: true })).toBeVisible();
  await page.getByLabel('Hide offline streams', { exact: true }).check();
  await page.getByRole('button', { name: 'Focus alpha', exact: true }).click();
  await page.evaluate(() => {
    (window as unknown as { __players: Record<string, { emit(event: string): void }> }).__players.alpha.emit('offline');
  });
  await expect(page.locator('.player-tile:not(.parked)')).toHaveAttribute('data-channel', 'alpha');
  await page.getByRole('button', { name: 'Reload hidden or visible alpha', exact: true }).click();
  await expect.poll(() => page.evaluate(() => (window as unknown as { __players: Record<string, { quality: string }> }).__players.alpha.quality)).toBe('chunked');
  await page.getByRole('button', { name: 'Remove player alpha', exact: true }).click();
  await expect(page.locator('.player-tile:not(.parked)')).toHaveAttribute('data-channel', 'bravo');
  await expect.poll(() => page.evaluate(() => (window as unknown as { __players: Record<string, { quality: string }> }).__players.bravo.quality)).toBe('auto');
  await expect(page.getByRole('button', { name: 'Show all streams', exact: true })).toHaveCount(0);

  await page.getByLabel('Channel or Twitch URL').fill('charlie');
  await page.getByRole('button', { name: 'Add channels', exact: true }).click();
  // A native player asks fullscreen for its iframe rather than our tile.
  await page.locator('[data-channel="bravo"] iframe').evaluate(frame => {
    const button = document.createElement('button');
    button.textContent = 'Test native fullscreen';
    button.onclick = () => { void frame.requestFullscreen(); };
    document.body.append(button);
    button.style.cssText = 'position:fixed;top:0;right:0;z-index:999';
  });
  await page.getByRole('button', { name: 'Test native fullscreen', exact: true }).click();
  await expect.poll(() => page.evaluate(() => document.fullscreenElement?.tagName)).toBe('IFRAME');
  await expect.poll(() => page.evaluate(() => (window as unknown as { __players: Record<string, { quality: string }> }).__players.bravo.quality)).toBe('chunked');
  await expect(page.locator('.player-tile:not(.parked)')).toHaveAttribute('data-channel', 'bravo');
  await page.evaluate(() => document.exitFullscreen());
  await expect(page.locator('.player-tile:not(.parked)')).toHaveCount(2);
  await expect.poll(() => page.evaluate(() => (window as unknown as { __players: Record<string, { quality: string }> }).__players.bravo.quality)).toBe('auto');
});
