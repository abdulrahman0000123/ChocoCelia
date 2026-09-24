import { NextResponse } from 'next/server';

/**
 * Admin accounts must be created through the protected administrative workflow.
 */
export async function POST() {
  return NextResponse.json(
    { 
      error: 'This endpoint has been removed.'
    },
    { status: 410 }
  );
}
