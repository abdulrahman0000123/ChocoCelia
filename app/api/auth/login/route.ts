import { prisma } from '@/app/lib/db';
import { NextResponse } from 'next/server';
import { login } from '@/app/lib/auth';
import bcrypt from 'bcryptjs';

// Rate limiting storage (in production, use Redis)
const loginAttempts = new Map<string, { count: number; resetTime: number }>();

const MAX_ATTEMPTS = 5;
const LOCKOUT_TIME = 15 * 60 * 1000; // 15 minutes

function checkRateLimit(identifier: string): boolean {
  const now = Date.now();
  const attempts = loginAttempts.get(identifier);

  if (attempts) {
    if (now < attempts.resetTime) {
      if (attempts.count >= MAX_ATTEMPTS) {
        return false; // Rate limited
      }
      attempts.count++;
    } else {
      // Reset after lockout period
      loginAttempts.set(identifier, { count: 1, resetTime: now + LOCKOUT_TIME });
    }
  } else {
    loginAttempts.set(identifier, { count: 1, resetTime: now + LOCKOUT_TIME });
  }

  return true;
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { username, password } = body;

    // Validate input
    if (!username || !password) {
      return NextResponse.json(
        { error: 'Username and password are required' },
        { status: 400 }
      );
    }

    // Check rate limiting
    const clientId = username; // In production, use IP + username
    if (!checkRateLimit(clientId)) {
      return NextResponse.json(
        { error: 'Too many login attempts. Please try again later.' },
        { status: 429 }
      );
    }

    // Try to find user in database
    const user = await prisma.user.findUnique({
      where: { username },
    });

    // Check if user exists and password is correct
    if (!user) {
      return NextResponse.json(
        { error: 'Invalid credentials' },
        { status: 401 }
      );
    }

    // Compare password with hashed password
    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      return NextResponse.json(
        { error: 'Invalid credentials' },
        { status: 401 }
      );
    }

    // Reset rate limit on successful login
    loginAttempts.delete(clientId);

    // Create session
    await login({ id: user.id, username: user.username });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
