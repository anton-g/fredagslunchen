import { redirect, type LoaderFunctionArgs } from "@remix-run/node"
import { AuthorizationError } from "remix-auth"
import invariant from "tiny-invariant"
import type { AuthRedirectState } from "~/auth.server"
import { authenticator, stateCache } from "~/auth.server"
import { addUserToGroupWithInviteToken } from "~/models/group.server"
import { commitSession, getSession } from "~/session.server"

export let loader = async ({ request, params }: LoaderFunctionArgs) => {
  invariant(params.provider, "Provider not found")
  const url = new URL(request.url)

  const nonce = url.searchParams.get("state")

  let successRedirect = "/"
  let from = "login"
  const result = stateCache.get<AuthRedirectState>(nonce || "")
  stateCache.del(nonce || "")
  if (result?.redirectTo) {
    successRedirect = result.redirectTo
  }
  if (result?.from) {
    from = result.from
  }

  try {
    const userId = await authenticator.authenticate(params.provider, request, {
      throwOnError: true,
    })

    const session = await getSession(request.headers.get("cookie"))
    session.set(authenticator.sessionKey, userId)
    const headers = new Headers({ "Set-Cookie": await commitSession(session) })

    if (result?.groupInviteToken) {
      const group = await addUserToGroupWithInviteToken({ inviteToken: result.groupInviteToken, userId })
      return redirect(`/groups/${group.id}`, { headers })
    }

    return redirect(successRedirect, { headers })
  } catch (error) {
    if (error instanceof Response) {
      return error
    }
    if (error instanceof AuthorizationError) {
      return redirect(`/${from}?error=${encodeURIComponent(error.message)}`)
    }

    throw error
  }
}
