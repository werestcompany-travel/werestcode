export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { handleIncomingMessage } from '@/lib/whatsapp-bot';
import { rateLimitAsync } from '@/lib/rate-limit';

// ── Webhook verification (GET) ────────────────────────────────────────────────

export async function GET(req: NextRequest) {
  const params    = req.nextUrl.searchParams;
  const mode      = params.get('hub.mode');
  const token     = params.get('hub.verify_token');
  const challenge = params.get('hub.challenge');

  if (
    mode === 'subscribe' &&
    token === process.env.WHATSAPP_WEBHOOK_VERIFY_TOKEN
  ) {
    return new Response(challenge ?? '', { status: 200 });
  }

  return new Response('Forbidden', { status: 403 });
}

// ── Incoming message handler (POST) ──────────────────────────────────────────

export async function POST(req: NextRequest) {
  let body: WhatsAppWebhookPayload;
  try {
    body = await req.json();
  } catch {
    // Meta sends malformed bodies sometimes — still return 200 so it doesn't retry
    return NextResponse.json({ success: true });
  }

  // Only handle whatsapp_business_account events
  if (body.object !== 'whatsapp_business_account') {
    return NextResponse.json({ success: true });
  }

  try {
    for (const entry of body.entry ?? []) {
      for (const change of entry.changes ?? []) {
        const value    = change.value;
        const messages = value?.messages ?? [];

        for (const msg of messages) {
          const phone       = msg.from;
          const messageType = msg.type;
          const text        =
            messageType === 'text' ? (msg.text?.body ?? '') :
            messageType === 'interactive' ? extractInteractiveText(msg) :
            '';

          if (!phone) continue;

          // Rate limit: 60 messages per minute per phone
          const rl = await rateLimitAsync(`wa-bot:${phone}`, { limit: 60, windowSec: 60 });
          if (!rl.allowed) {
            console.warn(`[WA-Webhook] Rate limited phone ${phone}`);
            continue;
          }

          // Fire-and-forget — errors are caught inside handleIncomingMessage
          handleIncomingMessage(phone, text, messageType).catch((err) =>
            console.error('[WA-Webhook] handleIncomingMessage error:', err),
          );
        }
      }
    }
  } catch (err) {
    // Log but always return 200 — Meta retries on any non-200
    console.error('[WA-Webhook] Processing error:', err);
  }

  // Always acknowledge to Meta
  return NextResponse.json({ success: true });
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function extractInteractiveText(msg: WhatsAppMessage): string {
  if (msg.interactive?.type === 'button_reply') {
    return msg.interactive.button_reply?.title ?? '';
  }
  if (msg.interactive?.type === 'list_reply') {
    return msg.interactive.list_reply?.title ?? '';
  }
  return '';
}

// ── Payload types ─────────────────────────────────────────────────────────────

interface WhatsAppWebhookPayload {
  object: string;
  entry?: WhatsAppEntry[];
}

interface WhatsAppEntry {
  changes?: WhatsAppChange[];
}

interface WhatsAppChange {
  value?: WhatsAppChangeValue;
}

interface WhatsAppChangeValue {
  messages?: WhatsAppMessage[];
}

interface WhatsAppMessage {
  from:         string;
  type:         string;
  text?:        { body: string };
  interactive?: {
    type:         string;
    button_reply?: { id: string; title: string };
    list_reply?:   { id: string; title: string; description?: string };
  };
}
