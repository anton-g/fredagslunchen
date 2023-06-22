import type { LoaderArgs } from "@remix-run/node"
import { json } from "@remix-run/node"
import { useCatch, useLoaderData } from "@remix-run/react"
import invariant from "tiny-invariant"

import { getUserId } from "~/session.server"
import { Link } from "react-router-dom"
import { getGroupLocation } from "~/models/location.server"
import styled from "styled-components"
import { LinkButton } from "~/components/Button"
import { Spacer } from "~/components/Spacer"
import { formatNumber, formatTimeAgo } from "~/utils"
import { getGroupPermissions } from "~/models/group.server"
import { SortableTable } from "~/components/SortableTable"

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

  const permissions = await getGroupPermissions({
    currentUserId: userId,
    group: groupLocation.group,
  })

  if (!permissions.view) {
    throw new Response("Unauthorized", { status: 401 })
  }

  return json({ groupLocation, permissions })
}

export default function LocationDetailsPage() {
  const { groupLocation, permissions } = useLoaderData<typeof loader>()

  return (
    <div>
      <Title>at {groupLocation.location.name}</Title>
      <h3>Lunches</h3>
      <SortableTable
        data={groupLocation.lunches}
        defaultSort={{ label: "Date", key: (row) => row.date }}
        defaultDirection="desc"
        columns={[
          { label: "Date", key: (row) => row.date },
          { label: "Choosen by", key: (row) => row.choosenBy?.name || "-" },
          {
            label: "Avg rating",
            key: (row) => row.scores.reduce((acc, cur) => acc + cur.score, 0) / row.scores.length,
            props: { numeric: true },
          },
        ]}
      >
        {(lunch) => (
          <SortableTable.LinkRow
            to={`/groups/${lunch.groupLocationGroupId}/lunches/${lunch.id}`}
            key={lunch.id}
          >
            <SortableTable.Cell>
              <Link to={`/groups/${lunch.groupLocationGroupId}/lunches/${lunch.id}`}>
                {formatTimeAgo(new Date(lunch.date))}
              </Link>
            </SortableTable.Cell>
            <SortableTable.Cell>{lunch.choosenBy ? lunch.choosenBy.name : "-"}</SortableTable.Cell>
            <SortableTable.Cell numeric>
              {formatNumber(lunch.scores.reduce((acc, cur) => acc + cur.score, 0) / lunch.scores.length)}
            </SortableTable.Cell>
          </SortableTable.LinkRow>
        )}
      </SortableTable>
      {permissions.addLunch && (
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
