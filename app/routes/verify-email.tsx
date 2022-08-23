import type { LoaderFunction } from "@remix-run/node"
import { redirect } from "@remix-run/node"
import { verifyUserEmail } from "~/models/user.server"

export const loader: LoaderFunction = async ({ request }) => {
  const url = new URL(request.url)
  const token = url.searchParams.get("token")

  if (!token) return redirect("/")

  const userId = await verifyUserEmail({ token })

  return redirect(`/users/${userId}`)
}
