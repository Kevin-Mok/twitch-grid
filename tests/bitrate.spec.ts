import { expect, test } from '@playwright/test';
import { fakeTwitch } from './fake-twitch';

test('per-stream bitrate sums all reporting streams and marks unavailable/partial data honestly', async ({ page }) => {
  await fakeTwitch(page);
  await page.goto('/');
  const total = page.getByRole('note', { name: 'Combined stream playback bitrate' });
  await expect(total).toContainText('Unavailable');
  await page.getByLabel('Channel or Twitch URL').fill('alpha bravo');
  await page.getByRole('button', { name: 'Add channels', exact: true }).click();
  await expect(page.locator('.fps-indicator').first()).toHaveText('FPS —');
  await page.evaluate(() => {
    const players = (window as unknown as { __players: Record<string, { getPlaybackStats?: () => unknown }> }).__players;
    players.alpha.getPlaybackStats = () => ({ playbackRate: 3000, fps: 60 });
    players.bravo.getPlaybackStats = () => ({ playbackRate: 5000, fps: 60 });
  });
  await expect(page.locator('[data-channel="alpha"] .bitrate-indicator')).toHaveText('↓ 0.38 MB/s');
  await expect(page.locator('[data-channel="bravo"] .bitrate-indicator')).toHaveText('↓ 0.63 MB/s');
  await expect(total).toContainText('1.00 MB/s');
  await expect(total).toContainText('2/2 streams reporting');
  const compactTotal = page.getByRole('note', { name: 'Total stream bandwidth in megabytes per second' });
  await expect(compactTotal).toHaveText('↓ 1.00 MB/s');
  await page.getByRole('button', { name: 'Toggle sidebar (Ctrl+B)', exact: true }).click();
  await expect(page.getByRole('complementary', { name: 'Streams and profiles' })).toHaveCount(0);
  await expect(compactTotal).toBeVisible();
  await expect(compactTotal).toHaveText('↓ 1.00 MB/s');
  await page.getByRole('button', { name: 'Toggle sidebar (Ctrl+B)', exact: true }).click();
  await expect(total).toHaveAttribute('title', /not actual network download speed/i);
  const frame = await page.locator('[data-channel="bravo"] iframe').elementHandle();
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.getByRole('button', { name: 'Open chat for bravo', exact: true }).click();
  const videoRegion = page.locator('.video-region');
  const chat = page.getByRole('complementary', { name: 'Twitch chat' });
  await expect(chat).toBeVisible();
  const readoutBounds = await compactTotal.boundingBox();
  const videoBounds = await videoRegion.boundingBox();
  const chatBounds = await chat.boundingBox();
  expect(readoutBounds!.x + readoutBounds!.width).toBeLessThanOrEqual(chatBounds!.x);
  expect(videoBounds!.x + videoBounds!.width - readoutBounds!.x - readoutBounds!.width).toBeLessThanOrEqual(16);
  expect(videoBounds!.y + videoBounds!.height - readoutBounds!.y - readoutBounds!.height).toBeLessThanOrEqual(12);
  await page.getByRole('button', { name: 'Toggle chat', exact: true }).click();

  for (const width of [390, 768, 1280, 1440]) {
    await page.setViewportSize({ width, height: 900 });
    const badge = await compactTotal.boundingBox();
    expect(badge!.width).toBeLessThan(170);
    expect(badge!.height).toBeLessThan(28);
    expect(badge!.x).toBeGreaterThanOrEqual(0);
    expect(badge!.x + badge!.width).toBeLessThanOrEqual(width);
    expect(await compactTotal.evaluate(el => getComputedStyle(el).pointerEvents)).toBe('none');
    expect(await total.evaluate(el => el.scrollWidth <= el.clientWidth)).toBe(true);
    expect(await page.locator('[data-channel="alpha"] .tile-header').evaluate(el => el.scrollWidth <= el.clientWidth)).toBe(true);
  }
  await page.evaluate(() => (window as unknown as { __players: Record<string, { pause(): void }> }).__players.alpha.pause());
  await expect(page.locator('[data-channel="alpha"] .bitrate-indicator')).toHaveText('Bitrate —');
  await expect(page.locator('[data-channel="alpha"] .fps-indicator')).toHaveText('FPS —');
  await expect(total).toContainText('0.63 MB/s');
  await expect(total).toContainText('1/2 streams reporting · partial');
  await expect(compactTotal).toHaveText('↓ 0.63 MB/s');
  await expect(compactTotal).toHaveAttribute('aria-description', /Partial total/);
  await page.getByRole('button', { name: 'Remove player alpha', exact: true }).click();
  await expect(total).toContainText('1/1 streams reporting');
  expect(await frame!.evaluate(el => el.isConnected)).toBe(true);
  await page.evaluate(() => { delete (window as unknown as { __players: Record<string, { getPlaybackStats?: () => unknown }> }).__players.bravo.getPlaybackStats; });
  await expect(total).toContainText('Unavailable');
  await expect(compactTotal).toHaveText('↓ — MB/s');
  expect(await page.evaluate(() => JSON.parse(localStorage.getItem('twitch-multiplayer:v2')!).session.channels[0])).not.toHaveProperty('bitrateKbps');
});

test('current stream quality appears immediately before FPS and follows player samples', async ({ page }) => {
  await fakeTwitch(page);
  await page.goto('/');
  await page.getByLabel('Channel or Twitch URL').fill('Alpha');
  await page.getByRole('button', { name: 'Add channels', exact: true }).click();
  const quality = page.locator('[data-channel="alpha"] .quality-indicator');
  await expect(quality).toHaveText('Auto');
  for (const [reported, label] of [['720p60', '720p'], ['480p30', '480p'], ['chunked', 'Source'], ['audio_only', 'Audio only'], ['unknown', 'Quality —'], ['', 'Quality —']]) {
    await page.evaluate(value => {
      (window as unknown as { __players: Record<string, { quality: string }> }).__players.alpha.quality = value;
    }, reported);
    await expect(quality).toHaveText(label);
    if (reported === '480p30') {
      await expect(page.locator('[data-channel="alpha"] .fps-indicator')).toHaveText('30 FPS');
      await expect(page.locator('[data-channel="alpha"] .fps-indicator')).toHaveAttribute('title', /advertised/i);
      await page.evaluate(() => {
        (window as unknown as { __players: Record<string, { getPlaybackStats?: () => unknown }> }).__players.alpha.getPlaybackStats = () => ({ fps: 25 });
      });
      await expect(page.locator('[data-channel="alpha"] .fps-indicator')).toHaveText('25 FPS');
      await expect(page.locator('[data-channel="alpha"] .fps-indicator')).toHaveAttribute('title', /Estimated Twitch playback FPS/);
    }
  }
  await expect(page.locator('[data-channel="alpha"] .quality-indicator + .fps-indicator')).toHaveCount(1);
  await expect(quality).toHaveAccessibleName('alpha: current playback quality unavailable');
});
