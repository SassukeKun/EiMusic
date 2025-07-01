'use server';

import { NextResponse } from 'next/server';
import { createSupabaseServerClient } from '@/utils/supabaseServer';
import { getArtistBalance } from '@/services/revenueService';

export async function GET() {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const balance = await getArtistBalance(user.id);
    return NextResponse.json({ balance });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 400 });
  }
}
