import { sub } from "date-fns"
import { formatTimeAgo, shorten, validateEmail } from "./utils"

test("validateEmail returns false for non-emails", () => {
  expect(validateEmail(undefined)).toBe(false)
  expect(validateEmail(null)).toBe(false)
  expect(validateEmail("")).toBe(false)
  expect(validateEmail("not-an-email")).toBe(false)
  expect(validateEmail("n@")).toBe(false)
})

test("validateEmail returns true for emails", () => {
  expect(validateEmail("kody@example.com")).toBe(true)
})

test("shorten returns shortened string", () => {
  expect(shorten("a string longer than 18 chars")).toBe("a string longer th...")
  expect(shorten("a string longer than 18 chars", { ellipsis: false })).toBe(
    "a string longer th"
  )
  expect(shorten("a string longer than 2 chars", { length: 2 })).toBe("a...")
  expect(
    shorten("a string longer than 2 chars", { length: 2, ellipsis: false })
  ).toBe("a")
})

describe("formatTimeAgo", () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  test("formatTimeAgo returns correct names for times", () => {
    const date = new Date(2000, 1, 10, 12)
    vi.setSystemTime(date)

    expect(formatTimeAgo(sub(new Date(), { hours: 2 }))).toBe("today")
    expect(formatTimeAgo(sub(new Date(), { days: 1 }))).toBe("yesterday")
    expect(formatTimeAgo(sub(new Date(), { days: 4 }))).toBe("4 days ago")
    expect(formatTimeAgo(sub(new Date(), { weeks: 1 }))).toBe("last week")
    expect(formatTimeAgo(sub(new Date(), { weeks: 3 }))).toBe("3 weeks ago")
    expect(formatTimeAgo(sub(new Date(), { months: 1 }))).toBe("last month")
    expect(formatTimeAgo(sub(new Date(), { months: 2 }))).toBe("2 months ago")
  })
})
