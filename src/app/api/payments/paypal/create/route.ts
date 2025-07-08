'use server';

import { NextResponse } from 'next/server';
import { z } from 'zod';
import { createSupabaseServerClient } from '@/utils/supabaseServer';
import {
  createOrder,
  PayPalOrder,
} from '@/services/paypalService';

// Accepts amount in Meticais (MZN). Converts to USD using fixed rate (1 USD = 65 MZN)
// In production this should query a FX service or store price in USD already.
const MZN_PER_USD = 65;

const bodySchema = z.object({
  amountMzn: z.number().min(1),
  sourceType: z.enum(['subscription', 'donation', 'event', 'community']),
  sourceId: z.string().uuid(),
});

export async function POST(request: Request) {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  let payload: z.infer<typeof bodySchema>;
  try {
    payload = bodySchema.parse(await request.json());
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 400 });
  }

  try {
    const amountUsd = (payload.amountMzn / MZN_PER_USD).toFixed(2);

    // 1. Create PayPal order
    const order: PayPalOrder = await createOrder({
      amount: { currency_code: 'USD', value: amountUsd },
      reference: payload.sourceId,
    });

    const approvalLink = order.links.find((l) => l.rel === 'approve')?.href;
    if (!approvalLink) throw new Error('No approval link returned from PayPal');

    // 2. Insert into payments table (service role)
    const { error } = await supabase.from('payments').insert({
      id: order.id,
      user_id: user.id,
      amount: payload.amountMzn,
      source_type: payload.sourceType,
      source_id: payload.sourceId,
      status: order.status.toUpperCase(),
      provider: 'paypal',
      external_id: order.id,
    });
    if (error) throw error;

    return NextResponse.json({ orderId: order.id, approvalUrl: approvalLink, status: order.status });
  } catch (err: any) {
    console.log('[PayPal Create] error', err);
    return NextResponse.json({ error: err.message }, { status: 400 });
  }
}
