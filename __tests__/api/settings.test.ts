/**
 * @jest-environment node
 */

import { NextResponse } from 'next/server'

jest.mock('next/server', () => ({
  NextResponse: {
    json: jest.fn((data, init) => ({
      json: async () => data,
      status: init?.status || 200,
      ok: !init?.status || init.status < 400,
    })),
  },
}))

describe('Settings API', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  test('GET /api/settings should return settings', async () => {
    const { GET } = await import('@/app/api/settings/route')
    const response = await GET()
    const data = await response.json()

    expect(data).toHaveProperty('phone')
    expect(data).toHaveProperty('email')
    expect(data).toHaveProperty('address')
    expect(data).toHaveProperty('city')
    expect(data).toHaveProperty('facebook')
    expect(data).toHaveProperty('instagram')
    expect(data).toHaveProperty('twitter')
  })

  test('POST /api/settings should update settings', async () => {
    const { POST } = await import('@/app/api/settings/route')
    
    const mockRequest = {
      json: async () => ({
        phone: '+20 999 999 9999',
        email: 'test@test.com',
        address: 'Test Address',
        city: 'Test City',
        facebook: 'https://facebook.com/test',
        instagram: 'https://instagram.com/test',
        twitter: 'https://twitter.com/test',
      }),
    } as Request

    const response = await POST(mockRequest)
    const data = await response.json()

    expect(data.phone).toBe('+20 999 999 9999')
    expect(data.email).toBe('test@test.com')
  })

  test('settings should have required fields', async () => {
    const { GET } = await import('@/app/api/settings/route')
    const response = await GET()
    const data = await response.json()

    expect(data).toHaveProperty('phone')
    expect(data).toHaveProperty('email')
    expect(data).toHaveProperty('address')
    expect(data).toHaveProperty('city')
    expect(data).toHaveProperty('facebook')
    expect(data).toHaveProperty('instagram')
    expect(data).toHaveProperty('twitter')
    expect(typeof data.phone).toBe('string')
    expect(typeof data.email).toBe('string')
    expect(typeof data.address).toBe('string')
  })
})
