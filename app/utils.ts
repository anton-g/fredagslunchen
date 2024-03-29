import { useMatches } from "@remix-run/react"
import { useMemo } from "react"
import z from "zod"

import type { Email, User } from "~/models/user.server"

const DEFAULT_REDIRECT = "/"

/**
 * This should be used any time the redirect path is user-provided
 * (Like the query string on our login/signup pages). This avoids
 * open-redirect vulnerabilities.
 * @param {string} to The redirect destination
 * @param {string} defaultRedirect The redirect to use if the to is unsafe.
 */
export function safeRedirect(
  to: FormDataEntryValue | string | null | undefined,
  defaultRedirect: string = DEFAULT_REDIRECT,
) {
  if (!to || typeof to !== "string") {
    return defaultRedirect
  }

  if (!to.startsWith("/") || to.startsWith("//")) {
    return defaultRedirect
  }

  return to
}

/**
 * This base hook is used in other hooks to quickly search for specific data
 * across all loader data using useMatches.
 * @param {string} id The route id
 * @returns {JSON|undefined} The router data or undefined if not found
 */
export function useMatchesData(id: string): Record<string, unknown> | undefined {
  const matchingRoutes = useMatches()
  const route = useMemo(() => matchingRoutes.find((route) => route.id === id), [matchingRoutes, id])
  return route?.data as Record<string, unknown>
}

function isUser(user: any): user is User {
  return user && typeof user === "object" && typeof user.role === "string"
}

export function useOptionalUser(): User | undefined {
  const data = useMatchesData("root")
  if (!data || !isUser(data.user)) {
    return undefined
  }

  return data.user
}

export function useUser(): User {
  const maybeUser = useOptionalUser()
  if (!maybeUser) {
    throw new Error(
      "No user found in root loader, but user is required by useUser. If user is optional, try useOptionalUser instead.",
    )
  }
  return maybeUser
}

export type RecursivelyConvertDatesToStrings<T> = T extends Date
  ? string
  : T extends Array<infer U>
  ? RecursivelyConvertDatesToStrings<U>[]
  : T extends object
  ? { [K in keyof T]: RecursivelyConvertDatesToStrings<T[K]> }
  : T

const formatter = new Intl.RelativeTimeFormat("en-us", {
  numeric: "auto",
})

export function formatTimeAgo(date: Date) {
  const SECOND = 1000
  const MINUTE = 60 * SECOND
  const HOUR = 60 * MINUTE
  const DAY = 24 * HOUR
  const WEEK = 7 * DAY
  const MONTH = 30 * DAY
  const YEAR = 365 * DAY
  const intervals: {
    ge: number
    divisor: number
    unit: Intl.RelativeTimeFormatUnit
  }[] = [
    { ge: YEAR, divisor: YEAR, unit: "year" },
    { ge: MONTH, divisor: MONTH, unit: "month" },
    { ge: WEEK, divisor: WEEK, unit: "week" },
    { ge: DAY, divisor: DAY, unit: "day" },
    { ge: HOUR, divisor: DAY, unit: "day" },
    { ge: MINUTE, divisor: DAY, unit: "day" },
    { ge: 30 * SECOND, divisor: DAY, unit: "day" },
  ]
  const now = Date.now()
  const diff = now - date.getTime()
  const diffAbs = Math.abs(diff)
  for (const interval of intervals) {
    if (diffAbs >= interval.ge) {
      const x = Math.floor(Math.abs(diff) / interval.divisor)
      const isFuture = diff < 0
      return formatter.format(isFuture ? x : -x, interval.unit)
    }
  }
}

export const formatNumber = (num: number, max?: number) => {
  if (!num) return "-" // TODO fix type
  if (num < 0) return "-"
  if (max && num > max) return "-"

  return num.toLocaleString("en-US", {
    maximumFractionDigits: 1,
    minimumFractionDigits: 0,
  })
}

// TODO improve type
export const getAverageNumber = <T, K extends keyof T>(array: T[], key: K) => {
  return array.length > 0
    ? array.reduce((acc, cur) => acc + (cur[key] as unknown as number), 0) / array.length
    : -1
}

type ShortenOptions = { length?: number; ellipsis?: boolean }
export const shorten = (input?: string | null, options: ShortenOptions = {}) => {
  if (!input) return ""

  const { ellipsis, length } = { length: 18, ellipsis: true, ...options }

  const suffix = ellipsis ? "..." : ""
  return input.length > length ? input.substring(0, length).trim() + suffix : input
}

export function removeTrailingSlash(s: string) {
  return s.endsWith("/") ? s.slice(0, -1) : s
}

export function getDomainUrl(request: Request) {
  const host = request.headers.get("X-Forwarded-Host") ?? request.headers.get("host")
  if (!host) {
    throw new Error("Could not determine domain URL.")
  }
  const protocol = host.includes("localhost") ? "http" : "https"
  return `${protocol}://${host}`
}

export function cleanEmail(email: Email["email"]) {
  return email.toLowerCase().trim()
}

export function hashStr(str: string) {
  let hash = 0
  for (let i = 0; i < str.length; i++) {
    const charCode = str.charCodeAt(i)
    hash += charCode
  }
  return hash
}

export const getRandomAvatarId = (input: string) => {
  const hash = hashStr(input)
  return (hash % 30) + 1
}

const numericSchema = z.coerce.number({ invalid_type_error: "Invalid" })
export function optionalNumeric() {
  const schema = numericSchema.optional()

  return z.preprocess((x) => (typeof x === "string" && x.length > 0 ? x : undefined), schema)
}
export function numeric() {
  return z.preprocess((x) => (typeof x === "string" && x.length > 0 ? x : undefined), numericSchema)
}

export function validateEmail(email: unknown): email is string {
  return typeof email === "string" && email.length > 3 && email.includes("@")
}
