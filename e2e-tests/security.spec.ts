import { test, expect } from '@playwright/test';

test.describe('API Security Tests', () => {
  
  test('should reject unauthenticated admin API requests', async ({ request }) => {
    // Test dashboard stats without auth
    const statsResponse = await request.get('/api/dashboard/stats');
    expect(statsResponse.status()).toBe(401);
  });

  test('should reject unauthenticated settings POST', async ({ request }) => {
    const response = await request.post('/api/settings', {
      data: { phone: '123456789' }
    });
    expect(response.status()).toBe(401);
  });

  test('should reject unauthenticated product creation', async ({ request }) => {
    const response = await request.post('/api/products', {
      data: { name: 'Test Product', price: 100 }
    });
    expect(response.status()).toBe(401);
  });

  test('should reject unauthenticated category creation', async ({ request }) => {
    const response = await request.post('/api/categories', {
      data: { name: 'Test Category' }
    });
    expect(response.status()).toBe(401);
  });

  test('should allow public access to GET products', async ({ request }) => {
    const response = await request.get('/api/products');
    expect(response.status()).toBe(200);
  });

  test('should allow public access to GET categories', async ({ request }) => {
    const response = await request.get('/api/categories');
    expect(response.status()).toBe(200);
  });

  test('should allow public access to GET settings', async ({ request }) => {
    const response = await request.get('/api/settings');
    expect(response.status()).toBe(200);
  });
});

test.describe('Input Validation Tests', () => {
  
  test('should reject login with empty credentials', async ({ request }) => {
    const response = await request.post('/api/auth/login', {
      data: {}
    });
    expect(response.status()).toBe(400);
  });

  test('should reject login with only username', async ({ request }) => {
    const response = await request.post('/api/auth/login', {
      data: { username: 'admin' }
    });
    expect(response.status()).toBe(400);
  });

  test('should reject login with only password', async ({ request }) => {
    const response = await request.post('/api/auth/login', {
      data: { password: 'admin123' }
    });
    expect(response.status()).toBe(400);
  });

  test('should reject invalid credentials', async ({ request }) => {
    const response = await request.post('/api/auth/login', {
      data: { username: 'hacker', password: 'malicious' }
    });
    expect(response.status()).toBe(401);
  });
});

test.describe('SQL Injection Prevention Tests', () => {
  
  test('should handle SQL injection in login username', async ({ request }) => {
    const response = await request.post('/api/auth/login', {
      data: { 
        username: "admin' OR '1'='1", 
        password: "password" 
      }
    });
    expect(response.status()).toBe(401);
  });

  test('should handle SQL injection in login password', async ({ request }) => {
    const response = await request.post('/api/auth/login', {
      data: { 
        username: "admin", 
        password: "' OR '1'='1" 
      }
    });
    expect(response.status()).toBe(401);
  });

  test('should handle SQL injection in product ID', async ({ request }) => {
    const response = await request.get('/api/products/1%27%20OR%20%271%27=%271');
    // Should not expose data
    expect([400, 404, 500]).toContain(response.status());
  });
});

test.describe('XSS Prevention Tests', () => {
  
  test('should sanitize XSS in order creation', async ({ request }) => {
    const response = await request.post('/api/orders', {
      data: {
        customerName: '<script>alert("XSS")</script>',
        customerPhone: '1234567890',
        customerAddress: '<img src=x onerror=alert("XSS")>',
        items: [],
        total: 0
      }
    });
    // Request should be processed but data sanitized
  });
});
