import type { LoaderArgs } from "@remix-run/node"
import { json } from "@remix-run/node"
import { useCatch, useLoaderData, Outlet, Link } from "@remix-run/react"
import invariant from "tiny-invariant"

import { getGroupDetails } from "~/models/group.server"
import { requireUserId } from "~/session.server"
import styled from "styled-components"
import { Spacer } from "~/components/Spacer"
import { checkIsAdmin } from "~/models/user.server"

export const loader = async ({ request, params }: LoaderArgs) => {
  const userId = await requireUserId(request)
  invariant(params.groupId, "groupId not found")

  const details = await getGroupDetails({ userId, id: params.groupId })
  if (!details) {
    throw new Response("Not Found", { status: 404 })
  }

  const isGlobalAdmin = await checkIsAdmin(userId)

  const isMember = details.group.members.some((x) => x.userId === userId)
  if (!isMember && !isGlobalAdmin) {
    throw new Response("Unauthorized", { status: 401 })
  }

  return json({ details })
}

export default function GroupDetailsPage() {
  const { details } = useLoaderData<typeof loader>()

  return (
    <div>
      <Title>
        <Link to={`/groups/${details.group.id}`}>{details.group.name}</Link>
      </Title>
      <Spacer size={8} />
      <Outlet />
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
    return (
      <div>
        <h2>Club not found</h2>
      </div>
    )
  }

  if (caught.status === 401) {
    return (
      <div>
        <h2>Access denied</h2>
        If someone sent you this link, create an account and ask them to add you
        to their club.
      </div>
    )
  }

  throw new Error(`Unexpected caught response with status: ${caught.status}`)
}

const Title = styled.h2`
  font-size: 48px;
  margin: 0;
`
