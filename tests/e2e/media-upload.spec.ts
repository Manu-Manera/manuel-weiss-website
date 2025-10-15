import { test, expect } from '@playwright/test';

test.describe('Media Upload Flow', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/admin');
    // Login as admin
    await page.click('[data-testid="login-button"]');
    await page.fill('input[type="email"]', 'admin@example.com');
    await page.fill('input[type="password"]', 'adminpassword123');
    await page.click('[data-testid="login-submit"]');
  });

  test('should display upload area', async ({ page }) => {
    await expect(page.locator('[data-testid="upload-area"]')).toBeVisible();
    await expect(page.locator('[data-testid="upload-dropzone"]')).toBeVisible();
  });

  test('should accept file selection', async ({ page }) => {
    const fileInput = page.locator('input[type="file"]');
    await fileInput.setInputFiles('tests/fixtures/test-image.jpg');
    
    await expect(page.locator('[data-testid="file-preview"]')).toBeVisible();
    await expect(page.locator('[data-testid="upload-button"]')).toBeEnabled();
  });

  test('should show progress during upload', async ({ page }) => {
    const fileInput = page.locator('input[type="file"]');
    await fileInput.setInputFiles('tests/fixtures/test-image.jpg');
    
    await page.click('[data-testid="upload-button"]');
    
    await expect(page.locator('[data-testid="upload-progress"]')).toBeVisible();
    await expect(page.locator('[data-testid="upload-status"]')).toContainText('Uploading');
  });

  test('should handle upload success', async ({ page }) => {
    const fileInput = page.locator('input[type="file"]');
    await fileInput.setInputFiles('tests/fixtures/test-image.jpg');
    
    await page.click('[data-testid="upload-button"]');
    
    // Wait for upload completion
    await expect(page.locator('[data-testid="upload-success"]')).toBeVisible({ timeout: 10000 });
    await expect(page.locator('[data-testid="media-gallery"]')).toContainText('test-image.jpg');
  });

  test('should handle upload error', async ({ page }) => {
    const fileInput = page.locator('input[type="file"]');
    await fileInput.setInputFiles('tests/fixtures/invalid-file.txt');
    
    await page.click('[data-testid="upload-button"]');
    
    await expect(page.locator('[data-testid="upload-error"]')).toBeVisible();
  });

  test('should support drag and drop', async ({ page }) => {
    const dropzone = page.locator('[data-testid="upload-dropzone"]');
    const file = 'tests/fixtures/test-image.jpg';
    
    await dropzone.dispatchEvent('drop', {
      dataTransfer: {
        files: [file]
      }
    });
    
    await expect(page.locator('[data-testid="file-preview"]')).toBeVisible();
  });

  test('should validate file size', async ({ page }) => {
    const fileInput = page.locator('input[type="file"]');
    await fileInput.setInputFiles('tests/fixtures/large-file.jpg');
    
    await expect(page.locator('[data-testid="file-error"]')).toContainText('too large');
  });

  test('should validate file type', async ({ page }) => {
    const fileInput = page.locator('input[type="file"]');
    await fileInput.setInputFiles('tests/fixtures/invalid-file.exe');
    
    await expect(page.locator('[data-testid="file-error"]')).toContainText('not allowed');
  });
});
