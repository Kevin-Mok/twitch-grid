import { expect, test } from '@playwright/test';
import { fakeTwitch } from './fake-twitch';

test('re-entered casing updates labels without replacing the player and survives reload', async ({ page }) => {
  await fakeTwitch(page);
  await page.goto('/');
  const input = page.getByLabel('Channel or Twitch URL');
  const add = page.getByRole('button', { name: 'Add channels', exact: true });
  await input.fill('risezd'); await add.click();
  const frame = await page.locator('[data-channel="risezd"] iframe').elementHandle();
  await input.fill('https://twitch.tv/Risezd'); await add.click();
  await expect(page.locator('.tile-header strong')).toHaveText('Risezd');
  await expect(page.locator('[data-channel="risezd"]').getByRole('img', { name: 'Live', exact: true })).toBeVisible();
  await expect(page.locator('.status-label.online')).toHaveCount(0);
  await expect(page.locator('.channel-name')).toContainText('Risezd');
  expect(await frame!.evaluate(el => el.isConnected)).toBe(true);
  await expect(page.locator('.video-host iframe')).toHaveCount(1);
  await page.getByRole('button', { name: 'Open chat for risezd', exact: true }).click();
  await expect(page.getByLabel('Chat channel').locator('option:checked')).toHaveText('Risezd');
  await page.reload();
  await expect(page.locator('.tile-header strong')).toHaveText('Risezd');
});
