'use server';

import { NextResponse } from 'next/server';
import { createSupabaseServerClient } from '@/utils/supabaseServer';
import { z } from 'zod';

const paramsSchema = z.object({ id: z.string().uuid() });

export async function POST(_request: Request, { params }: { params: { id: string } }) {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const parsed = paramsSchema.safeParse(params);
  if (!parsed.success) {
    return NextResponse.json({ error: 'Invalid community id' }, { status: 400 });
  }
  const communityId = parsed.data.id;

  try {
    const { joinCommunity } = await import('@/services/communityService');
    await joinCommunity(communityId, user.id);
    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 400 });
  }
}
