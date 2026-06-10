import * as Sentry from '@sentry/nextjs';

/**
 * Run a non-blocking side effect (email, WhatsApp, push) without letting a
 * failure break the request — but UNLIKE `.catch(console.error)`, failures
 * are captured to Sentry so a broken provider is visible, not silent.
 *
 * Usage:
 *   fireAndForget(sendBookingConfirmationEmail(data), 'booking-confirmation-email', { bookingRef });
 */
export function fireAndForget(
  promise: Promise<unknown>,
  label: string,
  context?: Record<string, string | number | undefined>,
): void {
  promise.catch((err) => {
    console.error(`[fire-and-forget] ${label} failed:`, err);
    Sentry.captureException(err, {
      tags: { fireAndForget: label },
      extra: context,
    });
  });
}
