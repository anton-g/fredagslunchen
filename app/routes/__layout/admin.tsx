import styled from "styled-components"
import type { LoaderArgs } from "@remix-run/node"
import { json } from "@remix-run/node"
import { Link, Outlet } from "@remix-run/react"
import { requireUserId } from "~/session.server"
import { checkIsAdmin } from "~/models/user.server"
import { Stack } from "~/components/Stack"
import { NavLink } from "~/components/Button"
import { Spacer } from "~/components/Spacer"

export const loader = async ({ request }: LoaderArgs) => {
  const userId = await requireUserId(request)

  const isAdmin = await checkIsAdmin(userId)

  if (!isAdmin) throw new Response("Not Found", { status: 404 })

  return json({})
}

export default function AdminPage() {
  return (
    <div>
      <Title>
        <Link to="/admin">Admin</Link>
      </Title>
      <Stack axis="horizontal" gap={16}>
        <NavLink to="/admin/users">users</NavLink>
        <NavLink to="/admin/groups">clubs</NavLink>
        <NavLink to="/admin/locations">locations</NavLink>
        <NavLink to="/admin/tools">tools</NavLink>
      </Stack>
      <Spacer size={16} />
      <Outlet />
    </div>
  )
}

export function ErrorBoundary({ error }: { error: Error }) {
  console.error(error)

  return <div>An unexpected error occurred: {error.message}</div>
}

const Title = styled.h2`
  font-size: 48px;
  margin: 0;
  margin-bottom: 24px;
`
