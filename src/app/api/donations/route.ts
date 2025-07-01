'use server';

import { NextResponse } from 'next/server';
import { z } from 'zod';
import { createSupabaseServerClient } from '@/utils/supabaseServer';

const bodySchema = z.object({
  artistId: z.string().uuid(),
  amount: z.number().min(5).max(500),
});

export async function POST(request: Request) {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  let payload;
  try {
    payload = bodySchema.parse(await request.json());
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 400 });
  }

  // Check user plan & monthly limit (simplified ⇒ rely on DB / RPC)
  const { data: userData } = await supabase.from('users').select('plan').eq('id', user.id).single();
  if (userData?.plan === 'free') {
    // Call a SQL function to enforce limit (assume exists)
    const { error: limitErr } = await supabase.rpc('assert_free_user_donation_limit', {
      p_user_id: user.id,
      p_artist_id: payload.artistId,
      p_amount: payload.amount,
    });
    if (limitErr) return NextResponse.json({ error: limitErr.message }, { status: 400 });
  }

  const { data, error } = await supabase
    .from('donations')
    .insert({ user_id: user.id, artist_id: payload.artistId, amount: payload.amount })
    .select('*')
    .single();
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });

  return NextResponse.json({ donation: data });
}
