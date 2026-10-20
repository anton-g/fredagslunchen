import { RateLimiter } from "./rate-limit.server"

test("RateLimiter allows up to limit within window and resets after", () => {
  let limiter = new RateLimiter({ limit: 2, windowMs: 1000 })

  expect(limiter.consume("a", 0)).toBe(true)
  expect(limiter.consume("a", 100)).toBe(true)
  expect(limiter.consume("a", 200)).toBe(false)
  expect(limiter.consume("b", 200)).toBe(true)
  expect(limiter.consume("a", 1000)).toBe(true)
})
