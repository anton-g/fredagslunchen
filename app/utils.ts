import { useMatches } from "@remix-run/react"
import { useMemo } from "react"

import type { User } from "~/models/user.server"

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
  defaultRedirect: string = DEFAULT_REDIRECT
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
export function useMatchesData(
  id: string
): Record<string, unknown> | undefined {
  const matchingRoutes = useMatches()
  const route = useMemo(
    () => matchingRoutes.find((route) => route.id === id),
    [matchingRoutes, id]
  )
  return route?.data
}

function isUser(user: any): user is User {
  return user && typeof user === "object" && typeof user.emailId === "number"
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
      "No user found in root loader, but user is required by useUser. If user is optional, try useOptionalUser instead."
    )
  }
  return maybeUser
}

export function validateEmail(email: unknown): email is string {
  return typeof email === "string" && email.length > 3 && email.includes("@")
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

const DIVISIONS: { amount: number; name: Intl.RelativeTimeFormatUnit }[] = [
  { amount: 7, name: "days" },
  { amount: 4.34524, name: "weeks" },
  { amount: 12, name: "months" },
  { amount: Number.POSITIVE_INFINITY, name: "years" },
]

export function formatTimeAgo(date: Date) {
  let duration = (date.valueOf() - new Date().valueOf()) / 1000 / 60 / 60 / 24

  for (let i = 0; i <= DIVISIONS.length; i++) {
    const division = DIVISIONS[i]
    if (Math.abs(duration) < division.amount) {
      return formatter.format(Math.round(duration), division.name)
    }
    duration /= division.amount
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
    ? array.reduce((acc, cur) => acc + (cur[key] as unknown as number), 0) /
        array.length
    : -1
}

type ShortenOptions = { length?: number; ellipsis?: boolean }
export const shorten = (
  input?: string | null,
  options: ShortenOptions = {}
) => {
  if (!input) return ""

  const { ellipsis, length } = { length: 18, ellipsis: true, ...options }

  const suffix = ellipsis ? "..." : ""
  return input.length > length
    ? input.substring(0, length).trim() + suffix
    : input
}
