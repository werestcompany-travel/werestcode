/**
 * GET /api/bookings/[id]/stream
 *
 * Server-Sent Events endpoint. The client receives a `status` event
 * whenever the booking status changes, plus an initial ping on connect.
 *
 * NOTE: On Vercel/serverless the connection duration is limited (~55 s for
 * hobby, ~300 s on pro). The client should reconnect using the EventSource
 * `onerror` handler — the browser does this automatically.
 */
export const dynamic = 'force-dynamic';
export const runtime = 'nodejs'; // ReadableStream streams need Node.js runtime

import { NextRequest } from 'next/server';
import { prisma } from '@/lib/db';
import { BookingStatus } from '@/types';

const POLL_MS    = 4_000;  // check DB every 4 s
const MAX_TTL_MS = 5 * 60 * 1_000; // drop connection after 5 min; client reconnects

const TERMINAL: BookingStatus[] = ['COMPLETED', 'CANCELLED'];

interface Params { params: { id: string } }

export async function GET(req: NextRequest, { params }: Params) {
  const { id } = params;
  const encoder = new TextEncoder();

  // Verify booking exists before opening the stream
  const initial = await prisma.booking.findUnique({
    where:   { id },
    include: { statusHistory: { orderBy: { createdAt: 'asc' } } },
  });

  if (!initial) {
    return new Response('Booking not found', { status: 404 });
  }

  let lastStatus: BookingStatus = initial.currentStatus as BookingStatus;
  let timer: ReturnType<typeof setInterval> | null = null;
  let timeoutId: ReturnType<typeof setTimeout> | null = null;

  const stream = new ReadableStream({
    start(controller) {
      const send = (event: string, data: unknown) => {
        try {
          controller.enqueue(
            encoder.encode(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`),
          );
        } catch {
          // controller already closed — ignore
        }
      };

      const close = () => {
        if (timer)     clearInterval(timer);
        if (timeoutId) clearTimeout(timeoutId);
        try { controller.close(); } catch { /* already closed */ }
      };

      // 1. Send initial state immediately
      send('status', {
        status:  lastStatus,
        history: initial.statusHistory,
      });

      // 2. Poll for changes
      timer = setInterval(async () => {
        try {
          const updated = await prisma.booking.findUnique({
            where:   { id },
            include: { statusHistory: { orderBy: { createdAt: 'asc' } } },
          });
          if (!updated) { close(); return; }

          const newStatus = updated.currentStatus as BookingStatus;
          if (newStatus !== lastStatus) {
            lastStatus = newStatus;
            send('status', { status: newStatus, history: updated.statusHistory });
          }

          if (TERMINAL.includes(newStatus)) close();
        } catch (err) {
          console.error('[SSE stream] poll error', err);
        }
      }, POLL_MS);

      // 3. Hard TTL — prevent zombie connections
      timeoutId = setTimeout(() => {
        send('close', { reason: 'timeout' });
        close();
      }, MAX_TTL_MS);

      // 4. Cleanup when client disconnects
      req.signal.addEventListener('abort', close, { once: true });
    },
  });

  return new Response(stream, {
    headers: {
      'Content-Type':  'text/event-stream',
      'Cache-Control': 'no-cache, no-transform',
      'Connection':    'keep-alive',
      'X-Accel-Buffering': 'no', // disable nginx buffering
    },
  });
}
