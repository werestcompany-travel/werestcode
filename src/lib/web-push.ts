import webpush from 'web-push';
import { prisma } from '@/lib/db';

let _initialized = false;

function init() {
  if (_initialized) return;
  const pub  = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
  const priv = process.env.VAPID_PRIVATE_KEY;
  const subj = process.env.VAPID_SUBJECT ?? 'mailto:hello@gowerest.com';
  if (!pub || !priv) {
    console.warn('[web-push] VAPID keys not configured — push disabled');
    return;
  }
  webpush.setVapidDetails(subj, pub, priv);
  _initialized = true;
}

export interface PushPayload {
  title: string;
  body:  string;
  url?:  string;
  tag?:  string;
}

async function sendToSubscription(
  sub: { endpoint: string; p256dh: string; auth: string },
  payload: PushPayload,
): Promise<boolean> {
  init();
  if (!_initialized) return false;
  try {
    await webpush.sendNotification(
      { endpoint: sub.endpoint, keys: { p256dh: sub.p256dh, auth: sub.auth } },
      JSON.stringify(payload),
    );
    return true;
  } catch (err: unknown) {
    const code = (err as { statusCode?: number })?.statusCode;
    if (code === 410 || code === 404) {
      // Expired subscription — clean up
      await prisma.pushSubscription.deleteMany({ where: { endpoint: sub.endpoint } }).catch(() => {});
    }
    return false;
  }
}

/** Send a push to all VAPID subscriptions for a userId */
export async function sendPushToUser(userId: string, payload: PushPayload): Promise<void> {
  const subs = await prisma.pushSubscription.findMany({ where: { userId } });
  await Promise.allSettled(subs.map((s) => sendToSubscription(s, payload)));
}

/** Send a push to all Expo tokens for a userId (via Expo Push API) */
export async function sendExpoPushToUser(userId: string, payload: PushPayload): Promise<void> {
  const tokens = await prisma.expoToken.findMany({ where: { userId }, select: { token: true } });
  if (tokens.length === 0) return;

  const messages = tokens.map((t) => ({
    to:    t.token,
    title: payload.title,
    body:  payload.body,
    data:  { url: payload.url ?? '/tracking' },
  }));

  try {
    await fetch('https://exp.host/--/api/v2/push/send', {
      method:  'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body:    JSON.stringify(messages.length === 1 ? messages[0] : messages),
    });
  } catch (err) {
    console.error('[web-push] Expo push error:', err);
  }
}

/** Send push to all channels (VAPID + Expo) for a user */
export async function sendPushNotification(userId: string, payload: PushPayload): Promise<void> {
  await Promise.allSettled([
    sendPushToUser(userId, payload),
    sendExpoPushToUser(userId, payload),
  ]);
}
