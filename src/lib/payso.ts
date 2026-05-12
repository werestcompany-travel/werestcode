/**
 * Payso (PaySolutions) payment gateway client
 * Docs: https://api-docs.payso.co/docs/api/overviews
 */
import crypto from 'crypto'

const API_URL     = process.env.PAYSO_API_URL     ?? 'https://sandbox-pgw.payso.co'
const API_KEY     = process.env.PAYSO_API_KEY     ?? ''
const SECRET_KEY  = process.env.PAYSO_SECRET_KEY  ?? ''
const MERCHANT_ID = process.env.PAYSO_MERCHANT_ID ?? ''
const APP_URL     = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'

// ─── Types ────────────────────────────────────────────────────────────────────

export interface CreatePaymentInput {
  orderId:       string   // your unique reference e.g. "WR-20240001"
  amount:        number   // THB amount e.g. 1200.00
  description:   string
  customerName:  string
  customerEmail: string
  customerPhone?: string
}

export interface PaysoPaymentResponse {
  success:    boolean
  paymentUrl: string
  txnId:      string
  orderId:    string
  expiresAt?: string
}

export interface PaysoWebhookPayload {
  orderId:       string
  txnId:         string
  amount:        number
  currency:      string
  status:        'SUCCESS' | 'FAILED' | 'PENDING' | 'CANCELLED'
  paymentMethod: string
  signature:     string
  [key: string]: unknown
}

// ─── Signature helpers ────────────────────────────────────────────────────────

/**
 * Generate HMAC-SHA256 signature for outgoing requests.
 * Payso signs: merchantId + orderId + amount (fixed 2 decimal places)
 */
export function generateRequestSignature(orderId: string, amount: number): string {
  const payload = `${MERCHANT_ID}${orderId}${amount.toFixed(2)}`
  return crypto.createHmac('sha256', SECRET_KEY).update(payload).digest('hex')
}

/**
 * Verify HMAC-SHA256 signature on incoming webhook from Payso.
 * Payso signs: txnId + orderId + amount + status
 */
export function verifyWebhookSignature(payload: PaysoWebhookPayload): boolean {
  if (!payload.signature) return false
  const message = `${payload.txnId}${payload.orderId}${Number(payload.amount).toFixed(2)}${payload.status}`
  const expected = crypto.createHmac('sha256', SECRET_KEY).update(message).digest('hex')
  return crypto.timingSafeEqual(Buffer.from(expected), Buffer.from(payload.signature))
}

// ─── Create payment session ───────────────────────────────────────────────────

export async function createPaysoPayment(
  input: CreatePaymentInput,
): Promise<PaysoPaymentResponse> {
  const signature = generateRequestSignature(input.orderId, input.amount)

  const body = {
    merchantId:        MERCHANT_ID,
    orderId:           input.orderId,
    amount:            input.amount.toFixed(2),
    currency:          'THB',
    description:       input.description,
    customerName:      input.customerName,
    customerEmail:     input.customerEmail,
    customerPhone:     input.customerPhone ?? '',
    frontendReturnUrl: `${APP_URL}/payment/result`,
    backendReturnUrl:  `${APP_URL}/api/payment/webhook`,
    signature,
  }

  const res = await fetch(`${API_URL}/api/v1/payments`, {
    method:  'POST',
    headers: {
      'Content-Type':  'application/json',
      'Authorization': `Bearer ${API_KEY}`,
      'X-Merchant-ID': MERCHANT_ID,
    },
    body: JSON.stringify(body),
  })

  if (!res.ok) {
    const text = await res.text()
    throw new Error(`Payso API error ${res.status}: ${text}`)
  }

  const json = await res.json()

  // Normalise response — Payso may nest under `data`
  const data = json.data ?? json
  return {
    success:    true,
    paymentUrl: data.paymentUrl ?? data.webPaymentUrl ?? data.payment_url,
    txnId:      data.transactionId ?? data.txnId ?? data.transaction_id ?? '',
    orderId:    input.orderId,
    expiresAt:  data.expiresAt ?? data.expires_at,
  }
}
