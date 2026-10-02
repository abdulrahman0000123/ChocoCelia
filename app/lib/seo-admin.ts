import { NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import { getSession } from './auth';
export async function requireAdmin(request?: Request) {
  if (request && request.method !== 'GET') {
    const origin = request.headers?.get('origin');
    if (origin && origin !== new URL(request.url).origin) return null;
  }
  return getSession();
}
export function invalidateSeo() {
  revalidatePath('/', 'layout');
  revalidatePath('/sitemap.xml');
}
export function apiError(error: unknown) {
  const message = error instanceof Error ? error.message : '';
  // Never send database or provider errors/credentials back to the browser.
  if (/^Invalid |^Missing |^Image must|^Slug |^Unknown |^Cannot /.test(message)) return NextResponse.json({error: message}, {status: 400});
  return NextResponse.json({error: 'Could not save changes. Please retry.'}, {status: 500});
}
export async function readBody(request: Request) {
  const raw = await request.text();
  if (raw.length > 250_000) throw new Error('Invalid request size');
  let data: unknown;
  try {data = JSON.parse(raw);} catch {throw new Error('Invalid JSON request');}
  if (!data || typeof data !== 'object' || Array.isArray(data)) throw new Error('Invalid request');
  return data as Record<string, unknown>;
}
