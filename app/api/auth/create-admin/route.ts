import { NextResponse } from 'next/server';

/**
 * This endpoint is deprecated. Use /api/setup-admin instead.
 */
export async function POST() {
  return NextResponse.json(
    { 
      error: 'This endpoint is deprecated. Please use /api/setup-admin to set up the admin user.' 
    },
    { status: 410 }
  );
}
