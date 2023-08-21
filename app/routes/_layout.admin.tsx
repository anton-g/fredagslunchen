import styled from "styled-components"
import type { LoaderArgs } from "@remix-run/node"
import { json } from "@remix-run/node"
import { Link, Outlet, isRouteErrorResponse, useRouteError } from "@remix-run/react"
import { requireAdminUserId } from "~/session.server"
import { Stack } from "~/components/Stack"
import { NavLink } from "~/components/Button"
import { Spacer } from "~/components/Spacer"

export const loader = async ({ request }: LoaderArgs) => {
  await requireAdminUserId(request)

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

export function ErrorBoundary() {
  const error = useRouteError()

  if (error instanceof Error) {
    return <div>An unexpected error occurred: {error.message}</div>
  }

  if (!isRouteErrorResponse(error)) {
    return <h1>Unknown Error</h1>
  }

  if (error.status === 404) {
    return (
      <div>
        <h2>Not Found</h2>
      </div>
    )
  }

  return (
    <div>
      <h1>Oops</h1>
      <p>Status: {error.status}</p>
      <p>{error.data.message}</p>
    </div>
  )
}

const Title = styled.h2`
  font-size: 48px;
  margin: 0;
  margin-bottom: 24px;
`
