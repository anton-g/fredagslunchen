import type { LoaderArgs } from "@remix-run/node"
import { json } from "@remix-run/node"
import { useLoaderData } from "@remix-run/react"
import { requireUserId } from "~/session.server"
import styled from "styled-components"
import { getAdminStats } from "~/models/admin.server"
import { StatsGrid } from "~/components/StatsGrid"
import { Stat } from "~/components/Stat"

export const loader = async ({ request }: LoaderArgs) => {
  await requireUserId(request)

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
        <Stat label="Groups" value={stats.groupCount} />
        <Stat label="Lunches" value={stats.lunchCount} />
        <Stat label="Ratings" value={stats.scoreCount} />
        <Stat label="Group locations" value={stats.groupLocationCount} />
        <Stat label="Locations" value={stats.locationCount} />
      </StatsGrid>
    </>
  )
}

export function ErrorBoundary({ error }: { error: Error }) {
  console.error(error)

  return <div>An unexpected error occurred: {error.message}</div>
}

const Title = styled.h3`
  font-size: 24px;
  margin: 0;
  margin-bottom: 24px;
`
