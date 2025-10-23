import { test, expect } from '@playwright/test';

test.describe('AI Investment System E2E Tests', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to the admin dashboard
    await page.goto('http://localhost:3000/admin/ai-investments-dashboard.html');
  });

  test('should load AI Investment Dashboard', async ({ page }) => {
    // Check if the dashboard loads correctly
    await expect(page.locator('h1')).toContainText('AI Investment System');
    await expect(page.locator('#dashboard-container')).toBeVisible();
  });

  test('should display real-time signals', async ({ page }) => {
    // Wait for signals to load
    await page.waitForSelector('#signals-container', { timeout: 10000 });
    
    // Check if signals are displayed
    const signalsContainer = page.locator('#signals-container');
    await expect(signalsContainer).toBeVisible();
    
    // Check for signal cards
    const signalCards = page.locator('.signal-card');
    await expect(signalCards).toHaveCount.greaterThan(0);
  });

  test('should show investment proposals', async ({ page }) => {
    // Wait for proposals to load
    await page.waitForSelector('#proposals-container', { timeout: 10000 });
    
    // Check if proposals are displayed
    const proposalsContainer = page.locator('#proposals-container');
    await expect(proposalsContainer).toBeVisible();
    
    // Check for proposal cards
    const proposalCards = page.locator('.proposal-card');
    await expect(proposalCards).toHaveCount.greaterThan(0);
  });

  test('should handle user decisions', async ({ page }) => {
    // Wait for proposals to load
    await page.waitForSelector('#proposals-container', { timeout: 10000 });
    
    // Find the first proposal
    const firstProposal = page.locator('.proposal-card').first();
    await expect(firstProposal).toBeVisible();
    
    // Click accept button
    const acceptButton = firstProposal.locator('.accept-btn');
    await acceptButton.click();
    
    // Check for success message
    await expect(page.locator('.success-message')).toBeVisible();
  });

  test('should display performance metrics', async ({ page }) => {
    // Wait for metrics to load
    await page.waitForSelector('#metrics-container', { timeout: 10000 });
    
    // Check if metrics are displayed
    const metricsContainer = page.locator('#metrics-container');
    await expect(metricsContainer).toBeVisible();
    
    // Check for specific metrics
    await expect(page.locator('#total-pnl')).toBeVisible();
    await expect(page.locator('#win-rate')).toBeVisible();
    await expect(page.locator('#sharpe-ratio')).toBeVisible();
  });

  test('should handle streaming updates', async ({ page }) => {
    // Wait for streaming connection
    await page.waitForSelector('#streaming-status', { timeout: 10000 });
    
    // Check if streaming is connected
    const streamingStatus = page.locator('#streaming-status');
    await expect(streamingStatus).toContainText('Connected');
    
    // Wait for real-time updates
    await page.waitForTimeout(5000);
    
    // Check if updates are received
    const lastUpdate = page.locator('#last-update');
    await expect(lastUpdate).toBeVisible();
  });

  test('should handle error scenarios', async ({ page }) => {
    // Simulate network error
    await page.route('**/api/signals', route => route.abort());
    
    // Check if error is handled gracefully
    await expect(page.locator('.error-message')).toBeVisible();
    
    // Check if retry button is available
    await expect(page.locator('.retry-btn')).toBeVisible();
  });

  test('should support mobile view', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    
    // Check if mobile layout is applied
    await expect(page.locator('.mobile-nav')).toBeVisible();
    
    // Check if content is responsive
    const dashboard = page.locator('#dashboard-container');
    await expect(dashboard).toBeVisible();
  });

  test('should handle authentication', async ({ page }) => {
    // Check if login form is present
    const loginForm = page.locator('#login-form');
    if (await loginForm.isVisible()) {
      // Fill login form
      await page.fill('#username', 'test-user');
      await page.fill('#password', 'test-password');
      await page.click('#login-btn');
      
      // Check if login is successful
      await expect(page.locator('#user-menu')).toBeVisible();
    }
  });

  test('should export data', async ({ page }) => {
    // Wait for data to load
    await page.waitForSelector('#export-btn', { timeout: 10000 });
    
    // Click export button
    await page.click('#export-btn');
    
    // Check if download starts
    const downloadPromise = page.waitForEvent('download');
    await downloadPromise;
  });
});
