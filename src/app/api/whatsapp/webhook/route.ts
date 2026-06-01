export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { handleIncomingMessage } from '@/lib/whatsapp-bot';
import { rateLimitAsync } from '@/lib/rate-limit';
import { prisma } from '@/lib/db';

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

          // ── STOP opt-out handling ──────────────────────────────────────────
          if (messageType === 'text' && text.trim().toUpperCase() === 'STOP') {
            const cleanPhone = phone.replace(/\D/g, '');
            const user = await prisma.user.findFirst({
              where: { phone: { contains: cleanPhone.slice(-9) } },
              select: { id: true },
            });
            if (user) {
              await prisma.user.update({ where: { id: user.id }, data: { whatsappOptOut: true } });
              console.log(`[WA-Webhook] STOP opt-out recorded for user ${user.id}`);
            }
            // Acknowledge opt-out to sender
            const phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID;
            const accessToken   = process.env.WHATSAPP_ACCESS_TOKEN;
            if (phoneNumberId && accessToken) {
              fetch(`https://graph.facebook.com/v19.0/${phoneNumberId}/messages`, {
                method: 'POST',
                headers: { Authorization: `Bearer ${accessToken}`, 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  messaging_product: 'whatsapp',
                  to:   cleanPhone,
                  type: 'text',
                  text: { body: "You've been unsubscribed from Werest Travel recommendations. Reply START to re-subscribe." },
                }),
              }).catch((err: unknown) => console.warn('[WA-Webhook] STOP ack error:', err));
            }
            continue; // don't pass STOP to the booking bot
          }

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
