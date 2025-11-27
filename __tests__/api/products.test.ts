/**
 * @jest-environment node
 */

import { NextResponse } from 'next/server'

// Mock NextResponse
jest.mock('next/server', () => ({
  NextResponse: {
    json: jest.fn((data, init) => ({
      json: async () => data,
      status: init?.status || 200,
      ok: !init?.status || init.status < 400,
    })),
  },
}))

describe('Products API', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  test('GET /api/products should return array of products', async () => {
    const { GET } = await import('@/app/api/products/route')
    const response = await GET()
    const data = await response.json()

    expect(Array.isArray(data)).toBe(true)
    expect(data.length).toBeGreaterThan(0)
    expect(data[0]).toHaveProperty('id')
    expect(data[0]).toHaveProperty('name')
    expect(data[0]).toHaveProperty('price')
    expect(data[0]).toHaveProperty('category')
  })

  test('POST /api/products should create new product', async () => {
    const { POST } = await import('@/app/api/products/route')
    
    const mockRequest = {
      json: async () => ({
        name: 'New Chocolate',
        description: 'Test description',
        price: 29.99,
        category: 'Dark',
        image: '/test.jpg',
        isAvailable: true,
      }),
    } as Request

    const response = await POST(mockRequest)
    const data = await response.json()

    expect(data).toHaveProperty('id')
    expect(data.name).toBe('New Chocolate')
    expect(data.price).toBe(29.99)
  })

  test('products should have required fields', async () => {
    const { GET } = await import('@/app/api/products/route')
    const response = await GET()
    const data = await response.json()

    data.forEach((product: any) => {
      expect(product).toHaveProperty('id')
      expect(product).toHaveProperty('name')
      expect(product).toHaveProperty('description')
      expect(product).toHaveProperty('price')
      expect(product).toHaveProperty('category')
      expect(product).toHaveProperty('image')
      expect(product).toHaveProperty('isAvailable')
    })
  })
})
