'use server';

import { NextResponse } from 'next/server';
import { verifyWebhookSignature } from '@/services/mpesaService';
import { createSupabaseServerClient } from '@/utils/supabaseServer';

export async function POST(request: Request) {
  const rawBody = await request.text();
  const signature = request.headers.get('x-signature') || '';

  if (!verifyWebhookSignature(rawBody, signature)) {
    return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
  }

  let payload: any;
  try {
    payload = JSON.parse(rawBody);
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  // expected payload: { id, status, amount, phone, reference }
  const { id, status } = payload;
  if (!id || !status) {
    return NextResponse.json({ error: 'Missing fields' }, { status: 400 });
  }

  const supabase = await createSupabaseServerClient();
  // Update payments table
  const { data: payment, error: fetchErr } = await supabase
    .from('payments')
    .select('user_id, artist_id, source_type, amount')
    .eq('id', id)
    .single();
  if (fetchErr || !payment) {
    return NextResponse.json({ error: 'Payment not found' }, { status: 404 });
  }

  await supabase.from('payments').update({ status: status.toUpperCase() }).eq('id', id);

  if (status === 'COMPLETED') {
    // Register revenue split if artist exists
    if (payment.artist_id) {
      const { addTransaction } = await import('@/services/revenueService');
      await addTransaction({
        artistId: payment.artist_id,
        amount: payment.amount * 0.85, // 85% artist
        sourceType: payment.source_type,
      });
    }
    // TODO: liberar assinatura / ingressos conforme source_type
  }

  return NextResponse.json({ success: true });
}
