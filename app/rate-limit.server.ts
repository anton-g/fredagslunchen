// Simple in-memory fixed window rate limiter. Good enough since we only run a single instance.
interface Window {
  count: number
  resetAt: number
}

export class RateLimiter {
  private windows = new Map<string, Window>()

  constructor(private config: { limit: number; windowMs: number }) {}

  /** Returns true if the key is allowed another attempt, and counts the attempt */
  public consume(key: string, now = Date.now()) {
    this.prune(now)

    let window = this.windows.get(key)
    if (!window || window.resetAt <= now) {
      window = { count: 0, resetAt: now + this.config.windowMs }
      this.windows.set(key, window)
    }

    window.count++
    return window.count <= this.config.limit
  }

  private prune(now: number) {
    for (let [key, window] of this.windows) {
      if (window.resetAt <= now) this.windows.delete(key)
    }
  }
}

export function getClientIp(request: Request) {
  return (
    request.headers.get("Fly-Client-IP") ??
    request.headers.get("X-Forwarded-For")?.split(",")[0]?.trim() ??
    "unknown"
  )
}

// Generous limit since colleagues in the same office often share an IP
export const signupLimiter = new RateLimiter({ limit: 10, windowMs: 60 * 60 * 1000 })
