"use server";

import { NextResponse } from "next/server";
import { randomUUID } from "crypto";
import { z } from "zod";
import { createSupabaseServerClient } from "@/utils/supabaseServer";
import { createPayment, getPaymentByReference } from "@/services/mpesaService";

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

    // Sempre gerar um UUID válido para inserção no banco
    const paymentId = randomUUID();
    
    // Se o pagamento já veio concluído (casos raros), grava diretamente
    if (payRes.status === "COMPLETED") {
      const { error } = await supabase.from("payments").insert({
        id: paymentId,
        user_id: user.id,
        amount: payload.amount,
        source_type: payload.sourceType,
        source_id: payload.reference,
        status: "COMPLETED",
        provider: "mpesa",
        external_id: payRes.id,
      });
      if (error) throw error;
    }

    return NextResponse.json({ paymentId, status: payRes.status });
  } catch (err: any) {
    console.warn("createPayment falhou, tentando fallback por referência:", err.message);
    const fallback = await getPaymentByReference(payload.reference, payload.amount);
    
    if (fallback) {
      // Se o fallback encontrou um pagamento
      if (fallback.status === "COMPLETED") {
        // Geramos UUID e tentamos inserir no banco
        const paymentId = randomUUID();
        const { error } = await supabase.from("payments").insert({
          id: paymentId,
          user_id: user.id,
          amount: payload.amount,
          source_type: payload.sourceType,
          source_id: payload.reference,
          status: "COMPLETED",
          provider: "mpesa",
          external_id: fallback.id,
        });
        
        if (error) {
          console.error("Erro ao inserir pagamento via fallback:", error.message);
          // Se falhar a inserção, ainda devolvemos o status do gateway
          return NextResponse.json({ 
            paymentId: fallback.id, 
            status: "COMPLETED",
            error: "Erro ao salvar no banco, mas pagamento foi concluído no gateway"
          });
        }
        
        // Se inserção bem sucedida, devolvemos o UUID gerado
        return NextResponse.json({ paymentId, status: "COMPLETED" });
      } else {
        // Se não está COMPLETED, devolvemos o status do gateway
        return NextResponse.json({ paymentId: fallback.id, status: fallback.status });
      }
    }
    
    // Se não encontrou no fallback, devolvemos o erro original
    return NextResponse.json({ 
      error: err.message,
      details: err.response?.data || null
    }, { status: 504 });
  }
  return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
}

