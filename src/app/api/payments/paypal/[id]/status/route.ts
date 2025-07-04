'use server';

import { NextResponse } from 'next/server';
import { z } from 'zod';
import { createSupabaseServerClient } from '@/utils/supabaseServer';
import { getOrder } from '@/services/paypalService';

const paramsSchema = z.object({ id: z.string() });

export async function GET(_request: Request, { params }: { params: { id: string } }) {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const parsed = paramsSchema.safeParse(params);
  if (!parsed.success) return NextResponse.json({ error: 'Invalid id' }, { status: 400 });
  const orderId = parsed.data.id;

  // Ensure payment belongs to user
  const { data: payment } = await supabase
    .from('payments')
    .select('status, user_id, artist_id, amount, source_type')
    .eq('id', orderId)
    .single();
  if (!payment || payment.user_id !== user.id) {
    return NextResponse.json({ error: 'Payment not found' }, { status: 404 });
  }

  if (payment.status === 'COMPLETED' || payment.status === 'CANCELLED') {
    return NextResponse.json({ status: payment.status });
  }

  try {
    const order = await getOrder(orderId);
    await supabase.from('payments').update({ status: order.status.toUpperCase() }).eq('id', orderId);
    return NextResponse.json({ status: order.status });
  } catch (err: any) {
    console.error('[PayPal Status] error', err);
    return NextResponse.json({ error: err.message }, { status: 400 });
  }
}
