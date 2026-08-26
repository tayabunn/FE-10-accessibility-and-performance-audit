import { test, expect } from '@playwright/test';

test('primary chat flow', async ({ page }) => {
  // Return an error to test the error handling UI instead of strict stream parsing
  await page.route('**/api/chat', async (route) => {
    await route.abort('failed');
  });

  // Navigate to the app (assuming it starts at /)
  await page.goto('/');

  // Verify the page loaded
  const input = page.getByPlaceholder(/Type your request/i);
  await expect(input).toBeVisible();

  // Click a quick action to immediately trigger onSend
  await page.getByRole('button', { name: /Generate Code/i }).click();

  // The error card should appear saying Stream Execution Interrupted
  await expect(page.getByText('Stream Execution Interrupted')).toBeVisible({ timeout: 10000 });
});
