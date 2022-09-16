import { redirect } from "@remix-run/server-runtime"
import type { ActionFunction, LoaderArgs } from "@remix-run/server-runtime"
import { useLoaderData, Link, Form } from "@remix-run/react"
import { json } from "@remix-run/server-runtime"
import styled from "styled-components"
import { Spacer } from "~/components/Spacer"
import { getFullUserById, mergeUsers } from "~/models/user.server"
import { requireUserId } from "~/session.server"
import invariant from "tiny-invariant"
import { Button } from "~/components/Button"

export const loader = async ({ request, params }: LoaderArgs) => {
  const currentUserId = await requireUserId(request)
  invariant(params.userId, "userId not found")

  const user = await getFullUserById({
    id: params.userId,
    requestUserId: currentUserId,
  })

  if (!user) {
    throw new Response("Not Found", { status: 404 })
  }

  const isInSameGroup = user.groups.some((g) =>
    g.group.members.some((m) => m.userId === currentUserId)
  )

  if (!isInSameGroup) {
    throw new Response("Not Found", { status: 404 })
  }

  return json({ user })
}

export const action: ActionFunction = async ({ request, params }) => {
  const currentUserId = await requireUserId(request)
  const userId = params.userId
  invariant(userId, "userId not found")

  await mergeUsers(userId, currentUserId)

  return redirect(`/users/${currentUserId}`)
}

export default function Index() {
  const { user } = useLoaderData<typeof loader>()

  return (
    <Wrapper>
      <Title>
        Claim <Link to={`/users/${user.id}`}>{user.name}</Link>
      </Title>
      <Spacer size={16} />
      <Description>
        <p>Are you sure you want to claim anonymous user {user.name}s data?</p>
        <p>
          Claiming this users data will move all their lunches and scores to
          your account and delete {user.name}. If any conflict occurs (eg you
          have scored the same lunch), your data will persist and {user.name}s
          will be deleted.
        </p>
        {/* TODO: show overlapping data here */}
        <p>
          This action <strong>cannot be undone</strong>!
        </p>
      </Description>
      <Form method="post">
        <Button size="large" style={{ marginLeft: "auto" }}>
          I'm really, really sure
        </Button>
      </Form>
    </Wrapper>
  )
}

const Wrapper = styled.div`
  display: flex;
  flex-direction: column;
`

const Title = styled.h2`
  font-size: 48px;
  margin: 0;
`

const Description = styled.div`
  > p {
    margin: 0;
    margin-bottom: 8px;

    &:first-child {
      font-weight: bold;
    }
  }
`
