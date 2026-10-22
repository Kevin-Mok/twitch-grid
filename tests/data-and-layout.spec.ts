import { test, expect } from '@playwright/test';
import { readFile } from 'node:fs/promises';
import { fakeTwitch } from './fake-twitch';

test.beforeEach(async ({ page }) => { await fakeTwitch(page); });
async function add(page: import('@playwright/test').Page, value: string) {
  await page.getByLabel('Channel or Twitch URL').fill(value);
  await page.getByRole('button', { name: 'Add channels', exact: true }).click();
}

test('malformed storage is preserved while in-memory viewing continues', async ({ page }) => {
  await page.goto('/');
  await page.evaluate(() => localStorage.setItem('twitch-multiplayer:v2', '{broken-json'));
  await page.reload();
  await expect(page.getByRole('alert')).toContainText(/storage could not be loaded/i);
  await add(page, 'alpha');
  await expect(page.locator('.video-host iframe')).toHaveCount(1);
  expect(await page.evaluate(() => localStorage.getItem('twitch-multiplayer:v2'))).toBe('{broken-json');
});

test('merging imported profiles never overwrites protected corrupt storage', async ({ page }) => {
  await page.goto('/');
  await page.evaluate(() => localStorage.setItem('twitch-multiplayer:v2', '{broken-json'));
  await page.reload();
  await page.getByRole('button', { name: 'Backup & import', exact: true }).click();
  await page.getByLabel('Viewington profile code', { exact: true }).fill('VGVzdCx0d2l0Y2gsbW9uc3RlcmNhdA==');
  await page.getByRole('button', { name: 'Import Viewington profiles', exact: true }).click();
  await expect(page.getByRole('button', { name: 'Load profile Test', exact: true })).toBeVisible();
  expect(await page.evaluate(() => localStorage.getItem('twitch-multiplayer:v2'))).toBe('{broken-json');
});

test('blocked storage keeps the app usable and warns before the page closes', async ({ page }) => {
  await page.addInitScript(() => { Object.defineProperty(window, 'localStorage', { get: () => { throw new DOMException('Blocked', 'SecurityError'); } }); });
  await page.goto('/');
  await expect(page.getByRole('alert')).toContainText('storage');
  await add(page, 'alpha');
  await expect(page.locator('.video-host iframe')).toHaveCount(1);
  await expect(page.getByText('Memory only', { exact: true })).toBeVisible();
});

test('JSON backup download and explicit replacement restore the profile and channel order', async ({ page }) => {
  await page.goto('/'); await add(page, 'bravo alpha');
  await page.getByLabel('Profile name', { exact: true }).fill('Backup fixture');
  await page.getByRole('button', { name: 'Save profile', exact: true }).click();
  await page.getByRole('button', { name: 'Backup & import', exact: true }).click();
  const downloadPromise = page.waitForEvent('download');
  await page.getByRole('button', { name: 'Download JSON backup', exact: true }).click();
  const backup = await downloadPromise;
  const text = await readFile((await backup.path())!, 'utf8');
  expect(JSON.parse(text).session.channels.map((c: { login: string }) => c.login)).toEqual(['bravo', 'alpha']);
  await page.getByRole('button', { name: 'Close transfer panel', exact: true }).click();
  page.once('dialog', dialog => dialog.accept());
  await page.getByRole('button', { name: 'Clear all', exact: true }).click();
  await expect(page.locator('.video-host iframe')).toHaveCount(0);
  await page.getByRole('button', { name: 'Backup & import', exact: true }).click();
  await page.getByLabel('Or paste backup JSON', { exact: true }).fill(text);
  await page.getByLabel('Restore behavior', { exact: true }).selectOption('replace');
  await expect(page.getByRole('button', { name: 'Restore backup', exact: true })).toBeDisabled();
  await page.getByLabel('I understand this replaces my current session and all saved profiles.').check();
  await page.getByRole('button', { name: 'Restore backup', exact: true }).click();
  await expect(page.locator('.video-host iframe')).toHaveCount(2);
  expect(await page.locator('.channel-name').allTextContents()).toEqual(['bravoMuted', 'alphaMuted']);
});

test('shared links apply only on request and never overwrite saved profiles', async ({ page }) => {
  await page.goto('/'); await add(page, 'alpha bravo');
  await page.getByLabel('Profile name', { exact: true }).fill('Keep me');
  await page.getByRole('button', { name: 'Save profile', exact: true }).click();
  await page.getByRole('button', { name: 'Share', exact: true }).click();
  const link = await page.getByLabel('Watch link', { exact: true }).inputValue();
  await page.getByRole('button', { name: 'Close transfer panel', exact: true }).click();
  await add(page, 'charlie');
  await page.goto(link);
  await expect(page.locator('.video-host iframe')).toHaveCount(3);
  await page.getByRole('button', { name: 'Apply shared channels', exact: true }).click();
  await expect(page.locator('.video-host iframe')).toHaveCount(2);
  await expect(page.getByRole('button', { name: 'Load profile Keep me', exact: true })).toBeVisible();
});

test('blocked SDK loading surfaces an actionable per-player error', async ({ page }) => {
  await page.route('https://player.twitch.tv/js/embed/v1.js', route => route.abort('failed'));
  await page.goto('/'); await add(page, 'alpha');
  await expect(page.getByRole('alert')).toContainText('Twitch could not load');
  await expect(page.getByRole('button', { name: 'Reload alpha', exact: true })).toBeVisible();
});

for (const count of [1, 2, 3, 5, 8]) {
  test(`layout with ${count} players respects minimum embeds at practical desktop sizes`, async ({ page }) => {
    await page.goto('/');
    await add(page, ['alpha', 'bravo', 'charlie', 'delta', 'echo', 'foxtrot', 'golf', 'hotel'].slice(0, count).join(' '));
    await expect(page.locator('.video-host iframe')).toHaveCount(count);
    for (const width of [1440, 1280]) {
      await page.setViewportSize({ width, height: 900 });
      await expect.poll(async () => page.locator('.video-host iframe').evaluateAll(frames => frames.every(frame => { const r = frame.getBoundingClientRect(); return r.width >= 399.9 && r.height >= 299.9; }))).toBe(true);
      const rects = await page.locator('.player-tile').evaluateAll(tiles => tiles.map(tile => { const r = tile.getBoundingClientRect(); return { x: r.x, y: r.y, right: r.right, bottom: r.bottom }; }));
      for (let a = 0; a < rects.length; a++) for (let b = a + 1; b < rects.length; b++) {
        expect(rects[a].right <= rects[b].x || rects[b].right <= rects[a].x || rects[a].bottom <= rects[b].y || rects[b].bottom <= rects[a].y).toBe(true);
      }
    }
  });
}

for (const width of [390, 768]) {
  test(`controls remain reachable at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 844 }); await page.goto('/');
    await expect(page.getByRole('button', { name: 'Toggle sidebar (Ctrl+B)', exact: true })).toBeVisible();
    await add(page, 'alpha');
    await page.getByRole('button', { name: 'Toggle sidebar (Ctrl+B)', exact: true }).click();
    await expect(page.getByRole('button', { name: 'Share', exact: true })).toBeVisible();
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
  });
}
