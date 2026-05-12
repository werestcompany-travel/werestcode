import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';
import { rateLimitAsync, getIP, type RateLimitConfig } from '@/lib/rate-limit';
import { buildSystemMessages } from '@/lib/chat/system-prompt';

export const dynamic = 'force-dynamic';

const CHAT_LIMIT: RateLimitConfig = { limit: 8, windowSec: 30 };

const MODEL = process.env.OPENAI_MODEL ?? 'gpt-4o-mini';

// Lazy-init: OpenAI SDK throws at construction if apiKey is empty/falsy,
// so we only create the client once we've confirmed the key exists.
let _openai: OpenAI | null = null;
function getOpenAI(): OpenAI {
  if (!_openai) {
    _openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY! });
  }
  return _openai;
}

// ─── Validation ───────────────────────────────────────────────────────────────

interface ChatMessage {
  role:    'user' | 'assistant';
  content: string;
}

function validateMessages(msgs: unknown): ChatMessage[] | null {
  if (!Array.isArray(msgs) || msgs.length === 0) return null;
  // Keep last 20 messages max, trim content to 1000 chars each
  const recent = msgs.slice(-20);
  for (const m of recent) {
    if (typeof m !== 'object' || m === null) return null;
    if (!['user', 'assistant'].includes((m as ChatMessage).role)) return null;
    if (typeof (m as ChatMessage).content !== 'string') return null;
  }
  return recent.map(m => ({
    role:    (m as ChatMessage).role,
    content: String((m as ChatMessage).content).slice(0, 1000),
  }));
}

// ─── POST /api/chat ───────────────────────────────────────────────────────────

export async function POST(req: NextRequest) {
  // ── Rate limit ──────────────────────────────────────────────────────────────
  const ip = getIP(req);
  const rl  = await rateLimitAsync(`chat:${ip}`, CHAT_LIMIT);
  if (!rl.allowed) {
    return NextResponse.json(
      { error: 'You\'re sending messages too quickly. Please wait a moment.' },
      { status: 429, headers: { 'Retry-After': String(Math.ceil((rl.resetAt - Date.now()) / 1000)) } },
    );
  }

  // ── Parse body ───────────────────────────────────────────────────────────────
  let body: { messages?: unknown; pageUrl?: string; sessionId?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid request body.' }, { status: 400 });
  }

  const messages = validateMessages(body.messages);
  if (!messages) {
    return NextResponse.json({ error: 'Invalid messages format.' }, { status: 400 });
  }

  // ── Check API key ────────────────────────────────────────────────────────────
  if (!process.env.OPENAI_API_KEY) {
    console.error('[chat] OPENAI_API_KEY not configured');
    return NextResponse.json({ error: 'AI service is not configured.' }, { status: 503 });
  }

  // ── Build OpenAI messages ────────────────────────────────────────────────────
  const systemMessages = buildSystemMessages(body.pageUrl);
  const openAiMessages: OpenAI.Chat.ChatCompletionMessageParam[] = [
    ...systemMessages,
    ...messages.map(m => ({ role: m.role as 'user' | 'assistant', content: m.content })),
  ];

  // ── Stream response ──────────────────────────────────────────────────────────
  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    async start(controller) {
      const send = (event: string, data: object) => {
        controller.enqueue(
          encoder.encode(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`),
        );
      };

      try {
        const completion = await getOpenAI().chat.completions.create({
          model:       MODEL,
          messages:    openAiMessages,
          stream:      true,
          max_tokens:  800,
          temperature: 0.7,
        });

        for await (const chunk of completion) {
          const text = chunk.choices[0]?.delta?.content;
          if (text) {
            send('chunk', { text });
          }
          if (chunk.choices[0]?.finish_reason === 'stop') {
            break;
          }
        }

        send('done', {});
      } catch (err) {
        console.error('[chat] OpenAI error:', err);
        const msg =
          err instanceof Error && err.message.includes('API key')
            ? 'AI service is not configured properly.'
            : 'The AI service is temporarily unavailable. Please try again shortly.';
        send('error', { message: msg });
      } finally {
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: {
      'Content-Type':  'text/event-stream',
      'Cache-Control': 'no-cache, no-store',
      'Connection':    'keep-alive',
      'X-Accel-Buffering': 'no',
    },
  });
}
