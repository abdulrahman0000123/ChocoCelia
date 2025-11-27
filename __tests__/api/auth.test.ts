/**
 * @jest-environment node
 */

import { login } from '@/app/lib/auth'

jest.mock('@/app/lib/auth', () => ({
  login: jest.fn(),
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
    const { POST } = await import('@/app/api/auth/login/route')
    
    const mockRequest = {
      json: async () => ({
        username: 'wrong',
        password: 'wrong123',
      }),
    } as Request

    const response = await POST(mockRequest)
    const data = await response.json()

    expect(data).toHaveProperty('error')
    expect(response.status).toBe(401)
  })

  test('should call login function with correct data', async () => {
    const { POST } = await import('@/app/api/auth/login/route')
    
    const mockRequest = {
      json: async () => ({
        username: 'admin',
        password: 'admin123',
      }),
    } as Request

    await POST(mockRequest)

    expect(login).toHaveBeenCalledWith({
      id: 'admin-id',
      username: 'admin',
    })
  })
})
