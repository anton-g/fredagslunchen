import type { LoaderArgs } from "@remix-run/node"
import { json } from "@remix-run/node"
import { isRouteErrorResponse, useLoaderData, useRouteError } from "@remix-run/react"
import { requireAdminUserId } from "~/session.server"
import styled from "styled-components"
import { getAdminStats } from "~/models/admin.server"
import { StatsGrid } from "~/components/StatsGrid"
import { Stat } from "~/components/Stat"

export const loader = async ({ request }: LoaderArgs) => {
  await requireAdminUserId(request)

  const stats = await getAdminStats()

  return json({ stats })
}

export default function AdminPage() {
  const { stats } = useLoaderData<typeof loader>()

  return (
    <>
      <Title>Stats</Title>
      <StatsGrid>
        <Stat label="Users" value={stats.userCount} />
        <Stat label="Clubs" value={stats.groupCount} />
        <Stat label="Lunches" value={stats.lunchCount} />
        <Stat label="Ratings" value={stats.scoreCount} />
        <Stat label="Club locations" value={stats.groupLocationCount} />
        <Stat label="Locations" value={stats.locationCount} />
      </StatsGrid>
    </>
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

const Title = styled.h3`
  font-size: 24px;
  margin: 0;
  margin-bottom: 24px;
`
