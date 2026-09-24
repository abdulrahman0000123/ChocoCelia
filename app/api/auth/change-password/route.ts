import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { prisma } from '@/app/lib/db';
import { getSession, logout } from '@/app/lib/auth';

export async function POST(request: Request) {
  const origin = request.headers.get('origin');
  if (origin && new URL(origin).origin !== new URL(request.url).origin) {
    return NextResponse.json({ error: 'Invalid request origin' }, { status: 403 });
  }

  const session = await getSession();
  const userId = session?.user?.id;
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const body = await request.json().catch(() => null);
  const currentPassword = body?.currentPassword;
  const newPassword = body?.newPassword;
  if (typeof currentPassword !== 'string' || typeof newPassword !== 'string' ||
      currentPassword.length > 128 || newPassword.length < 12 || newPassword.length > 128 ||
      !/[a-z]/.test(newPassword) || !/[A-Z]/.test(newPassword) || !/[0-9]/.test(newPassword)) {
    return NextResponse.json({ error: 'Use a password of 12–128 characters with upper and lower case letters and a number.' }, { status: 400 });
  }

  const user = await prisma.user.findUnique({ where: { id: userId }, select: { id: true, password: true } });
  if (!user || !await bcrypt.compare(currentPassword, user.password)) {
    return NextResponse.json({ error: 'Current password is incorrect.' }, { status: 400 });
  }

  await prisma.user.update({ where: { id: user.id }, data: { password: await bcrypt.hash(newPassword, 12) } });
  await logout();
  return NextResponse.json({ success: true });
}
