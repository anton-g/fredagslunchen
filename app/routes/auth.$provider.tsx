import type { ActionFunctionArgs } from "@remix-run/node"
import { redirect } from "@remix-run/node"
import invariant from "tiny-invariant"
import type { AuthRedirectState } from "~/auth.server"
import { authenticator, stateCache } from "~/auth.server"
import { v4 } from "uuid"

export const loader = () => redirect("/login")

export const action = async ({ request, params }: ActionFunctionArgs) => {
  invariant(params.provider, "Provider not found")

  const url = new URL(request.url)
  const redirectTo = url.searchParams.get("redirectTo")
  const from = url.searchParams.get("from")
  const inviteToken = url.searchParams.get("token")

  const nonce = v4()
  stateCache.set<AuthRedirectState>(nonce, {
    redirectTo: redirectTo ?? undefined,
    from: from ?? undefined,
    groupInviteToken: inviteToken ?? undefined,
  })

  try {
    const result = await authenticator.authenticate(params.provider, request, {
      throwOnError: true,
      // @ts-expect-error this works, but the remix-auth types don't know about it yet
      state: nonce,
    })
    return result
  } catch (error) {
    if (error instanceof Response) return error

    throw error
  }
}
