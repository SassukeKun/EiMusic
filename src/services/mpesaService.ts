import crypto from 'crypto';

const BASE_URL = process.env.E2PAYMENTS_BASE_URL as string;
const CLIENT_ID = process.env.E2PAYMENTS_CLIENT_ID as string;
const CLIENT_SECRET = process.env.E2PAYMENTS_CLIENT_SECRET as string;
const WALLET_ID = process.env.E2PAYMENTS_WALLET_ID as string;
const WEBHOOK_SECRET = (process.env.E2PAYMENTS_WEBHOOK_SECRET as string) || CLIENT_SECRET;
const PUBLIC_KEY = process.env.E2PAYMENTS_PUBLIC_KEY as string;

interface CreatePaymentInput {
  amount: number;
  msisdn: string; // telefone do cliente 84/85/86xxxxxxx
  reference: string; // identificador amigável (ex.: orderId)
  metadata?: Record<string, any>;
}

interface PaymentResponse {
  id: string;
  status: 'PENDING' | 'COMPLETED' | 'FAILED' | 'EXPIRED';
  redirectUrl?: string;
}

let cachedToken: { access_token: string; expires_at: number } | null = null;

async function getAccessToken(): Promise<string> {
  if (cachedToken && Date.now() < cachedToken.expires_at) return cachedToken.access_token;
  const res = await fetch(`${BASE_URL}/oauth/token`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      grant_type: 'client_credentials',
      client_id: CLIENT_ID,
      client_secret: CLIENT_SECRET,
    }),
  });
  if (!res.ok) throw new Error('Failed to get OAuth token');
  const json = await res.json();
  cachedToken = {
    access_token: json.access_token,
    expires_at: Date.now() + (json.expires_in - 60) * 1000, // 60s buffer
  };
  return cachedToken.access_token;
}

async function authHeaders() {
  const token = await getAccessToken();
  return {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${token}`,
    Accept: 'application/json',
  } as const;
}

export async function createPayment(input: CreatePaymentInput): Promise<PaymentResponse> {
  const res = await fetch(`${BASE_URL}/v1/c2b/mpesa-payment/${WALLET_ID}`, {
    method: 'POST',
    headers: await authHeaders(),
    body: JSON.stringify({
      client_id: CLIENT_ID,
      amount: String(input.amount),
      phone: input.msisdn,
      reference: input.reference,
    }),
  });
  if (!res.ok) throw new Error(`e2payments error ${res.status}`);
  return res.json();
}

export async function queryStatus(paymentId: string): Promise<PaymentResponse> {
  const res = await fetch(`${BASE_URL}/v1/payments/mpesa/get/${paymentId}`, {
    method: 'POST',
    headers: await authHeaders(),
    body: JSON.stringify({ client_id: CLIENT_ID }),
  });
  if (!res.ok) throw new Error('Unable to query status');
  return res.json();
}

export function verifyWebhookSignature(rawBody: string, receivedSignature: string) {
  const expected = crypto
    .createHmac('sha256', WEBHOOK_SECRET)
    .update(rawBody)
    .digest('hex');
  return crypto.timingSafeEqual(Buffer.from(expected), Buffer.from(receivedSignature));
}
