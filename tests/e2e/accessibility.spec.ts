import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

test.describe('Accessibility Tests', () => {
  test('should not have any automatically detectable accessibility issues', async ({ page }) => {
    await page.goto('/');
    
    const accessibilityScanResults = await new AxeBuilder({ page }).analyze();
    
    expect(accessibilityScanResults.violations).toEqual([]);
  });

  test('should have proper heading structure', async ({ page }) => {
    await page.goto('/');
    
    const h1 = page.locator('h1');
    await expect(h1).toHaveCount(1);
    
    const headings = page.locator('h1, h2, h3, h4, h5, h6');
    const headingTexts = await headings.allTextContents();
    
    // Check for proper heading hierarchy
    expect(headingTexts[0]).toMatch(/h1/i);
  });

  test('should have proper form labels', async ({ page }) => {
    await page.goto('/');
    await page.click('[data-testid="login-button"]');
    
    const emailInput = page.locator('input[type="email"]');
    const passwordInput = page.locator('input[type="password"]');
    
    await expect(emailInput).toHaveAttribute('aria-label');
    await expect(passwordInput).toHaveAttribute('aria-label');
  });

  test('should support keyboard navigation', async ({ page }) => {
    await page.goto('/');
    
    // Tab through interactive elements
    await page.keyboard.press('Tab');
    await expect(page.locator(':focus')).toBeVisible();
    
    // Enter should activate focused button
    await page.keyboard.press('Enter');
    await expect(page.locator('[data-testid="login-modal"]')).toBeVisible();
  });

  test('should have proper color contrast', async ({ page }) => {
    await page.goto('/');
    
    const accessibilityScanResults = await new AxeBuilder({ page })
      .withTags(['color-contrast'])
      .analyze();
    
    expect(accessibilityScanResults.violations).toEqual([]);
  });

  test('should have proper focus indicators', async ({ page }) => {
    await page.goto('/');
    
    const button = page.locator('[data-testid="login-button"]');
    await button.focus();
    
    const focusStyles = await button.evaluate(el => {
      const styles = window.getComputedStyle(el);
      return {
        outline: styles.outline,
        boxShadow: styles.boxShadow
      };
    });
    
    expect(focusStyles.outline).not.toBe('none');
  });

  test('should have proper ARIA attributes', async ({ page }) => {
    await page.goto('/');
    
    const modal = page.locator('[data-testid="login-modal"]');
    await page.click('[data-testid="login-button"]');
    
    await expect(modal).toHaveAttribute('role', 'dialog');
    await expect(modal).toHaveAttribute('aria-modal', 'true');
  });

  test('should support screen readers', async ({ page }) => {
    await page.goto('/');
    
    const accessibilityScanResults = await new AxeBuilder({ page })
      .withTags(['screen-reader'])
      .analyze();
    
    expect(accessibilityScanResults.violations).toEqual([]);
  });
});
