"use server";

import { NextResponse } from "next/server";
import { z } from "zod";
import { createSupabaseServerClient } from "@/utils/supabaseServer";
import { createPayment } from "@/services/mpesaService";

console.log('Environment:', {
  E2PAYMENTS_BASE_URL: process.env.E2PAYMENTS_BASE_URL,
  CLIENT_ID: process.env.E2PAYMENTS_CLIENT_ID?.substring(0, 5) + '...',
  WALLET_ID: process.env.E2PAYMENTS_WALLET_ID
});

const bodySchema = z.object({
  amount: z.number().min(1),
  phone: z.string().regex(/^\d{8,12}$/), // formato simplificado
  reference: z.string().min(3).max(27),
  sourceType: z.enum(["subscription", "donation", "event", "community"]),
});

export async function POST(request: Request) {
  const supabase = await createSupabaseServerClient();
  let {
    data: { user },
  } = await supabase.auth.getUser();

  // Caso não haja cookie, tentar usar o token JWT vindo no header Authorization
  if (!user) {
    const authHeader = request.headers.get('authorization');
    if (authHeader?.startsWith('Bearer ')) {
      const jwt = authHeader.slice(7);
      const { data, error } = await supabase.auth.getUser(jwt);
      if (!error) user = data.user;
    }
  }

  if (!user)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

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
      phone: payload.phone,
      reference: payload.reference,
      sms_reference: `Pg${payload.sourceType}`,
    });

    // 2. Registra na tabela payments (service key)
    const { error } = await supabase.from("payments").insert({
      id: payRes.id,
      user_id: user.id,
      amount: payload.amount,
      source_type: payload.sourceType,
      source_id: payload.reference,
      status: "PENDING",
      provider: "mpesa",
      external_id: payRes.id,
    });
    if (error) throw error;

    return NextResponse.json({ paymentId: payRes.id, status: payRes.status });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 400 });
  }
}
