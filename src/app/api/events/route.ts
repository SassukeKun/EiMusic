'use server';

import { NextResponse } from 'next/server';
import { createSupabaseServerClient } from '@/utils/supabaseServer';
import { eventSchema } from '@/models/event';

export async function POST(request: Request) {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  // Parse body (omit id)
  let payload;
  try {
    payload = eventSchema.omit({ id: true }).parse(await request.json());
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 400 });
  }

  // Ensure artist_id = logged user
  if (payload.artist_id !== user.id) {
    return NextResponse.json({ error: 'artist_id deve ser o usuário autenticado' }, { status: 403 });
  }

  try {
    const { createEvent } = await import('@/services/eventService');
    const event = await createEvent(payload);
    return NextResponse.json({ event });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 400 });
  }
}
