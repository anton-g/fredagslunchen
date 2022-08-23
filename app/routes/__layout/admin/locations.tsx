import type { LoaderArgs } from "@remix-run/node"
import { json } from "@remix-run/node"
import { Outlet } from "@remix-run/react"
import styled from "styled-components"
import { requireUserId } from "~/session.server"

export const loader = async ({ request }: LoaderArgs) => {
  await requireUserId(request)

  return json({})
}

export default function AdminLocationsPage() {
  return (
    <div>
      <Title>Locations</Title>
      <Outlet />
    </div>
  )
}

const Title = styled.h3`
  font-size: 24px;
  margin: 0;
  margin-bottom: 16px;
`
