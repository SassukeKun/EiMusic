'use server';

import { NextResponse } from 'next/server';
import { z } from 'zod';
import { createSupabaseServerClient } from '@/utils/supabaseServer';
import { communitySchema } from '@/models/community';

export async function POST(request: Request) {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  // Parse body (omit optional id)
  let payload: any;
  try {
    payload = communitySchema.omit({ id: true }).parse(await request.json());
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 400 });
  }

  // Use service logic (validation inside)
  try {
    const { createCommunity } = await import('@/services/communityService');
    const community = await createCommunity({ ...payload, artist_id: payload.artist_id || user.id });
    return NextResponse.json({ community });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 400 });
  }
}
