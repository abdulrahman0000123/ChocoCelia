import { prisma } from '@/app/lib/db';
import { NextResponse } from 'next/server';
import { login } from '@/app/lib/auth';
import bcrypt from 'bcryptjs';
import { rateLimit } from '@/app/lib/rateLimit';

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

    // Rate limiting - 5 attempts per 15 minutes per username
    const rateLimitResult = rateLimit(`login:${username}`, 5, 15 * 60 * 1000);
    if (rateLimitResult.limited) {
      const remainingMinutes = Math.ceil((rateLimitResult.resetTime - Date.now()) / 60000);
      return NextResponse.json(
        { error: `Too many login attempts. Please try again in ${remainingMinutes} minutes.` },
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
