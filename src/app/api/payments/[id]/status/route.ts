"use server";

import { NextResponse } from "next/server";
import { z } from "zod";
import { createSupabaseServerClient } from "@/utils/supabaseServer";
import { queryStatus } from "@/services/mpesaService";

const paramsSchema = z.object({ id: z.string() });

export async function GET(
  _request: Request,
  { params }: { params: { id: string } }
) {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const parsed = paramsSchema.safeParse(params);
  if (!parsed.success)
    return NextResponse.json({ error: "Invalid id" }, { status: 400 });
  const paymentId = parsed.data.id;

  // Verifica se o pagamento pertence ao usuário
  const { data: payment } = await supabase
    .from("payments")
    .select("*")
    .eq("id", paymentId)
    .eq("user_id", user.id)
    .maybeSingle();
  // Se ainda não registámos no DB, vamos consultar gateway
  if (!payment) {
    try {
      const res = await queryStatus(paymentId);
      if (res.status === "COMPLETED") {
        // Derivar metadados mínimos disponíveis
        const insertObj: any = {
          id: paymentId,
          user_id: user.id,
          status: "COMPLETED",
          provider: "mpesa",
          external_id: paymentId,
        };
        // Se gateway devolve amount / reference anexamos
        if ((res as any).amount) insertObj.amount = (res as any).amount;
        if ((res as any).reference) insertObj.source_id = (res as any).reference;
        const smsRef = (res as any).sms_reference || (res as any).smsReference;
        if (smsRef?.startsWith("Pg")) insertObj.source_type = smsRef.slice(2);
        const { error: insertError } = await supabase.from("payments").insert(insertObj);
        if (insertError) console.error("Erro ao inserir pagamento completado:", insertError.message);
      }
      return NextResponse.json({ status: res.status });
    } catch (err: any) {
      return NextResponse.json({ error: err.message }, { status: 400 });
    }
  }

  // Se já está no DB, devolvemos
  if (payment.status === "COMPLETED" || payment.status === "FAILED") {
    return NextResponse.json({ status: payment.status });
  }

  // Caso esteja no DB mas ainda pendente (teoricamente não ocorre mais), actualiza estado
  try {
    const res = await queryStatus(paymentId);
    await supabase
      .from("payments")
      .update({ status: res.status })
      .eq("id", paymentId);
    return NextResponse.json({ status: res.status });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 400 });
  }
}
