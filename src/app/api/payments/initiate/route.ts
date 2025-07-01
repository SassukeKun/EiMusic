'use server';

import { NextResponse } from 'next/server';
import { z } from 'zod';
import { createSupabaseServerClient } from '@/utils/supabaseServer';
import { createPayment } from '@/services/mpesaService';

const bodySchema = z.object({
  amount: z.number().min(1),
  msisdn: z.string().regex(/^\d{8,12}$/), // formato simplificado
  sourceType: z.enum(['subscription', 'donation', 'event', 'community']),
  sourceId: z.string().uuid(),
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

  try {
    // 1. Inicia pagamento via e2payments/mpesa
    const payRes = await createPayment({
      amount: payload.amount,
      msisdn: payload.msisdn,
      reference: payload.sourceId,
    });

    // 2. Registra na tabela payments (service key)
    const { error } = await supabase.from('payments').insert({
      id: payRes.id,
      user_id: user.id,
      amount: payload.amount,
      source_type: payload.sourceType,
      source_id: payload.sourceId,
      status: 'PENDING',
      provider: 'mpesa',
      external_id: payRes.id,
    });
    if (error) throw error;

    return NextResponse.json({ paymentId: payRes.id, status: payRes.status });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 400 });
  }
}
