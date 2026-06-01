export async function register() {
  if (process.env.NEXT_RUNTIME === 'nodejs') {
    const required = ['DATABASE_URL', 'JWT_SECRET', 'TOTP_ENCRYPT_KEY'];
    const missing = required.filter(k => !process.env[k]);
    if (missing.length > 0) {
      console.error(`[startup] Missing required env vars: ${missing.join(', ')}`);
      // Don't throw — log and continue so the app still starts with degraded features
    }
  }
}
