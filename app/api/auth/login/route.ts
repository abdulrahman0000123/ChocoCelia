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
    if (typeof username !== 'string' || typeof password !== 'string' ||
        !username.trim() || !password || username.length > 100 || password.length > 128) {
      return NextResponse.json(
        { error: 'Username and password are required' },
        { status: 400 }
      );
    }

    const forwardedIp = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim();
    const clientIp = request.headers.get('x-real-ip') || forwardedIp || 'unknown';
    const windowMs = 15 * 60 * 1000;
    const [pairLimit, usernameLimit, ipLimit] = await Promise.all([
      rateLimit(`login:pair:${username.trim().toLowerCase()}:${clientIp}`, 5, windowMs),
      rateLimit(`login:user:${username.trim().toLowerCase()}`, 20, windowMs),
      rateLimit(`login:ip:${clientIp}`, 30, windowMs),
    ]);
    const limited = [pairLimit, usernameLimit, ipLimit].find((result) => result.limited);
    if (limited) {
      const remainingMinutes = Math.max(1, Math.ceil((limited.resetTime - Date.now()) / 60000));
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
    await login({ id: user.id, username: user.username, updatedAt: user.updatedAt });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
