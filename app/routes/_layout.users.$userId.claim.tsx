import { redirect, json, type ActionFunctionArgs, type LoaderFunctionArgs } from "@remix-run/server-runtime"
import { useLoaderData, Link, Form } from "@remix-run/react"
import styled from "styled-components"
import { Spacer } from "~/components/Spacer"
import { getFullUserById, mergeUsers } from "~/models/user.server"
import { requireUserId } from "~/auth.server"
import invariant from "tiny-invariant"
import { Button } from "~/components/Button"
import { Dialog } from "~/components/Dialog"
import { Input } from "~/components/Input"
import { useState } from "react"

export const loader = async ({ request, params }: LoaderFunctionArgs) => {
  const currentUserId = await requireUserId(request)
  invariant(params.userId, "userId not found")

  const user = await getFullUserById({
    id: params.userId,
    requestUserId: currentUserId,
  })

  if (!user) {
    throw new Response("Not Found", { status: 404 })
  }

  const isInSameGroup = user.groups.some((g) => g.group.members.some((m) => m.userId === currentUserId))

  if (!isInSameGroup) {
    throw new Response("Not Found", { status: 404 })
  }

  return json({ user })
}

export const action = async ({ request, params }: ActionFunctionArgs) => {
  const currentUserId = await requireUserId(request)
  const userId = params.userId
  invariant(userId, "userId not found")

  await mergeUsers(userId, currentUserId)

  return redirect(`/users/${currentUserId}`)
}

export default function Index() {
  const { user } = useLoaderData<typeof loader>()
  const [confirmNameValue, setConfirmNameValue] = useState("")

  return (
    <Wrapper>
      <Title>
        Claim <Link to={`/users/${user.id}`}>{user.name}</Link>
      </Title>
      <Spacer size={16} />
      <Description>
        <p>Are you sure you want to claim anonymous user {user.name}s data?</p>
        <p>
          Claiming this users data will move all their lunches and scores to your account and delete{" "}
          {user.name}. If any conflict occurs (eg you have scored the same lunch), your data will persist and{" "}
          {user.name}s will be deleted.
        </p>
        {/* TODO: show overlapping data here */}
        <p>
          This action <strong>cannot be undone</strong>!
        </p>
      </Description>
      <Dialog>
        <Dialog.Trigger asChild>
          <Button size="huge" style={{ margin: "24px auto" }} variant="inverted">
            I'm sure
          </Button>
        </Dialog.Trigger>
        <Dialog.Content>
          <Dialog.Close />
          <Dialog.Title>Are you sure you want to claim the user {user.name}?</Dialog.Title>
          <DialogDescription>
            <p>This will delete {user.name} and move all their lunches and scores to your account.</p>
            <p>
              This action <strong>cannot be undone.</strong>
            </p>
          </DialogDescription>
          <label htmlFor="name">
            Please type <strong>{user.name}</strong> to confirm.
          </label>
          <Input id="name" required name="name" onChange={(e) => setConfirmNameValue(e.target.value)} />
          <Spacer size={16} />
          <Form method="post">
            <Button size="large" style={{ marginLeft: "auto" }} disabled={confirmNameValue !== user.name}>
              I am really, really sure
            </Button>
          </Form>
        </Dialog.Content>
      </Dialog>
    </Wrapper>
  )
}
const DialogDescription = styled(Dialog.Description)`
  > p {
    margin: 0;
    margin-bottom: 16px;
  }
`

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
