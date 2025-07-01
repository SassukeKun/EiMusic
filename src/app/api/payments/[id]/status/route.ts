'use server';

import { NextResponse } from 'next/server';
import { z } from 'zod';
import { createSupabaseServerClient } from '@/utils/supabaseServer';
import { queryStatus } from '@/services/mpesaService';

const paramsSchema = z.object({ id: z.string() });

export async function GET(_request: Request, { params }: { params: { id: string } }) {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const parsed = paramsSchema.safeParse(params);
  if (!parsed.success) return NextResponse.json({ error: 'Invalid id' }, { status: 400 });
  const paymentId = parsed.data.id;

  // Verifica se o pagamento pertence ao usuário
  const { data: payment } = await supabase.from('payments').select('status').eq('id', paymentId).eq('user_id', user.id).single();
  if (!payment) return NextResponse.json({ error: 'Payment not found' }, { status: 404 });

  // Se já está concluído/ falhou, retornamos status atual
  if (payment.status === 'COMPLETED' || payment.status === 'FAILED') {
    return NextResponse.json({ status: payment.status });
  }

  // Caso contrário, consulta gateway
  try {
    const res = await queryStatus(paymentId);
    // Atualiza record
    await supabase.from('payments').update({ status: res.status }).eq('id', paymentId);
    return NextResponse.json({ status: res.status });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 400 });
  }
}
