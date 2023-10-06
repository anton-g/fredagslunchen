import type { LoaderFunctionArgs } from "@remix-run/node"
import { redirect } from "@remix-run/node"
import { verifyUserEmail } from "~/models/user.server"

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const url = new URL(request.url)
  const token = url.searchParams.get("token")

  if (!token) return redirect("/")

  const userId = await verifyUserEmail({ token })

  return redirect(`/users/${userId}`)
}
