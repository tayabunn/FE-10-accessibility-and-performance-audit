import { test, expect } from '@playwright/test';

test.describe('Primary User Flow', () => {
  test('user can send a message and receive a streaming AI response', async ({ page }) => {
    // Intercept the AI route to prevent real API calls and ensure deterministic behavior
    await page.route('/api/chat', async (route) => {
      // Mock an SSE streaming response
      const streamBody = [
        'data: {"type": "text_delta", "delta": {"type":"text_delta", "text":"Hello"}}',
        '',
        'data: {"type": "text_delta", "delta": {"type":"text_delta", "text":", how can I help you?"}}',
        '',
        'data: {"type": "finish"}',
        '',
      ].join('\n\n');

      await route.fulfill({
        status: 200,
        contentType: 'text/event-stream',
        body: streamBody,
      });
    });

    // 1. Open the application
    await page.goto('/');

    // 2. Find the primary interactive input
    const input = page.getByPlaceholder(/Type your request/i);
    await expect(input).toBeVisible();

    // 3. Enter valid data
    await input.fill('Test input message');

    // 4. Submit the primary action (Press Enter)
    await input.press('Enter');

    // 5 & 6 & 7. Wait for meaningful UI state changes and verify result
    // The mocked AI response should appear
    const messageResult = page.getByText('Hello, how can I help you?');
    
    // We expect the message to eventually be visible
    await expect(messageResult).toBeVisible({ timeout: 10000 });
    
    // Check that the user message is also visible
    await expect(page.getByText('Test input message')).toBeVisible();
  });
});
