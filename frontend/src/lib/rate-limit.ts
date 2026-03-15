const rateMap = new Map<string, { count: number; resetTime: number }>();

const WINDOW_MS = 60_000; // 1 minute
const MAX_REQUESTS = 10; // 10 requests per minute per IP+endpoint

export function checkRateLimit(ip: string, endpoint?: string): boolean {
  const key = endpoint ? `${ip}:${endpoint}` : ip;
  const now = Date.now();
  const record = rateMap.get(key);

  if (!record || now > record.resetTime) {
    rateMap.set(key, { count: 1, resetTime: now + WINDOW_MS });
    return true;
  }

  record.count++;
  if (record.count > MAX_REQUESTS) {
    return false;
  }

  return true;
}

// Cleanup stale entries every 5 minutes
if (typeof globalThis !== 'undefined') {
  const timer = setInterval(() => {
    const now = Date.now();
    for (const [key, record] of rateMap) {
      if (now > record.resetTime) {
        rateMap.delete(key);
      }
    }
  }, 300_000);
  // Don't prevent Node.js from exiting
  if (timer && typeof timer === 'object' && 'unref' in timer) {
    timer.unref();
  }
}
