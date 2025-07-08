import crypto from "crypto";
import axios from "axios";
/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
const BASE_URL = process.env.E2PAYMENTS_BASE_URL as string;
const CLIENT_ID = process.env.E2PAYMENTS_CLIENT_ID as string;
const CLIENT_SECRET = process.env.E2PAYMENTS_CLIENT_SECRET as string;
const WALLET_ID = process.env.E2PAYMENTS_WALLET_ID as string;
const WEBHOOK_SECRET =
  (process.env.E2PAYMENTS_WEBHOOK_SECRET as string) || CLIENT_SECRET;

interface CreatePaymentInput {
  amount: number;
  phone: string; // telefone do cliente 84/85/86xxxxxxx
  reference: string; // identificador amigável (ex.: orderId)
  sms_reference?: string;
}

interface PaymentResponse {
  id: string;
  status: "PENDING" | "COMPLETED" | "FAILED" | "EXPIRED";
  redirectUrl?: string;
}

// Timeout máximo para chamadas ao gateway (60 seg) – evita 504 do lado Next.js
// Gateway leva até ~90 s em horários de pico; configuramos 2 min para folga
// Timeout máximo para chamadas ao gateway (2 min)
const TIMEOUT_MS = 120_000;


const tokenResponse = await axios.post(`${BASE_URL}/oauth/token`, {
  grant_type: "client_credentials",
  client_id: CLIENT_ID,
  client_secret: CLIENT_SECRET,
});
console.log("Resposta do token: ", tokenResponse.data);

const token = `${tokenResponse.data.token_type} ${tokenResponse.data.access_token}`;

const authHeaders = {
  "Content-Type": "application/json",
  Authorization: token,
  Accept: "application/json",
};

export async function createPayment(
  input: CreatePaymentInput
): Promise<PaymentResponse> {
  try {
    const params = {
      client_id: CLIENT_ID,
      amount: input.amount,
      reference: input.reference.length > 27 ? input.reference.slice(0, 27) : input.reference,
      phone: input.phone,
    } as const;

    if (input.sms_reference) {
      Object.assign(params, { sms_reference: input.sms_reference.slice(0, 20) });
    }

    console.log('Query params createPayment:', params);

    const paymentResponse = await axios.post(
      `${BASE_URL}/v1/c2b/mpesa-payment/${WALLET_ID}`,
      params,
      {
        headers: authHeaders,
        timeout: TIMEOUT_MS,
      }
    );
    return paymentResponse.data;
  } catch (err: any) {
    console.error('Erro createPayment:', err.response?.data || err.message);
    const data = err.response?.data;
    // Se o gateway devolveu dados da transação mesmo com status HTTP de erro,
    // usamos esses dados para prosseguir com o fluxo
    if (data && data.id && data.status) {
      console.warn('Gateway retornou status HTTP de erro mas com dados de pagamento, prosseguindo:', data);
      return data as PaymentResponse;
    }
    throw new Error(data?.message || err.message);
  }
}

export async function queryStatus(paymentId: string): Promise<PaymentResponse> {
  try {
    const queryResponse = await axios.post(
      `${BASE_URL}/v1/payments/mpesa/get/${paymentId}`,
      { client_id: CLIENT_ID },
      { headers: authHeaders }
    );
    return queryResponse.data;
  } catch (err: any) {
    console.error('Erro queryStatus:', err.response?.data || err.message);
    throw new Error(err.response?.data?.message || err.message);
  }
}

// Fallback: obtém o pagamento mais recente e tenta encontrar por referência
export async function getPaymentByReference(reference: string, amount: number): Promise<PaymentResponse | null> {
  try {
    const resp = await axios.post(
      `${BASE_URL}/v1/payments/mpesa/get/all/paginate/1`,
      { client_id: CLIENT_ID },
      { headers: authHeaders, timeout: 30_000 }
    );
    const latest = resp.data?.data?.[0];
    if (!latest) return null;
    // conferimos se referência e montante coincidem (converter para número)
    const amountNum = typeof latest.amount === 'string' ? parseFloat(latest.amount) : Number(latest.amount);
    if (latest.reference !== reference || amountNum !== amount) return null;

    const statusMap: Record<string, PaymentResponse["status"]> = {
      Success: "COMPLETED",
      Failed: "FAILED",
    };
    const mappedStatus = statusMap[latest.status] || "PENDING";

    return {
      id: String(latest.id),
      status: mappedStatus,
    };
  } catch (err: any) {
    console.error('Erro getPaymentByReference:', err.response?.data || err.message);
    return null;
  }
}

export function verifyWebhookSignature(
  rawBody: string,
  receivedSignature: string
) {
  const expected = crypto
    .createHmac("sha256", WEBHOOK_SECRET)
    .update(rawBody)
    .digest("hex");
  return crypto.timingSafeEqual(
    Buffer.from(expected),
    Buffer.from(receivedSignature)
  );
}
