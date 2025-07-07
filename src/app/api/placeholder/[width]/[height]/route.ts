import { NextResponse } from 'next/server'

export async function GET(request: Request, { params }: any) {
  const { width, height } = params;
  // Directly redirect to placeholder provider
  const url = `https://via.placeholder.com/${width}x${height}?text=No+Image`;
  return NextResponse.redirect(url, 302);
}
