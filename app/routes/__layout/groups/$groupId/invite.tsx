import { CopyIcon, Cross2Icon, UpdateIcon } from "@radix-ui/react-icons"
import type { ActionFunction, LoaderArgs } from "@remix-run/node"
import { json, redirect } from "@remix-run/node"
import {
  Form,
  useActionData,
  useCatch,
  useFetcher,
  useLoaderData,
} from "@remix-run/react"
import * as React from "react"
import styled from "styled-components"
import invariant from "tiny-invariant"
import { Button } from "~/components/Button"
import { Input } from "~/components/Input"
import { Stack } from "~/components/Stack"
import { Tooltip } from "~/components/Tooltip"
import { addUserEmailToGroup, getGroupInviteToken } from "~/models/group.server"

import { requireUserId } from "~/session.server"

export const loader = async ({ request, params }: LoaderArgs) => {
  const userId = await requireUserId(request)
  invariant(params.groupId, "groupId is required")
  const group = await getGroupInviteToken({
    groupId: params.groupId,
    userId,
  })

  if (!group) return new Response("Not found", { status: 404 })

  const { origin } = new URL(request.url)

  return json({
    groupInviteToken: group.inviteToken,
    groupId: params.groupId,
    userId,
    baseUrl: origin,
  })
}

type ActionData = {
  errors?: {
    email?: string
  }
}

export const action: ActionFunction = async ({ request, params }) => {
  await requireUserId(request)
  const groupId = params.groupId
  invariant(groupId, "groupId not found")

  const formData = await request.formData()
  const email = formData.get("email")

  if (typeof email !== "string" || email.length === 0) {
    return json<ActionData>(
      { errors: { email: "Email is required" } },
      { status: 400 }
    )
  }

  const group = await addUserEmailToGroup({ groupId, email })

  if ("error" in group) {
    return json<ActionData>({ errors: { email: group.error } }, { status: 400 })
  }

  return redirect(`/groups/${group.id}`)
}

export default function InvitePage() {
  const fetcher = useFetcher()
  const { groupInviteToken, groupId, userId, baseUrl } =
    useLoaderData<typeof loader>()
  const actionData = useActionData() as ActionData
  const emailRef = React.useRef<HTMLInputElement>(null)

  React.useEffect(() => {
    if (actionData?.errors?.email) {
      emailRef.current?.focus()
    }
  }, [actionData])

  return (
    <>
      {/* <h3>Add existing user to group</h3>
      <Form
        method="post"
        style={{
          display: "flex",
          flexDirection: "column",
          gap: 8,
          width: "100%",
        }}
      >
        <Stack gap={16}>
          <div>
            <label>
              <span>Email</span>
              <Input
                ref={emailRef}
                name="email"
                type="email"
                aria-invalid={actionData?.errors?.email ? true : undefined}
                aria-errormessage={
                  actionData?.errors?.email ? "email-error" : undefined
                }
              />
            </label>
            {actionData?.errors?.email && (
              <div id="email-error">{actionData.errors.email}</div>
            )}
          </div>

          <div>
            <Button style={{ marginLeft: "auto" }} type="submit">
              Add
            </Button>
          </div>
        </Stack>
      </Form> */}
      <h3 style={{ marginBottom: 0 }}>Invite with link</h3>
      {groupInviteToken ? (
        <>
          <InviteDescription>
            Anyone with the link can join your group.
          </InviteDescription>
          <Stack gap={16}>
            <Input
              value={`${baseUrl}/join?token=${groupInviteToken}`}
              onFocus={(e) => e.target.select()}
              aria-label="Invite link"
            />
            <Stack gap={8} axis="horizontal" style={{ marginLeft: "auto" }}>
              <fetcher.Form method="delete" action="/groups/api/invite-token">
                <input type="hidden" name="groupId" value={groupId} />
                <input type="hidden" name="userId" value={userId} />
                <Tooltip>
                  <Tooltip.Trigger asChild>
                    <Button variant="round" aria-label="Remove invite link">
                      <Cross2Icon />
                    </Button>
                  </Tooltip.Trigger>
                  <Tooltip.Content>Remove invite link</Tooltip.Content>
                </Tooltip>
              </fetcher.Form>
              <Tooltip>
                <Tooltip.Trigger asChild>
                  <Button
                    variant="round"
                    onClick={() => {
                      navigator.clipboard.writeText(
                        `${baseUrl}/join?token=${groupInviteToken}`
                      )
                    }}
                  >
                    <CopyIcon />
                  </Button>
                </Tooltip.Trigger>
                <Tooltip.Content>Copy invite link</Tooltip.Content>
              </Tooltip>
            </Stack>
          </Stack>
        </>
      ) : (
        <fetcher.Form method="post" action="/groups/api/invite-token">
          <InviteDescription>
            Create a link that anyone can use to join your group.
          </InviteDescription>
          <input type="hidden" name="groupId" value={groupId} />
          <input type="hidden" name="userId" value={userId} />
          <Button>Create invite link</Button>
        </fetcher.Form>
      )}
    </>
  )
}

const InviteDescription = styled.p`
  margin: 0;
  margin-bottom: 16px;
`

export function CatchBoundary() {
  const caught = useCatch()

  if (caught.status === 404) {
    return <div>Group not found</div>
  }

  throw new Error(`Unexpected caught response with status: ${caught.status}`)
}

export function ErrorBoundary({ error }: { error: Error }) {
  console.error(error)

  return <div>An unexpected error occurred: {error.message}</div>
}
