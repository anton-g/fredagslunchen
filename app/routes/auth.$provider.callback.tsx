import { redirect, type LoaderFunctionArgs } from "@remix-run/node"
import { AuthorizationError } from "remix-auth"
import invariant from "tiny-invariant"
import { authenticator } from "~/auth.server"

export let loader = async ({ request, params }: LoaderFunctionArgs) => {
  invariant(params.provider, "Provider not found")
  const url = new URL(request.url)

  const inviteToken = url.searchParams.get("token")

  console.log("inviteToken", inviteToken)

  try {
    await authenticator.authenticate(params.provider, request, {
      successRedirect: "/",
      throwOnError: true,
    })
  } catch (error) {
    if (error instanceof Response) {
      console.log("SUCCESS?")
      return error
    }
    if (error instanceof AuthorizationError) {
      // TODO redirect to correct origin
      return redirect(`/login?error=${encodeURIComponent(error.message)}`)
    }

    throw error
  }
}
