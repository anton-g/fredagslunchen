import type { LoaderFunctionArgs, MetaFunction } from "@remix-run/node"
import { json } from "@remix-run/node"
import { useLoaderData } from "@remix-run/react"
import styled from "styled-components"
import { Card } from "~/components/Card"
import { Map } from "~/components/Map"
import { Spacer } from "~/components/Spacer"
import { Table } from "~/components/Table"
import { useFeatureFlags } from "~/FeatureFlagContext"
import { mergeMeta } from "~/merge-meta"

import { getAllLocationsStats } from "~/models/location.server"
import { requireUserId } from "~/session.server"
import { formatNumber } from "~/utils"

export const loader = async ({ request }: LoaderFunctionArgs) => {
  await requireUserId(request)
  const locations = await getAllLocationsStats()
  return json({ locations })
}

export const meta: MetaFunction = mergeMeta(() => [
  {
    title: "Discover - Fredagslunchen",
  },
])

export default function DiscoverPage() {
  const { maps } = useFeatureFlags()
  const { locations } = useLoaderData<typeof loader>()

  return (
    <main>
      <Title>Discover</Title>
      <Subtitle>Top 10</Subtitle>
      <Table>
        <Table.Head>
          <tr>
            <Table.Heading>Name</Table.Heading>
            <Table.Heading>Address</Table.Heading>
            <Table.Heading numeric>Rating</Table.Heading>
          </tr>
        </Table.Head>
        <tbody>
          {locations
            .sort((a, b) => b.averageScore - a.averageScore)
            .map((loc) => {
              return (
                <tr key={loc.id}>
                  <Table.Cell>{loc.name}</Table.Cell>
                  <Table.Cell>{loc.address}</Table.Cell>
                  <Table.Cell numeric>{formatNumber(loc.averageScore)}</Table.Cell>
                </tr>
              )
            })}
        </tbody>
      </Table>
      {maps && (
        <>
          <Spacer size={24} />
          <Subtitle>Map</Subtitle>
          <MapCard>
            {/* TODO: fix location link */}
            <Map locations={locations.filter((x) => x.lunchCount)} />
          </MapCard>
        </>
      )}
    </main>
  )
}

const Title = styled.h2`
  font-size: 48px;
  margin: 0;
  margin-bottom: 24px;
`

const Subtitle = styled.h2`
  font-size: 36px;
  margin: 0;
  margin-bottom: 18px;
`

const MapCard = styled(Card)`
  padding: 0;
`
