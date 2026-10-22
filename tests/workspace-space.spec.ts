import { test, expect } from '@playwright/test';
import { fakeTwitch } from './fake-twitch';

test('workspace uses full height with transfer actions in sidebar Settings', async ({ page }, testInfo) => {
  await fakeTwitch(page);
  await page.goto('/');
  await page.getByLabel('Channel or Twitch URL').fill('alpha bravo');
  await page.getByRole('button', { name: 'Add channels', exact: true }).click();
  await page.getByRole('button', { name: 'Dismiss notice' }).click();
  const frames = await page.locator('.video-host iframe').elementHandles();
  for (const width of [390, 768, 1280, 1440]) {
    await page.setViewportSize({ width, height: 900 });
    await expect(page.locator('.app-header, .watch-toolbar, .workspace-footer')).toHaveCount(0);
    const bounds = (await page.locator('.watch-content').boundingBox())!;
    expect(bounds.y).toBe(0);
    expect(bounds.height).toBe(900);
    const settings = page.getByRole('region', { name: 'Settings', exact: true });
    for (const name of ['Share', 'Backup & import']) {
      await settings.getByRole('button', { name, exact: true }).click();
      await expect(page.getByRole('dialog')).toBeVisible();
      await page.getByRole('button', { name: 'Close transfer panel', exact: true }).click();
    }
    await settings.getByRole('button', { name: 'Maximize video', exact: true }).click();
    await expect(page.locator('.sidebar')).toBeHidden();
    await page.getByRole('button', { name: 'Restore workspace', exact: true }).click();
    await expect(page.locator('.sidebar')).toBeVisible();
    await settings.getByRole('button', { name: 'Maximize video', exact: true }).click();
    await page.keyboard.press('Escape');
    await expect(page.locator('.sidebar')).toBeVisible();
    await page.getByRole('button', { name: 'Toggle sidebar (Ctrl+B)', exact: true }).click();
    await expect(page.locator('.sidebar')).toBeHidden();
    await page.screenshot({ path: testInfo.outputPath(`workspace-${width}.png`) });
    await page.getByRole('button', { name: 'Toggle sidebar (Ctrl+B)', exact: true }).click();
    await expect(page.locator('.sidebar')).toBeVisible();
    for (const frame of frames) expect(await frame.evaluate(node => node.isConnected)).toBe(true);
  }
});
