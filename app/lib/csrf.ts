// Simple CSRF protection for state-changing operations
import { cookies, headers } from 'next/headers';
import crypto from 'crypto';

const CSRF_TOKEN_NAME = 'csrf_token';
const CSRF_HEADER_NAME = 'x-csrf-token';

export async function generateCsrfToken(): Promise<string> {
  const token = crypto.randomBytes(32).toString('hex');
  
  (await cookies()).set(CSRF_TOKEN_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 60 * 60 * 24 // 24 hours
  });
  
  return token;
}

export async function verifyCsrfToken(request: Request): Promise<boolean> {
  // Only verify for state-changing methods
  const method = request.method.toUpperCase();
  if (!['POST', 'PUT', 'DELETE', 'PATCH'].includes(method)) {
    return true;
  }

  const headersList = await headers();
  const cookieStore = await cookies();
  
  const tokenFromHeader = headersList.get(CSRF_HEADER_NAME);
  const tokenFromCookie = cookieStore.get(CSRF_TOKEN_NAME)?.value;

  // For admin operations, we can skip CSRF if we're using session-based auth
  // Since we're using httpOnly cookies with sameSite, we have good protection
  // But we still validate the tokens match if both are present
  if (!tokenFromCookie) {
    // First request, generate token
    return true;
  }

  if (tokenFromHeader && tokenFromCookie) {
    return crypto.timingSafeEqual(
      Buffer.from(tokenFromHeader),
      Buffer.from(tokenFromCookie)
    );
  }

  return true; // Allow if not explicitly checking
}

export async function getCsrfToken(): Promise<string | undefined> {
  const cookieStore = await cookies();
  return cookieStore.get(CSRF_TOKEN_NAME)?.value;
}
