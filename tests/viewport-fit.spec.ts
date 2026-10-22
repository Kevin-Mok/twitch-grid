import { test, expect } from '@playwright/test';
import { fakeTwitch } from './fake-twitch';

test('all video rows fit one viewport through resize, layout and focus changes', async ({ page }) => {
  await fakeTwitch(page);
  await page.goto('/');
  await page.getByLabel('Channel or Twitch URL').fill('alpha bravo charlie');
  await page.getByRole('button', { name: 'Add channels', exact: true }).click();
  await page.getByRole('button', { name: 'Toggle sidebar (Ctrl+B)', exact: true }).click();
  await expect(page.locator('.video-host iframe')).toHaveCount(3);
  await page.evaluate(() => { Object.assign(window, { retainedFrames: [...document.querySelectorAll('.video-host iframe')] }); });

  async function expectFit() {
    await expect.poll(() => page.locator('.player-viewport').evaluate(viewport => {
      const bounds = viewport.getBoundingClientRect();
      return viewport.scrollHeight <= viewport.clientHeight + 1
        && viewport.scrollWidth <= viewport.clientWidth + 1
        && [...viewport.querySelectorAll('.player-tile:not(.parked)')].every(tile => {
          const rect = tile.getBoundingClientRect();
          const host = tile.querySelector<HTMLElement>('.video-host')!;
          return rect.left >= bounds.left - 1 && rect.right <= bounds.right + 1
            && rect.top >= bounds.top - 1 && rect.bottom <= bounds.bottom + 1
            && host.offsetWidth >= 400 && host.offsetHeight >= 300;
        });
    })).toBe(true);
  }

  for (const [width, height] of [[992, 636], [1440, 900], [390, 844]]) {
    await page.setViewportSize({ width, height });
    await expectFit();
  }
  await page.setViewportSize({ width: 1280, height: 636 });
  await page.getByRole('button', { name: 'Focus alpha', exact: true }).click();
  await expectFit();
  await page.getByRole('button', { name: 'Show all streams', exact: true }).click();
  await expectFit();
  await page.getByRole('button', { name: 'Fullscreen alpha', exact: true }).click();
  await expect.poll(() => page.evaluate(() => {
    const rect = document.fullscreenElement?.getBoundingClientRect();
    return rect?.width === innerWidth && rect?.height === innerHeight;
  })).toBe(true);
  await page.evaluate(() => document.exitFullscreen());
  await expectFit();

  await page.getByRole('button', { name: 'Toggle sidebar (Ctrl+B)', exact: true }).click();
  await page.getByLabel('Channel or Twitch URL').fill('delta echo foxtrot golf hotel');
  await page.getByRole('button', { name: 'Add channels', exact: true }).click();
  await expect(page.locator('.video-host iframe')).toHaveCount(8);
  for (const columns of ['1', '2', '3', '4', 'auto']) {
    await page.getByLabel('Layout', { exact: true }).selectOption(columns);
    await expectFit();
  }
  await page.getByRole('button', { name: 'Open chat for alpha', exact: true }).click();
  await expectFit();
  await page.getByLabel('Hide offline streams', { exact: true }).check();
  await page.evaluate(() => {
    (window as unknown as { __players: Record<string, { emit(event: string): void }> }).__players.alpha.emit('offline');
  });
  await expect(page.locator('[data-channel="alpha"]')).toHaveClass(/parked/);
  await expectFit();
  expect(await page.evaluate(() => {
    const retained = (window as unknown as { retainedFrames: Element[] }).retainedFrames;
    return retained.every((frame, index) => frame.isConnected && frame === document.querySelectorAll('.video-host iframe')[index]);
  })).toBe(true);
});
