export function createLogger(requestId: string) {
  const log = (level: string, message: string, data?: Record<string, unknown>) => {
    console.log(JSON.stringify({ ts: new Date().toISOString(), requestId, level, message, ...data }));
  };
  return {
    info:  (msg: string, data?: Record<string, unknown>) => log('INFO',  msg, data),
    warn:  (msg: string, data?: Record<string, unknown>) => log('WARN',  msg, data),
    error: (msg: string, data?: Record<string, unknown>) => log('ERROR', msg, data),
  };
}
