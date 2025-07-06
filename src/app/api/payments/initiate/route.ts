"use server";

import { NextResponse } from "next/server";
import { randomUUID } from "crypto";
import { z } from "zod";
import { createSupabaseServerClient } from "@/utils/supabaseServer";
import { createClient } from "@supabase/supabase-js";
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
  planId: z.string().min(1).optional(),
});

export async function POST(request: Request) {
  let supabase = await createSupabaseServerClient();
  let {
    data: { user },
  } = await supabase.auth.getUser();

  // Caso não haja cookie, tentar usar o token JWT vindo no header Authorization
  if (!user) {
    const authHeader = request.headers.get('authorization');
    if (authHeader?.startsWith('Bearer ')) {
      const jwt = authHeader.slice(7);
      // Recria client com JWT para que RLS reconheça auth.uid()
      supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
          global: {
            headers: { Authorization: `Bearer ${jwt}` }
          }
        }
      );
      const { data, error } = await supabase.auth.getUser(jwt);
      if (!error) user = data.user;
    }
  }

  if (!user)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  let payload;
  const isUuid = (str: string) => /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(str);
  let planUuid: string | undefined = undefined;

  try {
    payload = bodySchema.parse(await request.json());
    // Validação extra: se for assinatura, planId é obrigatório
    if (payload.sourceType === "subscription" && !payload.planId) {
      return NextResponse.json({ error: "planId é obrigatório para pagamentos de assinatura" }, { status: 400 });
    }
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 400 });
  }

  try {
    // Resolve planId to UUID if necessary
    // planUuid já declarado no escopo externo
    if (payload.sourceType === "subscription") {
      if (!payload.planId) {
        return NextResponse.json({ error: "planId obrigatório" }, { status: 400 });
      }
      if (isUuid(payload.planId)) {
        planUuid = payload.planId;
      } else {
        // Tenta obter do banco (nome)
        const { data: planRow, error: planErr } = await supabase
          .from('monetization_plans')
          .select('id')
          .ilike('name', payload.planId)
          .maybeSingle();
        if (planErr || !planRow?.id) {
          return NextResponse.json({ error: "Plano não encontrado" }, { status: 400 });
        }
        planUuid = planRow.id;
      }
    }

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
        source_id: payload.sourceType === "subscription" ? planUuid : payload.reference,
         mpesa_reference: payload.reference,
        status: "COMPLETED",
        provider: "mpesa",
        external_id: payRes.id,
      });
      if (error) throw error;

      // Atualiza assinatura e utilizador se for pagamento de plano
      if (payload.sourceType === "subscription" && planUuid) {
        await supabase.from('subscriptions').upsert({
           id: randomUUID(),
           user_id: user.id,
           monetization_plan_id: planUuid,
           is_active: true,
           start_date: new Date().toISOString(),
           end_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
         }, { onConflict: 'user_id' });
        await supabase.from('users').update({
          has_active_subscription: true,
          subscription_plan_id: planUuid,
        }).eq('id', user.id);
      }
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
          source_id: payload.sourceType === "subscription" ? planUuid : payload.reference,
         mpesa_reference: payload.reference,
          status: "COMPLETED",
          provider: "mpesa",
          external_id: fallback.id,
        });
        
        if (!error) {
          // também upsert assinatura / atualizar usuário
          if (payload.sourceType === "subscription" && planUuid) {
            await supabase.from('subscriptions').upsert({
              id: randomUUID(),
              user_id: user.id,
              monetization_plan_id: planUuid,
              is_active: true,
              start_date: new Date().toISOString(),
              end_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
            }, { onConflict: 'user_id' });
            await supabase.from('users').update({
              has_active_subscription: true,
              subscription_plan_id: planUuid,
            }).eq('id', user.id);
          }
        }
        
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
}

