import { expect, test } from '@playwright/test';
import { fakeTwitch } from './fake-twitch';

test('fitted players remain visible to Chromium playback visibility checks', async ({ page }) => {
  await fakeTwitch(page);
  await page.setViewportSize({ width: 1363, height: 661 });
  await page.goto('/');
  await page.getByLabel('Channel or Twitch URL').fill('alpha bravo charlie delta echo foxtrot');
  await page.getByRole('button', { name: 'Add channels', exact: true }).click();
  await expect(page.locator('.video-host iframe')).toHaveCount(6);
  await expect.poll(() => page.evaluate(() => new Promise<boolean>(resolve => {
    const frames = [...document.querySelectorAll('.video-host iframe')];
    const states = new Map<Element, boolean>();
    const observer = new IntersectionObserver(entries => {
      for (const entry of entries) states.set(entry.target, (entry as IntersectionObserverEntry & { isVisible: boolean }).isVisible && entry.intersectionRatio > 0.5);
      if (states.size === frames.length) { observer.disconnect(); resolve([...states.values()].every(Boolean)); }
    }, { trackVisibility: true, delay: 100 } as IntersectionObserverInit);
    for (const frame of frames) observer.observe(frame);
  }))).toBe(true);
  await page.getByRole('button', { name: 'Fullscreen alpha', exact: true }).click();
  await expect.poll(() => page.evaluate(() => {
    const rect = document.fullscreenElement?.getBoundingClientRect();
    return !!rect && Math.abs(rect.width - innerWidth) < 1 && Math.abs(rect.height - innerHeight) < 1;
  })).toBe(true);
  await page.evaluate(() => document.exitFullscreen());
  await page.setViewportSize({ width: 390, height: 700 });
  await page.locator('[data-channel="alpha"] iframe').evaluate(frame => {
    const button = document.createElement('button');
    button.textContent = 'Test fitted native fullscreen';
    button.onclick = () => { void frame.requestFullscreen(); };
    button.style.cssText = 'position:fixed;top:0;right:0;z-index:999';
    document.body.append(button);
  });
  await page.getByRole('button', { name: 'Test fitted native fullscreen', exact: true }).click();
  await expect.poll(() => page.evaluate(() => {
    const rect = document.fullscreenElement?.getBoundingClientRect();
    return document.fullscreenElement?.tagName === 'IFRAME' && !!rect && Math.abs(rect.width - innerWidth) < 1 && Math.abs(rect.height - innerHeight) < 1;
  })).toBe(true);
  await page.evaluate(() => document.exitFullscreen());
});

test('play all resumes a stopped player even while the SDK cache still reports playing', async ({ page }) => {
  await fakeTwitch(page);
  await page.goto('/');
  await page.getByLabel('Channel or Twitch URL').fill('alpha bravo');
  await page.getByRole('button', { name: 'Add channels', exact: true }).click();
  await expect.poll(() => page.evaluate(() => Object.values((window as unknown as { __players: Record<string, { paused: boolean }> }).__players ?? {}).map(player => player.paused))).toEqual([false, false]);
  const frames = await page.locator('.video-host iframe').elementHandles();
  await page.evaluate(() => {
    const state = window as unknown as { __players: Record<string, { paused: boolean; isPaused(): boolean }>; __calls: unknown[][] };
    // No SDK event or cached getter update has arrived from the iframe yet.
    state.__players.alpha.paused = true;
    state.__players.alpha.isPaused = () => false;
    state.__calls = [];
  });
  await page.getByRole('button', { name: 'Play all paused streams', exact: true }).click();
  expect(await page.evaluate(() => Object.values((window as unknown as { __players: Record<string, { paused: boolean }> }).__players).map(player => player.paused))).toEqual([false, false]);
  for (const frame of frames) expect(await frame.evaluate(node => node.isConnected)).toBe(true);
});
