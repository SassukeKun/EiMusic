import base64 from 'base-64';
/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
// PayPal REST API helper service
// Docs: https://developer.paypal.com/docs/api/overview/
// The functions here deliberately keep a small surface area that covers the needs of EiMusic:
//   • createOrder – generates an order for the exact amount in USD (or any given currency)
//   • captureOrder – finalises an approved order so that the funds are actually captured
//   • getOrder – fetches the current status of an order
//   • verifyWebhookSignature – lightweight helper that proxies PayPal's dedicated endpoint
//      NOTE: for webhooks we recommend enabling the "PAYMENT.CAPTURE.COMPLETED" event and
//            storing its webhook-id in the PAYPAL_WEBHOOK_ID env var.

const BASE_URL = process.env.PAYPAL_BASE_URL as string;
const CLIENT_ID = process.env.PAYPAL_CLIENT_ID as string;
const CLIENT_SECRET = process.env.PAYPAL_CLIENT_SECRET as string;
const WEBHOOK_ID = process.env.PAYPAL_WEBHOOK_ID as string; // optional but recommended

if (!BASE_URL || !CLIENT_ID || !CLIENT_SECRET) {
  // eslint-disable-next-line no-console
  console.warn('[paypalService] Missing PayPal env vars – service will throw at runtime');
}

interface Amount {
  currency_code: string;
  value: string; // PayPal expects string amounts with 2 decimal places
}

interface CreateOrderInput {
  amount: Amount;
  reference: string; // our internal reference so we can map it back (e.g. sourceId)
  returnUrl?: string; // url that PayPal should redirect to after approval
  cancelUrl?: string; // url that PayPal redirects to when user cancels
}

interface PayPalLink {
  href: string;
  rel: string;
  method: string;
}

export interface PayPalOrder {
  id: string;
  status: string;
  links: PayPalLink[];
  purchase_units: any[];
}

let cachedToken: { token: string; expiresAt: number } | null = null;

async function getAccessToken(): Promise<string> {
  if (cachedToken && cachedToken.expiresAt > Date.now()) return cachedToken.token;

  const res = await fetch(`${BASE_URL}/v1/oauth2/token`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      Authorization: `Basic ${base64.encode(`${CLIENT_ID}:${CLIENT_SECRET}`)}`,
    },
    body: new URLSearchParams({ grant_type: 'client_credentials' }),
  });

  if (!res.ok) {
    const txt = await res.text();
    throw new Error(`PayPal token error ${res.status}: ${txt}`);
  }

  const json = await res.json();
  const expiresIn = Number(json.expires_in || 0) * 1000; // ms
  cachedToken = {
    token: json.access_token as string,
    expiresAt: Date.now() + expiresIn - 60_000, // renew 60s before expiry
  };

  return cachedToken.token;
}

function authHeader(token: string) {
  return {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${token}`,
  } as const;
}

export async function createOrder(input: CreateOrderInput): Promise<PayPalOrder> {
  const token = await getAccessToken();

  const body = {
    intent: 'CAPTURE',
    purchase_units: [
      {
        reference_id: input.reference,
        amount: input.amount,
      },
    ],
    application_context: {
      brand_name: 'EiMusic',
      landing_page: 'LOGIN',
      user_action: 'PAY_NOW',
      return_url: input.returnUrl || 'https://eimusic.mz/payment/success',
      cancel_url: input.cancelUrl || 'https://eimusic.mz/payment/cancel',
    },
  };

  const res = await fetch(`${BASE_URL}/v2/checkout/orders`, {
    method: 'POST',
    headers: authHeader(token),
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const txt = await res.text();
    throw new Error(`PayPal createOrder error ${res.status}: ${txt}`);
  }

  return res.json();
}

export async function captureOrder(orderId: string) {
  const token = await getAccessToken();
  const res = await fetch(`${BASE_URL}/v2/checkout/orders/${orderId}/capture`, {
    method: 'POST',
    headers: authHeader(token),
  });
  if (!res.ok) {
    const txt = await res.text();
    throw new Error(`PayPal capture error ${res.status}: ${txt}`);
  }
  return res.json();
}

export async function getOrder(orderId: string): Promise<PayPalOrder> {
  const token = await getAccessToken();
  const res = await fetch(`${BASE_URL}/v2/checkout/orders/${orderId}`, {
    method: 'GET',
    headers: authHeader(token),
  });
  if (!res.ok) {
    const txt = await res.text();
    throw new Error(`PayPal getOrder error ${res.status}: ${txt}`);
  }
  return res.json();
}

/**
 * Lightweight wrapper around the PayPal Verify Webhook Signature endpoint.
 * Returns true if PayPal verifies the event came from them.
 */
export async function verifyWebhookSignature(headers: Headers, body: string) {
  // Only attempt verification if we have a webhook id
  if (!WEBHOOK_ID) return true;

  const token = await getAccessToken();
  const verificationRes = await fetch(`${BASE_URL}/v1/notifications/verify-webhook-signature`, {
    method: 'POST',
    headers: authHeader(token),
    body: JSON.stringify({
      auth_algo: headers.get('paypal-auth-algo'),
      cert_url: headers.get('paypal-cert-url'),
      transmission_id: headers.get('paypal-transmission-id'),
      transmission_sig: headers.get('paypal-transmission-sig'),
      transmission_time: headers.get('paypal-transmission-time'),
      webhook_id: WEBHOOK_ID,
      webhook_event: JSON.parse(body),
    }),
  });
  if (!verificationRes.ok) return false;
  const json = await verificationRes.json();
  return json.verification_status === 'SUCCESS';
}
