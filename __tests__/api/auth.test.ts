/**
 * @jest-environment node
 */

// Mock Prisma first
jest.mock('@/app/lib/db', () => ({
  prisma: {
    user: {
      findUnique: jest.fn(),
    },
  },
}))

// Mock bcryptjs
jest.mock('bcryptjs', () => ({
  compare: jest.fn(),
}))

// Mock auth functions
jest.mock('@/app/lib/auth', () => ({
  login: jest.fn(),
  getSession: jest.fn(),
}))

jest.mock('next/server', () => ({
  NextResponse: {
    json: jest.fn((data, init) => ({
      json: async () => data,
      status: init?.status || 200,
      ok: !init?.status || init.status < 400,
    })),
  },
}))

describe('Auth API', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  test('POST /api/auth/login should succeed with correct credentials', async () => {
    const bcrypt = await import('bcryptjs')
    const { prisma } = await import('@/app/lib/db')
    const { login } = await import('@/app/lib/auth')

    // Setup mocks
    ;(prisma.user.findUnique as jest.Mock).mockResolvedValue({
      id: '1',
      username: 'admin',
      password: '$2a$10$hashedpassword',
    })
    ;(bcrypt.compare as jest.Mock).mockResolvedValue(true)
    ;(login as jest.Mock).mockResolvedValue({ id: '1', username: 'admin' })

    const { POST } = await import('@/app/api/auth/login/route')
    
    const mockRequest = {
      json: async () => ({
        username: 'admin',
        password: 'admin123',
      }),
    } as Request

    const response = await POST(mockRequest)
    const data = await response.json()

    expect(data).toHaveProperty('success')
    expect(data.success).toBe(true)
  })

  test('POST /api/auth/login should fail with incorrect credentials', async () => {
    const bcrypt = await import('bcryptjs')
    const { prisma } = await import('@/app/lib/db')

    // Setup mocks for failed login
    ;(prisma.user.findUnique as jest.Mock).mockResolvedValue({
      id: '1',
      username: 'admin',
      password: '$2a$10$hashedpassword',
    })
    ;(bcrypt.compare as jest.Mock).mockResolvedValue(false)

    const { POST } = await import('@/app/api/auth/login/route')
    
    const mockRequest = {
      json: async () => ({
        username: 'admin',
        password: 'wrongpassword',
      }),
    } as Request

    const response = await POST(mockRequest)
    const data = await response.json()

    expect(data).toHaveProperty('error')
    expect(response.status).toBe(401)
  })

  test('should validate required fields', async () => {
    const { POST } = await import('@/app/api/auth/login/route')
    
    const mockRequest = {
      json: async () => ({
        username: 'admin',
      }),
    } as Request

    const response = await POST(mockRequest)
    const data = await response.json()

    expect(response.status).toBe(400)
    expect(data).toHaveProperty('error')
  })
})
