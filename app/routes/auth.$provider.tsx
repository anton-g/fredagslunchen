import type { ActionFunctionArgs } from "@remix-run/node"
import { redirect } from "@remix-run/node"
import invariant from "tiny-invariant"
import { authenticator } from "~/auth.server"

export const loader = () => redirect("/login")

export const action = async ({ request, params }: ActionFunctionArgs) => {
  invariant(params.provider, "Provider not found")

  try {
    const result = await authenticator.authenticate(params.provider, request, {
      throwOnError: true,
      successRedirect: "/asdf",
    })
    return result
  } catch (error) {
    if (error instanceof Response) return error

    throw error
  }
}
