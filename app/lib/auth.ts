import { SignJWT, jwtVerify, type JWTPayload } from 'jose';
import { cookies } from 'next/headers';
import { createHmac } from 'node:crypto';
import { prisma } from '@/app/lib/db';

interface SessionPayload extends JWTPayload {
  user?: { id: string; username: string };
  expires?: string;
  accountUpdatedAt?: number;
}

function getKey() {
  // Keep auth operational where a dedicated key was not provisioned, while
  // deriving it from the deployment's private database credential instead of
  // falling back to a source-controlled signing key.
  const secretKey = process.env.JWT_SECRET || process.env.DATABASE_URL;
  if (!secretKey || secretKey.length < 32) {
    throw new Error('Configure a JWT_SECRET or DATABASE_URL with at least 32 characters');
  }
  return createHmac('sha256', secretKey).update('choco-celia:session-token:v1').digest();
}

export async function encrypt(payload: SessionPayload) {
  return await new SignJWT(payload)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('24h')
    .sign(getKey());
}

export async function decrypt(input: string): Promise<SessionPayload> {
  const { payload } = await jwtVerify(input, getKey(), {
    algorithms: ['HS256'],
  });
  return payload as SessionPayload;
}

export async function getSession() {
  const session = (await cookies()).get('session')?.value;
  if (!session) return null;
  try {
    const payload = await decrypt(session);
    if (!payload?.user?.id || !payload.accountUpdatedAt) return null;
    const currentUser = await prisma.user.findUnique({
      where: { id: payload.user.id },
      select: { updatedAt: true },
    });
    if (!currentUser || currentUser.updatedAt.getTime() !== payload.accountUpdatedAt) return null;
    return payload;
  } catch {
    return null;
  }
}

export async function login(userData: { id: string; username: string; updatedAt: Date }) {
  const expires = new Date(Date.now() + 24 * 60 * 60 * 1000);
  const session = await encrypt({
    user: { id: userData.id, username: userData.username },
    expires: expires.toISOString(),
    accountUpdatedAt: userData.updatedAt.getTime(),
  });

  (await cookies()).set('session', session, { 
    expires, 
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/'
  });
}

export async function logout() {
  (await cookies()).set('session', '', { 
    expires: new Date(0),
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/'
  });
}
