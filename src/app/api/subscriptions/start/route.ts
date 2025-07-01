'use server';

import { NextResponse } from 'next/server';
import { z } from 'zod';
import { createSupabaseServerClient } from '@/utils/supabaseServer';

// Schema de payload: { planId: uuid }
const bodySchema = z.object({
  planId: z.string().uuid(),
});

export async function POST(request: Request) {
  const supabase = await createSupabaseServerClient();

  // Autenticação — requer usuário logado
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // Valida body
  let payload;
  try {
    payload = bodySchema.parse(await request.json());
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 400 });
  }

  // Criar assinatura
  const { data, error } = await supabase
    .from('subscriptions')
    .insert({
      user_id: user.id,
      monetization_plan_id: payload.planId,
      is_active: true,
      start_date: new Date().toISOString(),
    })
    .select('*')
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  return NextResponse.json({ subscription: data });
}
