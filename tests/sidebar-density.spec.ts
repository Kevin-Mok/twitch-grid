import { test, expect } from '@playwright/test';
import { fakeTwitch } from './fake-twitch';

test('sidebar keeps controls and channel actions compact', async ({ page }, testInfo) => {
  await fakeTwitch(page);
  await page.goto('/');
  await page.getByLabel('Channel or Twitch URL').fill('coachboop npen mrsavage venofn');
  await page.getByRole('button', { name: 'Add channels', exact: true }).click();
  for (const width of [1280, 390]) {
    await page.setViewportSize({ width, height: 900 });
    for (const button of await page.locator('.stream-controls button').all()) {
      expect((await button.boundingBox())!.height).toBeLessThanOrEqual(32);
      expect(await button.evaluate(node => node.scrollWidth <= node.clientWidth)).toBe(true);
    }
    for (const row of await page.locator('.channel-list li').all()) {
      expect((await row.boundingBox())!.height).toBeLessThanOrEqual(40);
      expect(await row.evaluate(node => node.scrollWidth <= node.clientWidth)).toBe(true);
      const name = (await row.locator('.channel-name').boundingBox())!;
      const actions = (await row.locator('.channel-actions').boundingBox())!;
      expect(actions.x).toBeGreaterThanOrEqual(name.x + name.width - 1);
    }
    await page.screenshot({ path: testInfo.outputPath(`sidebar-${width}.png`) });
  }
});
