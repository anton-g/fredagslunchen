import type { LoaderArgs } from "@remix-run/node"
import { json } from "@remix-run/node"
import { Outlet } from "@remix-run/react"
import styled from "styled-components"
import { NavLink } from "~/components/Button"
import { Spacer } from "~/components/Spacer"
import { Stack } from "~/components/Stack"
import { requireAdminUserId } from "~/session.server"

export const loader = async ({ request }: LoaderArgs) => {
  await requireAdminUserId(request)

  return json({})
}

export default function AdminLocationsPage() {
  return (
    <div>
      <Title>Locations</Title>
      <Stack axis="horizontal" gap={16}>
        <NavLink to="/admin/locations">list</NavLink>
        <NavLink to="/admin/locations/merge">merge</NavLink>
      </Stack>
      <Spacer size={24} />
      <Outlet />
    </div>
  )
}

const Title = styled.h3`
  font-size: 24px;
  margin: 0;
  margin-bottom: 16px;
`
