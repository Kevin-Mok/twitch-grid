import { test, expect } from '@playwright/test';
import { fakeTwitch } from './fake-twitch';

test.beforeEach(async ({ page }) => { await fakeTwitch(page); await page.goto('/'); });
async function add(page: import('@playwright/test').Page, value: string) {
  await page.getByLabel('Channel or Twitch URL').fill(value);
  await page.getByRole('button', { name: 'Add channels', exact: true }).click();
}

test('player videos fill header-only tiles without duplicate controls', async ({ page }) => {
  await add(page, 'alpha bravo');
  await expect(page.locator('.video-host iframe')).toHaveCount(2);
  for (const width of [390, 768, 1280, 1440]) {
    await page.setViewportSize({ width, height: 900 });
    await expect(page.locator('.tile-footer, .volume-slider')).toHaveCount(0);
    await expect.poll(() => page.locator('.player-tile').evaluateAll(tiles => tiles.every(tile => {
      const video = tile.querySelector('.video-host')!.getBoundingClientRect();
      const header = tile.querySelector('.tile-header')!.getBoundingClientRect();
      const bounds = tile.getBoundingClientRect();
      return video.height >= 300 && Math.abs(video.top - header.bottom) < 1 && Math.abs(video.bottom - bounds.bottom) <= 1;
    }))).toBe(true);
    await page.screenshot({ path: `/tmp/player-no-footer-${width}.png` });
  }
});

test('five players retain iframe identity and navigation across all visual changes', async ({ page }) => {
  const navigations: string[] = [];
  page.on('framenavigated', frame => { if (frame.url().startsWith('https://player.twitch.tv/?')) navigations.push(frame.url()); });
  await add(page, 'alpha, bravo, charlie, delta, echo');
  await expect(page.locator('.video-host iframe')).toHaveCount(5);
  await expect.poll(() => navigations.length).toBe(5);
  await page.evaluate(() => { (window as unknown as { originalFrames: Element[] }).originalFrames = [...document.querySelectorAll('.video-host iframe')]; });
  for (let i = 0; i < 3; i++) await page.getByRole('button', { name: 'Move echo up', exact: true }).click();
  await page.setViewportSize({ width: 1200, height: 760 });
  await page.getByRole('button', { name: 'Toggle sidebar (Ctrl+B)', exact: true }).click();
  await page.getByRole('button', { name: 'Open chat for alpha', exact: true }).click();
  await page.getByRole('combobox', { name: 'Chat channel', exact: true }).selectOption('bravo');
  await page.getByRole('button', { name: 'Toggle chat', exact: true }).click();
  await page.getByLabel('Layout').selectOption('2');
  await page.getByRole('button', { name: 'Focus alpha', exact: true }).click();
  await page.getByRole('button', { name: 'Show all streams', exact: true }).click();
  expect(await page.evaluate(() => (window as unknown as { originalFrames: Element[] }).originalFrames.every(frame => frame.isConnected && document.querySelector(`iframe[title="${frame.getAttribute('title')}"]`) === frame))).toBe(true);
  expect(navigations).toHaveLength(5);
});

test('manual pause survives offline recovery; sound and quality stay independent', async ({ page }) => {
  await add(page, 'alpha bravo');
  await expect(page.locator('[data-channel="alpha"]')).toContainText('Live');
  await page.evaluate(() => {
    const player = (window as unknown as { __players: Record<string, { pause(): void; emit(event: string): void }> }).__players.alpha;
    player.pause(); player.emit('offline'); player.emit('online');
  });
  await expect(page.locator('.channel-name').filter({ hasText: /^alpha/ })).toContainText('Paused');
  await page.evaluate(() => (window as unknown as { __players: Record<string, { setMuted(value: boolean): void }> }).__players.alpha.setMuted(false));
  await expect.poll(() => page.evaluate(() => JSON.parse(localStorage.getItem('twitch-multiplayer:v2')!).session.channels[0].muted)).toBe(false);
  await expect(page.locator('.channel-name').filter({ hasText: /^bravo/ })).toContainText('Muted');
  await page.getByLabel('Global quality preference').selectOption('720p60');
  await page.getByRole('button', { name: 'Play paused', exact: true }).click();
  await expect(page.locator('.channel-name').filter({ hasText: /^alpha/ })).toContainText('Sound on');
  await expect.poll(() => page.evaluate(() => {
    const players = (window as unknown as { __players: Record<string, { paused: boolean; muted: boolean; quality: string }> }).__players;
    return { alphaPaused: players.alpha.paused, bravoMuted: players.bravo.muted, alphaQuality: players.alpha.quality };
  })).toEqual({ alphaPaused: false, bravoMuted: true, alphaQuality: '720p60' });
});

test('overlapping profiles preserve retained frames and restore ordered browser data', async ({ page }) => {
  await add(page, 'alpha bravo');
  await page.getByLabel('Profile name', { exact: true }).fill('First');
  await page.getByRole('button', { name: 'Save profile', exact: true }).click();
  await add(page, 'charlie');
  await page.getByLabel('Profile name', { exact: true }).fill('Second');
  await page.getByRole('button', { name: 'Save profile', exact: true }).click();
  const alpha = await page.locator('[data-channel="alpha"] iframe').elementHandle();
  await page.getByRole('button', { name: 'Load profile First', exact: true }).click();
  await expect(page.locator('.video-host iframe')).toHaveCount(2);
  expect(await alpha!.evaluate(node => node.isConnected)).toBe(true);
  await page.reload();
  await expect(page.locator('.video-host iframe')).toHaveCount(2);
  await expect(page.getByRole('button', { name: 'Load profile Second', exact: true })).toBeVisible();
});

test('validation, offline hiding, provider errors and malformed shared links are explicit', async ({ page }) => {
  await add(page, 'not/a/channel');
  await expect(page.getByRole('alert')).toContainText(/channel|Twitch/i);
  await add(page, 'alpha bravo');
  await page.getByLabel('Hide offline streams').check();
  await page.evaluate(() => (window as unknown as { __players: Record<string, { emit(e: string): void }> }).__players.alpha.emit('offline'));
  await expect(page.locator('[data-channel="alpha"]')).toHaveClass(/parked/);
  await expect(page.locator('.video-host iframe')).toHaveCount(2);
  await page.evaluate(() => (window as unknown as { __players: Record<string, { emit(e: string): void }> }).__players.alpha.emit('online'));
  await expect(page.locator('[data-channel="alpha"]')).not.toHaveClass(/parked/);
  await page.goto('/#watch=not-a-valid-code');
  await expect(page.getByRole('alert')).toContainText(/share|code/i);
  await expect(page.locator('.video-host iframe')).toHaveCount(2);
});

test('Ctrl+B ignores text fields and works outside them', async ({ page }) => {
  await page.getByLabel('Channel or Twitch URL').focus();
  await page.keyboard.press('Control+b');
  await expect(page.getByLabel('Channel or Twitch URL')).toBeVisible();
  await page.getByRole('button', { name: 'Toggle sidebar (Ctrl+B)', exact: true }).focus();
  await page.keyboard.press('Control+b');
  await expect(page.getByLabel('Channel or Twitch URL')).not.toBeVisible();
});
