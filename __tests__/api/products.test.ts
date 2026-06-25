/**
 * @jest-environment node
 */

import { NextResponse } from 'next/server'

// Mock Prisma
jest.mock('@/app/lib/db', () => ({
  prisma: {
    product: {
      findMany: jest.fn(),
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
    category: {
      findUnique: jest.fn(),
    },
  },
}))

// Mock auth
jest.mock('@/app/lib/auth', () => ({
  getSession: jest.fn(),
}))

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

  describe('GET /api/products', () => {
    test('should return array of products', async () => {
      const { prisma } = await import('@/app/lib/db')
      const mockProducts = [
        {
          id: '1',
          name: 'Product 1',
          price: 24.99,
          category: { id: '1', name: 'Dark' },
        },
      ]

      ;(prisma.product.findMany as jest.Mock).mockResolvedValue(mockProducts)

      const { GET } = await import('@/app/api/products/route')
      const mockRequest = { url: 'http://localhost/api/products' } as Request
      const response = await GET(mockRequest)
      const data = await response.json()

      expect(Array.isArray(data)).toBe(true)
      expect(data).toHaveLength(1)
      expect(data[0]).toHaveProperty('id')
      expect(data[0]).toHaveProperty('name')
      expect(data[0]).toHaveProperty('price')
    })

    test('should filter by categoryId', async () => {
      const { prisma } = await import('@/app/lib/db')
      ;(prisma.product.findMany as jest.Mock).mockResolvedValue([])

      const { GET } = await import('@/app/api/products/route')
      const mockRequest = { url: 'http://localhost/api/products?categoryId=1' } as Request
      await GET(mockRequest)

      expect(prisma.product.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { categoryId: '1' },
        })
      )
    })

    test('should handle errors', async () => {
      const { prisma } = await import('@/app/lib/db')
      ;(prisma.product.findMany as jest.Mock).mockRejectedValue(new Error('Database error'))

      const { GET } = await import('@/app/api/products/route')
      const mockRequest = { url: 'http://localhost/api/products' } as Request
      const response = await GET(mockRequest)
      const data = await response.json()

      expect(response.status).toBe(500)
      expect(data).toHaveProperty('error')
    })
  })

  describe('POST /api/products', () => {
    test('should create new product with authentication', async () => {
      const { prisma } = await import('@/app/lib/db')
      const { getSession } = await import('@/app/lib/auth')

      ;(getSession as jest.Mock).mockResolvedValue({ user: { id: 'admin-id' } })
      ;(prisma.category.findUnique as jest.Mock).mockResolvedValue({ id: '1', name: 'Dark' })
      ;(prisma.product.create as jest.Mock).mockResolvedValue({
        id: '1',
        name: 'New Chocolate',
        price: 29.99,
      })

      const { POST } = await import('@/app/api/products/route')
      const mockRequest = {
        json: async () => ({
          name: 'New Chocolate',
          nameAr: 'New Chocolate Ar',
          description: 'Test description',
          descriptionAr: 'Test description Ar',
          price: 29.99,
          categoryId: '1',
          image: '/test.jpg',
        }),
      } as Request

      const response = await POST(mockRequest)
      const data = await response.json()

      expect(response.status).toBe(201)
      expect(data).toHaveProperty('id')
      expect(data.name).toBe('New Chocolate')
      expect(data.price).toBe(29.99)
    })

    test('should reject unauthenticated requests', async () => {
      const { getSession } = await import('@/app/lib/auth')
      ;(getSession as jest.Mock).mockResolvedValue(null)

      const { POST } = await import('@/app/api/products/route')
      const mockRequest = {
        json: async () => ({ name: 'Test' }),
      } as Request

      const response = await POST(mockRequest)
      const data = await response.json()

      expect(response.status).toBe(401)
      expect(data.error).toBe('Unauthorized')
    })

    test('should validate required fields', async () => {
      const { getSession } = await import('@/app/lib/auth')
      ;(getSession as jest.Mock).mockResolvedValue({ user: { id: 'admin-id' } })

      const { POST } = await import('@/app/api/products/route')
      const mockRequest = {
        json: async () => ({ name: 'Test', price: 10 }),
      } as Request

      const response = await POST(mockRequest)
      const data = await response.json()

      expect(response.status).toBe(400)
      expect(data.error).toContain('required')
    })

    test('should validate category exists', async () => {
      const { prisma } = await import('@/app/lib/db')
      const { getSession } = await import('@/app/lib/auth')

      ;(getSession as jest.Mock).mockResolvedValue({ user: { id: 'admin-id' } })
      ;(prisma.category.findUnique as jest.Mock).mockResolvedValue(null)

      const { POST } = await import('@/app/api/products/route')
      const mockRequest = {
        json: async () => ({
          name: 'Test',
          nameAr: 'Test Ar',
          description: 'Test',
          descriptionAr: 'Test Ar',
          price: 10,
          categoryId: '999',
          image: '/test.jpg',
        }),
      } as Request

      const response = await POST(mockRequest)
      const data = await response.json()

      expect(response.status).toBe(404)
      expect(data.error).toBe('Category not found')
    })
  })
})

