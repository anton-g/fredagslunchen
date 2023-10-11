import type { ActionFunctionArgs, LoaderFunctionArgs } from "@remix-run/node"
import { redirect } from "@remix-run/node"

import { logout } from "~/auth.server"

export const action = async ({ request }: ActionFunctionArgs) => {
  return logout(request)
}

export const loader = async ({}: LoaderFunctionArgs) => {
  return redirect("/")
}
