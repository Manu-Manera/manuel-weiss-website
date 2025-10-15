import { test, expect } from '@playwright/test';

test.describe('Authentication Flow', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('should display login button when not authenticated', async ({ page }) => {
    await expect(page.locator('[data-testid="login-button"]')).toBeVisible();
    await expect(page.locator('[data-testid="user-menu"]')).not.toBeVisible();
  });

  test('should open login modal when clicking login button', async ({ page }) => {
    await page.click('[data-testid="login-button"]');
    await expect(page.locator('[data-testid="login-modal"]')).toBeVisible();
    await expect(page.locator('input[type="email"]')).toBeVisible();
    await expect(page.locator('input[type="password"]')).toBeVisible();
  });

  test('should show validation errors for invalid login', async ({ page }) => {
    await page.click('[data-testid="login-button"]');
    await page.fill('input[type="email"]', 'invalid-email');
    await page.fill('input[type="password"]', '123');
    await page.click('[data-testid="login-submit"]');
    
    await expect(page.locator('[data-testid="login-error"]')).toBeVisible();
  });

  test('should login successfully with valid credentials', async ({ page }) => {
    await page.click('[data-testid="login-button"]');
    await page.fill('input[type="email"]', 'test@example.com');
    await page.fill('input[type="password"]', 'validpassword123');
    await page.click('[data-testid="login-submit"]');
    
    await expect(page.locator('[data-testid="user-menu"]')).toBeVisible();
    await expect(page.locator('[data-testid="login-button"]')).not.toBeVisible();
  });

  test('should logout successfully', async ({ page }) => {
    // Login first
    await page.click('[data-testid="login-button"]');
    await page.fill('input[type="email"]', 'test@example.com');
    await page.fill('input[type="password"]', 'validpassword123');
    await page.click('[data-testid="login-submit"]');
    
    await expect(page.locator('[data-testid="user-menu"]')).toBeVisible();
    
    // Logout
    await page.click('[data-testid="user-menu"]');
    await page.click('[data-testid="logout-button"]');
    
    await expect(page.locator('[data-testid="login-button"]')).toBeVisible();
    await expect(page.locator('[data-testid="user-menu"]')).not.toBeVisible();
  });
});
