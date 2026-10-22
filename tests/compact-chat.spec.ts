import { test, expect } from '@playwright/test';
import { fakeTwitch } from './fake-twitch';

test('compact chat and maximize video retain embeds at supported widths', async ({ page }, testInfo) => {
  await fakeTwitch(page);
  await page.goto('/');
  await page.getByLabel('Channel or Twitch URL').fill('alpha bravo');
  await page.getByRole('button', { name: 'Add channels', exact: true }).click();
  await page.getByRole('button', { name: 'Dismiss notice' }).click();
  await expect(page.locator('.video-host iframe')).toHaveCount(2);
  const initialPlayers = await page.locator('.video-host iframe').elementHandles();
  await page.getByRole('button', { name: 'Maximize video', exact: true }).click();
  await expect(page.locator('.sidebar')).toBeHidden();
  await page.getByRole('button', { name: 'Restore workspace', exact: true }).click();
  await expect(page.locator('.sidebar')).toBeVisible();
  for (const frame of initialPlayers) expect(await frame.evaluate(node => node.isConnected)).toBe(true);
  await page.getByRole('button', { name: 'Toggle sidebar (Ctrl+B)', exact: true }).click();
  await page.getByRole('button', { name: 'Open chat for alpha', exact: true }).click();
  const chat = page.locator('.chat-frame');
  await expect(page.getByRole('combobox', { name: 'Chat channel', exact: true })).toHaveValue('alpha');
  const frames = await page.locator('.video-host iframe, .chat-frame').elementHandles();
  for (const width of [390, 768, 1280, 1440]) {
    await page.setViewportSize({ width, height: 900 });
    const collapsed = (await chat.boundingBox())!.height;
    if (width === 390 || width === 1440) await page.screenshot({ path: testInfo.outputPath(`compact-${width}.png`) });
    await expect(page.getByRole('combobox', { name: 'Chat channel', exact: true })).toBeVisible();
    await page.getByRole('button', { name: 'Chat help', exact: true }).click();
    await expect(page.getByRole('link', { name: 'Open chat on Twitch' })).toBeVisible();
    expect((await chat.boundingBox())!.height).toBeLessThan(collapsed);
    await page.getByRole('button', { name: 'Chat help', exact: true }).click();
    await page.getByRole('button', { name: 'Toggle sidebar (Ctrl+B)', exact: true }).click();
    await page.getByRole('button', { name: 'Maximize video', exact: true }).click();
    await expect(page.locator('.app-header')).toBeHidden();
    await expect(page.locator('.watch-toolbar')).toBeHidden();
    await expect(page.locator('.workspace-footer')).toBeHidden();
    const restore = page.getByRole('button', { name: 'Restore workspace', exact: true });
    await expect(restore).toBeVisible();
    const bounds = (await restore.boundingBox())!;
    expect(bounds.x).toBeGreaterThanOrEqual(0);
    expect(bounds.x + bounds.width).toBeLessThanOrEqual(width);
    expect((await page.locator('.watch-content').boundingBox())!.height).toBe(900);
    if (width === 390 || width === 1440) await page.screenshot({ path: testInfo.outputPath(`maximized-${width}.png`) });
    // Escape must restore even while a normal app select has keyboard focus.
    await page.getByRole('combobox', { name: 'Chat channel', exact: true }).focus();
    await page.keyboard.press('Escape');
    await expect(page.locator('.sidebar')).toBeVisible();
    await page.getByRole('button', { name: 'Toggle sidebar (Ctrl+B)', exact: true }).click();
    for (const frame of frames) expect(await frame.evaluate(node => node.isConnected)).toBe(true);
  }
  await page.getByRole('button', { name: 'Toggle sidebar (Ctrl+B)', exact: true }).click();
  await page.getByRole('button', { name: 'Maximize video', exact: true }).click();
  await page.getByRole('button', { name: 'Restore workspace', exact: true }).click();
  await expect(page.locator('.sidebar')).toBeVisible();
});
