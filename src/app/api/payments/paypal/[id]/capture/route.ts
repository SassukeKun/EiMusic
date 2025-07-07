import { NextResponse } from 'next/server';

import { z } from 'zod';
import { createSupabaseServerClient } from '@/utils/supabaseServer';
import { captureOrder } from '@/services/paypalService';

const paramsSchema = z.object({ id: z.string() });

export async function POST(request: Request, { params }: any) {
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

  if (payment.status === 'COMPLETED') {
    return NextResponse.json({ status: 'COMPLETED' });
  }

  try {
    const captureRes = await captureOrder(orderId);
    const captureStatus = captureRes.status;

    await supabase.from('payments').update({ status: captureStatus.toUpperCase() }).eq('id', orderId);

    // If completed – add revenue split
    if (captureStatus === 'COMPLETED' && payment.artist_id) {
      const { addTransaction } = await import('@/services/revenueService');
      await addTransaction({
        artistId: payment.artist_id,
        amount: payment.amount * 0.85,
        sourceType: payment.source_type,
      });
    }

    return NextResponse.json({ status: captureStatus });
  } catch (err: any) {
    console.error('[PayPal Capture] error', err);
    return NextResponse.json({ error: err.message }, { status: 400 });
  }
}
