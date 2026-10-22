import { test, expect } from '@playwright/test';
import { fakeTwitch } from './fake-twitch';

test('default quality recovers when Twitch ignores the first setter without replacing the player', async ({ page }) => {
  await fakeTwitch(page); await page.goto('/');
  await page.getByLabel('Channel or Twitch URL').fill('coachboop');
  await page.getByRole('button', { name: 'Add channels', exact: true }).click();
  await expect(page.locator('[data-channel="coachboop"]').getByRole('img', { name: 'Live', exact: true })).toBeVisible();
  const frame = await page.locator('.video-host iframe').elementHandle();
  await page.evaluate(() => {
    const player = (window as unknown as { __players: Record<string, { quality: string; acknowledged?: boolean; getQuality(): string; getQualities(): { group: string }[]; setQuality(value: string): void }> }).__players.coachboop;
    player.quality = 'chunked';
    player.getQualities = () => [{ group: 'auto' }, { group: 'chunked' }, { group: '360p30' }];
    const setQuality = player.setQuality.bind(player);
    const getQuality = player.getQuality.bind(player);
    player.getQuality = () => { const quality = getQuality(); if (quality === '360p30') player.acknowledged = true; return quality; };
    let ignored = false;
    player.setQuality = value => {
      if (value === '360p30' && !ignored) { ignored = true; return; }
      setQuality(value);
    };
  });
  await page.getByLabel('Global quality preference').selectOption('360p');
  const selected = () => page.evaluate(() => (window as unknown as { __players: Record<string, { quality: string }> }).__players.coachboop.quality);
  await expect.poll(selected, { timeout: 10000 }).toBe('360p30');
  await expect.poll(() => page.evaluate(() => (window as unknown as { __players: Record<string, { acknowledged?: boolean }> }).__players.coachboop.acknowledged)).toBe(true);
  expect(await frame!.evaluate(node => node.isConnected)).toBe(true);
  await page.evaluate(() => { (window as unknown as { __players: Record<string, { quality: string }> }).__players.coachboop.quality = 'chunked'; });
  await page.getByLabel('Layout').selectOption('2');
  await page.waitForTimeout(2500);
  expect(await selected()).toBe('chunked');
});

test('changing default quality applies to every stream and clears old overrides without replacing players', async ({ page }) => {
  await fakeTwitch(page);
  await page.goto('/');
  await page.getByLabel('Channel or Twitch URL').fill('alpha bravo');
  await page.getByRole('button', { name: 'Add channels', exact: true }).click();
  await expect(page.locator('[data-channel="bravo"]').getByRole('img', { name: 'Live', exact: true })).toBeVisible();
  await page.evaluate(() => {
    const data = JSON.parse(localStorage.getItem('twitch-multiplayer:v2')!);
    data.session.channels[1].quality = '720p60';
    localStorage.setItem('twitch-multiplayer:v2', JSON.stringify(data));
  });
  await page.reload();
  const installQualities = async () => {
    await expect(page.locator('[data-channel="bravo"]').getByRole('img', { name: 'Live', exact: true })).toBeVisible();
    await page.evaluate(() => {
      const players = (window as unknown as { __players: Record<string, { getQualities(): { group: string; name: string }[] }> }).__players;
      for (const player of Object.values(players)) player.getQualities = () => [
        { group: 'auto', name: 'Auto' }, { group: 'chunked', name: '1080p60 (Source)' },
        { group: '720p60', name: '720p60' }, { group: '480p30', name: '480p' }, { group: '360p30', name: '360p' },
      ];
    });
  };
  const qualities = () => page.evaluate(() => Object.values((window as unknown as { __players: Record<string, { getQuality(): string }> }).__players).map(player => player.getQuality()));
  await installQualities();
  await expect.poll(qualities).toEqual(['auto', '720p60']);
  const frames = await page.locator('.video-host iframe').elementHandles();
  for (const [preference, expected] of [['360p', '360p30'], ['480p', '480p30'], ['auto', 'auto'], ['360p', '360p30']]) {
    await page.getByLabel('Global quality preference').selectOption(preference);
    await expect.poll(qualities).toEqual([expected, expected]);
  }
  expect(await page.evaluate(() => JSON.parse(localStorage.getItem('twitch-multiplayer:v2')!).session.channels.map((channel: { quality: string | null }) => channel.quality))).toEqual([null, null]);
  for (const frame of frames) expect(await frame.evaluate(node => node.isConnected)).toBe(true);
  await page.reload();
  await installQualities();
  await expect(page.getByLabel('Global quality preference')).toHaveValue('360p');
  await expect.poll(qualities).toEqual(['360p30', '360p30']);
});
