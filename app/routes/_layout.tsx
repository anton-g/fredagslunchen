import type { LoaderFunctionArgs } from "@remix-run/node"
import { json } from "@remix-run/node"
import { Outlet, useLoaderData } from "@remix-run/react"
import { checkIsAdmin } from "~/models/user.server"
import { getUserId } from "~/session.server"
import { Layout } from "~/views/layout"

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const userId = await getUserId(request)

  const isAdmin = userId ? await checkIsAdmin(userId) : false

  return json({ isAdmin })
}

export default function Index() {
  const { isAdmin } = useLoaderData<typeof loader>()

  return (
    <Layout isAdmin={isAdmin}>
      <Outlet />
    </Layout>
  )
}