describe('Products [id] API', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('GET /api/products/[id]', () => {
    test('should return single product', async () => {
      const { prisma } = await import('@/app/lib/db')
      const mockProduct = {
        id: '1',
        name: 'Product 1',
        category: { id: '1', name: 'Dark' },
      }

      ;(prisma.product.findUnique as jest.Mock).mockResolvedValue(mockProduct)

      const { GET } = await import('@/app/api/products/[id]/route')
      const response = await GET({} as Request, { params: { id: '1' } })
      const data = await response.json()

      expect(data).toHaveProperty('name')
      expect(data).toHaveProperty('category')
    })

    test('should return 404 for non-existent product', async () => {
      const { prisma } = await import('@/app/lib/db')
      ;(prisma.product.findUnique as jest.Mock).mockResolvedValue(null)

      const { GET } = await import('@/app/api/products/[id]/route')
      const response = await GET({} as Request, { params: { id: '999' } })
      const data = await response.json()

      expect(response.status).toBe(404)
      expect(data.error).toBe('Product not found')
    })
  })

  describe('PUT /api/products/[id]', () => {
    test('should update product', async () => {
      const { prisma } = await import('@/app/lib/db')
      const { getSession } = await import('@/app/lib/auth')

      ;(getSession as jest.Mock).mockResolvedValue({ user: { id: 'admin-id' } })
      ;(prisma.product.findUnique as jest.Mock).mockResolvedValue({
        id: '1',
        name: 'Old Name',
        price: 20,
      })
      ;(prisma.product.update as jest.Mock).mockResolvedValue({
        id: '1',
        name: 'Updated Chocolate',
        price: 35.99,
      })

      const { PUT } = await import('@/app/api/products/[id]/route')
      const mockRequest = {
        json: async () => ({
          name: 'Updated Chocolate',
          price: 35.99,
        }),
      } as Request

      const response = await PUT(mockRequest, { params: { id: '1' } })
      const data = await response.json()

      expect(data.name).toBe('Updated Chocolate')
      expect(data.price).toBe(35.99)
    })

    test('should return 404 for non-existent product', async () => {
      const { prisma } = await import('@/app/lib/db')
      const { getSession } = await import('@/app/lib/auth')

      ;(getSession as jest.Mock).mockResolvedValue({ user: { id: 'admin-id' } })
      ;(prisma.product.findUnique as jest.Mock).mockResolvedValue(null)

      const { PUT } = await import('@/app/api/products/[id]/route')
      const mockRequest = {
        json: async () => ({ name: 'Test' }),
      } as Request

      const response = await PUT(mockRequest, { params: { id: '999' } })
      const data = await response.json()

      expect(response.status).toBe(404)
      expect(data.error).toBe('Product not found')
    })
  })

  describe('DELETE /api/products/[id]', () => {
    test('should delete product', async () => {
      const { prisma } = await import('@/app/lib/db')
      const { getSession } = await import('@/app/lib/auth')

      ;(getSession as jest.Mock).mockResolvedValue({ user: { id: 'admin-id' } })
      ;(prisma.product.findUnique as jest.Mock).mockResolvedValue({ id: '1', name: 'Test' })
      ;(prisma.product.delete as jest.Mock).mockResolvedValue({ id: '1' })

      const { DELETE } = await import('@/app/api/products/[id]/route')
      const response = await DELETE({} as Request, { params: { id: '1' } })
      const data = await response.json()

      expect(data.success).toBe(true)
    })

    test('should reject unauthenticated delete requests', async () => {
      const { getSession } = await import('@/app/lib/auth')
      ;(getSession as jest.Mock).mockResolvedValue(null)

      const { DELETE } = await import('@/app/api/products/[id]/route')
      const response = await DELETE({} as Request, { params: { id: '1' } })
      const data = await response.json()

      expect(response.status).toBe(401)
      expect(data.error).toBe('Unauthorized')
    })
  })
})
