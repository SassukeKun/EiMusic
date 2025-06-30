import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function GET(request: NextRequest, context: { params: { width: string; height: string } }) {
  const width = context.params.width;
  const height = context.params.height;

  // Directly redirect to placeholder provider
  const url = `https://via.placeholder.com/${width}x${height}?text=No+Image`;
  return NextResponse.redirect(url, 302);
}
