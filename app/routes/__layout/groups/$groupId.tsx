import type { LoaderArgs, MetaFunction } from "@remix-run/node"
import { json } from "@remix-run/node"
import { useCatch, useLoaderData, Outlet, Link } from "@remix-run/react"
import invariant from "tiny-invariant"

import { getGroupDetails } from "~/models/group.server"
import { getUserId, requireUserId } from "~/session.server"
import styled from "styled-components"
import { Spacer } from "~/components/Spacer"
import { checkIsAdmin } from "~/models/user.server"
import { LinkButton } from "~/components/Button"

export const meta: MetaFunction = ({ data }) => {
  return {
    "og:image": `https://res.cloudinary.com/anton-g/image/upload/w_1280,h_699/c_fit,l_text:Roboto_150_bold:${data.details.group.name},w_1100/fl_layer_apply,g_north_west,y_90,x_75/c_fit,l_text:Roboto_90_bold:${data.details.stats.averageScore},w_1100/fl_layer_apply,g_south_east,y_95,x_150/c_fit,l_text:Roboto_35_bold:avg,w_1100/fl_layer_apply,g_south_east,y_95,x_90/c_fit,l_text:Roboto_28_bold:fredagslunchen.club,w_1100/fl_layer_apply,g_south_west,y_60,x_65/template_ns4drh.png`,
  }
}

export const loader = async ({ request, params }: LoaderArgs) => {
  let userId = await getUserId(request)
  invariant(params.groupId, "groupId not found")

  const details = await getGroupDetails({ id: params.groupId })
  if (!details) {
    throw new Response("Not Found", { status: 404 })
  }

  const isPublicGroup = details.group.public
  if (!isPublicGroup) {
    userId = await requireUserId(request)
  }

  const isGlobalAdmin = userId ? await checkIsAdmin(userId) : false
  const isMember = details.group.members.some((x) => x.userId === userId)

  if (!isMember && !isGlobalAdmin && !isPublicGroup) {
    throw new Response("Unauthorized", { status: 401 })
  }

  return json({ details, isMember, isPublicGroup })
}

export default function GroupDetailsPage() {
  const { details, isMember, isPublicGroup } = useLoaderData<typeof loader>()

  return (
    <div>
      <Title>
        <Link to={`/groups/${details.group.id}`}>{details.group.name}</Link>
      </Title>
      <Spacer size={8} />
      <Outlet />
      {!isMember && isPublicGroup && (
        <>
          <Spacer size={56} />
          <LinkButton
            to="/join"
            size="huge"
            variant="inverted"
            style={{ margin: "0 auto" }}
          >
            Join Fredagslunchen
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
