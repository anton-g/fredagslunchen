import type { LoaderFunctionArgs } from "@remix-run/node"
import { json } from "@remix-run/node"
import { isRouteErrorResponse, useLoaderData, useRouteError } from "@remix-run/react"
import invariant from "tiny-invariant"

import { getUserId } from "~/auth.server"
import { Link } from "react-router-dom"
import { getGroupLocation } from "~/models/location.server"
import styled from "styled-components"
import { LinkButton } from "~/components/Button"
import { Spacer } from "~/components/Spacer"
import { formatNumber, formatTimeAgo } from "~/utils"
import { getGroupPermissions } from "~/models/group.server"
import { SortableTable } from "~/components/SortableTable"

export const loader = async ({ request, params }: LoaderFunctionArgs) => {
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
        <h2>Location not found</h2>
      </div>
    )
  }

  if (error.status === 401) {
    return (
      <div>
        <h2>Access denied</h2>
        If someone sent you this link, ask them to invite you to their club.
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
