const rateMap = new Map<string, { count: number; resetTime: number }>();

const WINDOW_MS = 60_000; // 1 minute
const MAX_REQUESTS = 5; // 5 requests per minute per IP

export function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const record = rateMap.get(ip);

  if (!record || now > record.resetTime) {
    rateMap.set(ip, { count: 1, resetTime: now + WINDOW_MS });
    return true;
  }

  record.count++;
  if (record.count > MAX_REQUESTS) {
    return false;
  }

  return true;
}

// Cleanup stale entries every 5 minutes
setInterval(() => {
  const now = Date.now();
  for (const [ip, record] of rateMap) {
    if (now > record.resetTime) {
      rateMap.delete(ip);
    }
  }
}, 300_000);
