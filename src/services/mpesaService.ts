import crypto from "crypto";
import axios from "axios";

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

    // sms_reference só é aceite em alguns contratos; envia se definido
    if (input.sms_reference) {
      Object.assign(params, { sms_reference: input.sms_reference.slice(0, 20) });
    }

    console.log('Query params createPayment:', params);

    const paymentResponse = await axios.post(
      `${BASE_URL}/v1/c2b/mpesa-payment/${WALLET_ID}`,
      null,
      {
        headers: authHeaders,
        params,
        timeout: 15000,
      }
    );
    return paymentResponse.data;
  } catch (err: any) {
    console.error('Erro createPayment:', err.response?.data || err.message);
    throw new Error(err.response?.data?.message || err.message);
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
