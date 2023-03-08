import { json } from "@remix-run/server-runtime"
import type { LoaderFunction } from "react-router"
import { details } from "~/services/google.server"
import { requireUserId } from "~/session.server"

export const loader: LoaderFunction = async ({ request, params }) => {
  await requireUserId(request)

  const url = new URL(request.url)
  const id = url.searchParams.get("id")

  if (typeof id !== "string" || id.length === 0) {
    return json({ errors: { error: "Something went wrong" } }, { status: 400 })
  }

  const data = await details(id)

  return json(data)
}
