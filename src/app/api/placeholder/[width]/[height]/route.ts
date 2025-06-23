import { NextResponse } from 'next/server'

export async function GET(
  request: Request,
  { params }: { params: { width: string; height: string } }
) {
  const { width, height } = params
  const url = `https://via.placeholder.com/${width}x${height}?text=No+Image`
  return NextResponse.redirect(url)
}
