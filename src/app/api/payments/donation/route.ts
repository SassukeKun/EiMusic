"use server";

import { NextResponse } from "next/server";
import { randomUUID } from "crypto";
import { z } from "zod";
import { createSupabaseServerClient } from "@/utils/supabaseServer";
import { createClient } from "@supabase/supabase-js";
import { createPayment, getPaymentByReference } from "@/services/mpesaService";

// Schema de validação do corpo da requisição
const bodySchema = z.object({
  artistId: z.string().uuid(),
  amount: z.number().min(5).max(10000), // Limite máx. arbitrário
  phone: z.string().regex(/^\d{8,12}$/),
});

type BodyPayload = z.infer<typeof bodySchema>;

export async function POST(request: Request) {
  let supabase = await createSupabaseServerClient();

  // 1. Autenticação do usuário
  let { data: { user } } = await supabase.auth.getUser();
  let jwt: string | undefined;

  if (!user) {
    const authHeader = request.headers.get("authorization");
    if (authHeader?.startsWith("Bearer ")) {
      jwt = authHeader.slice(7);
      // Recria client já com o token, para que futuras queries passem nas RLS
      supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
          global: { headers: { Authorization: `Bearer ${jwt}` } },
          auth: { autoRefreshToken: false, persistSession: false, detectSessionInUrl: false }
        }
      );
      const { data, error } = await supabase.auth.getUser();
      if (!error) user = data.user;
    }
  }

  if (!user)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  // 2. Validação do corpo
  let payload: BodyPayload;
  try {
    payload = bodySchema.parse(await request.json());
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 400 });
  }

    // Referência simples: "DON" seguido de 5 dígitos aleatórios (ex.: DON12345)
  const randomDigits = Math.floor(10000 + Math.random() * 90000); // 5 dígitos
  const reference = `DON${randomDigits}`;

  try {
    // 3. Inicia pagamento via Mpesa (E2Payments)
    const payRes = await createPayment({
      amount: payload.amount,
      phone: payload.phone,
      reference,
      sms_reference: "Donation",
    });

    const paymentId = randomUUID();

    // 4. Se pagamento já concluído
    if (payRes.status === "COMPLETED") {
      await persistSuccessfulDonation({
        supabase,
        paymentId,
        userId: user.id,
        artistId: payload.artistId,
        amount: payload.amount,
        externalId: payRes.id,
      });
    }

    return NextResponse.json({ paymentId, status: payRes.status });
  } catch (err: any) {
    console.warn("createPayment falhou, tentando fallback por referência", err.message);
    const fallback = await getPaymentByReference(reference, payload.amount);

    if (fallback) {
      if (fallback.status === "COMPLETED") {
        const paymentId = randomUUID();
        await persistSuccessfulDonation({
          supabase,
          paymentId,
          userId: user.id,
          artistId: payload.artistId,
          amount: payload.amount,
          externalId: fallback.id,
        });
        return NextResponse.json({ paymentId, status: "COMPLETED" });
      }
      return NextResponse.json({ paymentId: fallback.id, status: fallback.status });
    }

    return NextResponse.json(
      {
        error: err.message,
        details: err.response?.data || null,
      },
      { status: 504 }
    );
  }
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------
interface PersistInput {
  supabase: Awaited<ReturnType<typeof createSupabaseServerClient>>;
  paymentId: string;
  userId: string;
  artistId: string;
  amount: number;
  externalId: string;
}

async function persistSuccessfulDonation({
  supabase,
  paymentId,
  userId,
  artistId,
  amount,
  externalId,
}: PersistInput) {
  // Tabela payments (opcional mas mantemos para rastreabilidade)
  const { error: payErr } = await supabase.from("payments").insert({
    id: paymentId,
    user_id: userId,
    amount,
    artist_id: artistId, // vincula pagamento ao artista
    source_type: "donation",
    source_id: artistId,
    status: "COMPLETED",
    provider: "mpesa",
    external_id: externalId,
  });
  if (payErr) console.error("Erro ao inserir payment:", payErr.message);

  // Tabela donations
  const { error: donErr } = await supabase.from("donations").insert({
    id: paymentId, // mantemos o mesmo id
    user_id: userId,
    artist_id: artistId,
    amount,
  });
  if (donErr) console.error("Erro ao inserir donation:", donErr.message);

  // Tabela notifications – envia notificação ao artista
  const { error: notifErr } = await supabase.from("notifications").insert({
    id: randomUUID(),
    user_id: userId, // doador
    recipient_id: artistId,
    type: "donation",
    title: "Novo apoio recebido!",
    message: `Recebeste uma doação de MT ${amount}. 🎉`,
  });
  if (notifErr) console.error("Erro ao inserir notification:", notifErr.message);

  // Calcula divisão de receita e registra em revenue_transactions
  try {
    const { data: revenueRows, error: revCalcErr } = await supabase.rpc(
      "compute_revenue_for_payment",
      { p_payment_id: paymentId }
    );
    if (revCalcErr) throw revCalcErr;

    if (revenueRows && revenueRows.length) {
      const rev = revenueRows[0] as {
        artist_id: string;
        gross_amount: number;
        platform_cut: number;
        artist_cut: number;
      };
      const now = new Date();
      const periodStart = new Date(now.getFullYear(), now.getMonth(), 1);
      const periodEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0);

      const { error: revInsErr } = await supabase
        .from("revenue_transactions")
        .insert({
          id: randomUUID(),
          artist_id: rev.artist_id,
          source_type: "donation",
          amount,
          payment_id: paymentId,
          period_start: periodStart.toISOString().slice(0, 10),
          period_end: periodEnd.toISOString().slice(0, 10),
          gross_amount: rev.gross_amount,
          platform_cut: rev.platform_cut,
          artist_cut: rev.artist_cut,
          calculated_at: new Date().toISOString(),
        });
      if (revInsErr) console.error("Erro ao inserir revenue_transactions:", revInsErr.message);

        // Atualiza/insere saldo da plataforma
        try {
          const today = new Date().toISOString().slice(0, 10); // YYYY-MM-DD
          // Verifica se já existe saldo para a data de hoje
          const { data: balRow, error: balSelErr } = await supabase
            .from("platform_balance")
            .select("id, total_balance, created_at")
            .eq("as_of_date", today)
            .single();
          if (balSelErr && balSelErr.code !== "PGRST116") {
            // PGRST116: no rows found – não é um erro crítico
            throw balSelErr;
          }

          const newTotal = (parseFloat(balRow?.total_balance ?? 0) + rev.platform_cut).toFixed(2);

          const { error: balUpErr } = await supabase
            .from("platform_balance")
            .upsert(
              {
                id: balRow?.id ?? randomUUID(),
                as_of_date: today,
                total_balance: newTotal,
                created_at: balRow?.created_at ?? new Date().toISOString(),
              },
              { onConflict: "as_of_date" }
            );
          if (balUpErr) console.error("Erro ao atualizar platform_balance:", balUpErr.message);
        } catch (balErr: any) {
          console.error("Falha ao processar platform_balance:", balErr.message);
        }
    }
  } catch (err: any) {
    console.error("Erro ao calcular/inserir revenue:", err.message);
  }
}
