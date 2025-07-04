'use server';

import { NextResponse } from 'next/server';
import { verifyWebhookSignature } from '@/services/paypalService';
import { createSupabaseServerClient } from '@/utils/supabaseServer';

export async function POST(request: Request) {
  const rawBody = await request.text();

  // PayPal sends lowercase header names. We pass Headers object to verification helper.
  const isValid = await verifyWebhookSignature(request.headers, rawBody);
  if (!isValid) {
    return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
  }

  let event: any;
  try {
    event = JSON.parse(rawBody);
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  const eventType = event.event_type;

  // Only interested in PAYMENT.CAPTURE.COMPLETED (funds captured)
  if (eventType !== 'PAYMENT.CAPTURE.COMPLETED') {
    return NextResponse.json({ success: true, ignored: true });
  }

  // Extract resource info
  const resource = event.resource || {};
  const orderId = resource.supplementary_data?.related_ids?.order_id || resource.id;
  const status = resource.status;

  if (!orderId) {
    return NextResponse.json({ error: 'Missing order id' }, { status: 400 });
  }

  const supabase = await createSupabaseServerClient();

  // Update payments table
  const { data: payment, error: fetchErr } = await supabase
    .from('payments')
    .select('artist_id, amount, source_type')
    .eq('id', orderId)
    .single();
  if (fetchErr || !payment) {
    return NextResponse.json({ error: 'Payment not found' }, { status: 404 });
  }

  await supabase.from('payments').update({ status }).eq('id', orderId);

  if (status === 'COMPLETED' && payment.artist_id) {
    const { addTransaction } = await import('@/services/revenueService');
    await addTransaction({
      artistId: payment.artist_id,
      amount: payment.amount * 0.85,
      sourceType: payment.source_type,
    });
  }

  return NextResponse.json({ success: true });
}
