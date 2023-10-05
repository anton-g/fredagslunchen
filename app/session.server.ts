import { createCookieSessionStorage, redirect } from "@remix-run/node"
import invariant from "tiny-invariant"

import type { User } from "~/models/user.server"
import { checkIsAdmin, getUserById } from "~/models/user.server"
import type { Theme } from "./styles/theme"

invariant(process.env.SESSION_SECRET, "SESSION_SECRET must be set")

export const sessionStorage = createCookieSessionStorage({
  cookie: {
    name: "__session",
    httpOnly: true,
    path: "/",
    sameSite: "lax",
    secrets: [process.env.SESSION_SECRET],
    secure: process.env.NODE_ENV === "production",
  },
})

const USER_SESSION_KEY = "userId"

export async function getSession(request: Request) {
  const cookie = request.headers.get("Cookie")
  return sessionStorage.getSession(cookie)
}

export async function getUserId(request: Request): Promise<User["id"] | undefined> {
  const session = await getSession(request)
  const userId = session.get(USER_SESSION_KEY)
  return userId
}

export async function getUser(request: Request) {
  const userId = await getUserId(request)
  if (userId === undefined) return null

  const user = await getUserById(userId)
  if (user) return { ...user, theme: user.theme as Theme }

  throw await logout(request)
}

export async function requireUserId(request: Request, redirectTo: string = new URL(request.url).pathname) {
  const userId = await getUserId(request)
  if (!userId) {
    const searchParams = new URLSearchParams([["redirectTo", redirectTo]])
    throw redirect(`/login?${searchParams}`)
  }
  return userId
}

export async function requireAdminUserId(request: Request, redirectTo?: string) {
  const userId = await requireUserId(request, redirectTo)
  const isAdmin = await checkIsAdmin(userId)

  if (!isAdmin) throw new Response("Not Found", { status: 404 })

  return userId
}

export async function requireUser(request: Request) {
  const userId = await requireUserId(request)

  const user = await getUserById(userId)
  if (user) return user

  throw await logout(request)
}

export async function createUserSession({
  request,
  userId,
  redirectTo,
}: {
  request: Request
  userId: string
  redirectTo: string
}) {
  const session = await getSession(request)
  session.set(USER_SESSION_KEY, userId)
  return redirect(redirectTo, {
    headers: {
      "Set-Cookie": await sessionStorage.commitSession(session, {
        maxAge: 60 * 60 * 24 * 365, // 365 days
      }),
    },
  })
}

export async function logout(request: Request) {
  const session = await getSession(request)
  return redirect("/", {
    headers: {
      "Set-Cookie": await sessionStorage.destroySession(session),
    },
  })
}
