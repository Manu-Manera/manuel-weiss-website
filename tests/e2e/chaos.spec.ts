import { test, expect } from '@playwright/test';

test.describe('Chaos Testing', () => {
  test('should handle rapid clicks without breaking', async ({ page }) => {
    await page.goto('/');
    
    const button = page.locator('[data-testid="login-button"]');
    
    // Rapid clicking
    for (let i = 0; i < 10; i++) {
      await button.click();
      await page.waitForTimeout(50);
    }
    
    // Should still work normally
    await expect(page.locator('[data-testid="login-modal"]')).toBeVisible();
  });

  test('should handle network interruptions gracefully', async ({ page }) => {
    await page.goto('/');
    
    // Simulate network issues
    await page.route('**/api/**', route => {
      if (Math.random() < 0.5) {
        route.abort();
      } else {
        route.continue();
      }
    });
    
    await page.click('[data-testid="login-button"]');
    await page.fill('input[type="email"]', 'test@example.com');
    await page.fill('input[type="password"]', 'password123');
    await page.click('[data-testid="login-submit"]');
    
    // Should show error handling
    await expect(page.locator('[data-testid="error-message"]')).toBeVisible();
  });

  test('should handle memory pressure', async ({ page }) => {
    await page.goto('/');
    
    // Simulate memory pressure by creating many elements
    await page.evaluate(() => {
      for (let i = 0; i < 1000; i++) {
        const div = document.createElement('div');
        div.textContent = `Test ${i}`;
        document.body.appendChild(div);
      }
    });
    
    // App should still be functional
    await page.click('[data-testid="login-button"]');
    await expect(page.locator('[data-testid="login-modal"]')).toBeVisible();
  });

  test('should handle slow network conditions', async ({ page }) => {
    await page.goto('/');
    
    // Simulate slow network
    await page.route('**/api/**', route => {
      setTimeout(() => route.continue(), 5000);
    });
    
    await page.click('[data-testid="login-button"]');
    await page.fill('input[type="email"]', 'test@example.com');
    await page.fill('input[type="password"]', 'password123');
    await page.click('[data-testid="login-submit"]');
    
    // Should show loading state
    await expect(page.locator('[data-testid="loading-spinner"]')).toBeVisible();
  });

  test('should handle invalid data gracefully', async ({ page }) => {
    await page.goto('/');
    
    // Inject invalid data
    await page.evaluate(() => {
      localStorage.setItem('invalid_data', JSON.stringify({ corrupted: true }));
    });
    
    await page.reload();
    
    // App should still work
    await expect(page.locator('[data-testid="login-button"]')).toBeVisible();
  });

  test('should handle concurrent operations', async ({ page }) => {
    await page.goto('/');
    
    // Start multiple operations simultaneously
    const promises = [
      page.click('[data-testid="login-button"]'),
      page.click('[data-testid="login-button"]'),
      page.click('[data-testid="login-button"]')
    ];
    
    await Promise.all(promises);
    
    // Should handle gracefully
    await expect(page.locator('[data-testid="login-modal"]')).toBeVisible();
  });

  test('should handle browser back/forward navigation', async ({ page }) => {
    await page.goto('/');
    await page.click('[data-testid="login-button"]');
    await page.goBack();
    await page.goForward();
    
    // Should maintain state
    await expect(page.locator('[data-testid="login-modal"]')).toBeVisible();
  });

  test('should handle window resize', async ({ page }) => {
    await page.goto('/');
    
    // Resize window multiple times
    await page.setViewportSize({ width: 320, height: 568 });
    await page.setViewportSize({ width: 1920, height: 1080 });
    await page.setViewportSize({ width: 768, height: 1024 });
    
    // App should still be functional
    await expect(page.locator('[data-testid="login-button"]')).toBeVisible();
  });
});
