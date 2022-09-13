import type { LoaderArgs } from "@remix-run/node"
import { json } from "@remix-run/node"
import { useCatch, useLoaderData } from "@remix-run/react"
import invariant from "tiny-invariant"

import { getUserId } from "~/session.server"
import { Link } from "react-router-dom"
import { getGroupLocation } from "~/models/location.server"
import { Table } from "~/components/Table"
import styled from "styled-components"
import { LinkButton } from "~/components/Button"
import { Spacer } from "~/components/Spacer"
import { formatNumber } from "~/utils"

export const loader = async ({ request, params }: LoaderArgs) => {
  const userId = await getUserId(request)
  invariant(params.groupId, "groupId not found")
  invariant(params.locationId, "locationId not found")

  const groupLocation = await getGroupLocation({
    groupId: params.groupId,
    id: parseInt(params.locationId),
  })

  if (!groupLocation) {
    throw new Response("Not Found", { status: 404 })
  }

  const currentMember = groupLocation.group.members.find(
    (m) => m.userId === userId
  )
  const isMember = Boolean(currentMember)

  return json({ groupLocation, isMember })
}

export default function LocationDetailsPage() {
  const { groupLocation, isMember } = useLoaderData<typeof loader>()

  return (
    <div>
      <Title>at {groupLocation.location.name}</Title>
      <h3>Lunches</h3>
      <Table>
        <Table.Head>
          <tr>
            <Table.Heading>Date</Table.Heading>
            <Table.Heading>Choosen by</Table.Heading>
            <Table.Heading numeric>Avg rating</Table.Heading>
          </tr>
        </Table.Head>
        <tbody>
          {groupLocation.lunches.map((lunch) => (
            <Table.LinkRow
              to={`/groups/${lunch.groupLocationGroupId}/lunches/${lunch.id}`}
              key={lunch.id}
            >
              <Table.Cell>
                <Link
                  to={`/groups/${lunch.groupLocationGroupId}/lunches/${lunch.id}`}
                >
                  {new Date(lunch.date).toLocaleDateString()}
                </Link>
              </Table.Cell>
              <Table.Cell>
                {lunch.choosenBy ? lunch.choosenBy.name : "-"}
              </Table.Cell>
              <Table.Cell numeric>
                {formatNumber(
                  lunch.scores.reduce((acc, cur) => acc + cur.score, 0) /
                    lunch.scores.length
                )}
              </Table.Cell>
            </Table.LinkRow>
          ))}
        </tbody>
      </Table>
      {isMember && (
        <>
          <Spacer size={16} />
          <LinkButton
            to={`/groups/${groupLocation.groupId}/lunches/new?loc=${groupLocation.locationId}`}
            style={{ marginLeft: "auto" }}
          >
            New lunch
          </LinkButton>
        </>
      )}
    </div>
  )
}

export function ErrorBoundary({ error }: { error: Error }) {
  console.error(error)

  return <div>An unexpected error occurred: {error.message}</div>
}

export function CatchBoundary() {
  const caught = useCatch()

  if (caught.status === 404) {
    return <div>Location not found</div>
  }

  throw new Error(`Unexpected caught response with status: ${caught.status}`)
}

const Title = styled.h2`
  font-size: 48px;
  margin: 0;
  margin-bottom: 24px;
`
