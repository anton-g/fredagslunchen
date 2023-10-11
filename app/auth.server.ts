import { Authenticator, AuthorizationError } from "remix-auth"
import { sessionStorage } from "~/session.server"
import { FormStrategy } from "remix-auth-form"
import type { User } from "./models/user.server"
import { checkIsAdmin, getUserById, verifyLogin } from "./models/user.server"
import invariant from "tiny-invariant"
import type { Theme } from "./styles/theme"
import { redirect } from "@remix-run/node"

export const authenticator = new Authenticator<string>(sessionStorage, {
  sessionKey: "userId",
})

authenticator.use(
  new FormStrategy(async ({ form }) => {
    const email = form.get("email")
    const password = form.get("password")

    invariant(typeof email === "string", "email must be a string")
    invariant(email.length > 0, "email must not be empty")

    invariant(typeof password === "string", "password must be a string")
    invariant(password.length > 0, "password must not be empty")

    const user = await verifyLogin(email, password)

    if (!user) throw new AuthorizationError("Invalid email or password")

    return user.id
  }),
  "user-pass",
)

export async function getUserId(request: Request): Promise<User["id"] | null> {
  const userId = await authenticator.isAuthenticated(request)
  return userId
}

export async function getUser(request: Request) {
  const userId = await getUserId(request)
  if (!userId) return null

  const user = await getUserById(userId)
  if (user) return { ...user, theme: user.theme as Theme }

  throw await authenticator.logout(request, { redirectTo: "/" })
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

  throw await authenticator.logout(request, { redirectTo: "/" })
}

export async function logout(request: Request) {
  return await authenticator.logout(request, { redirectTo: "/" })
}
