import { CopyIcon, Cross2Icon } from "@radix-ui/react-icons"
import type { ActionFunction, LoaderArgs } from "@remix-run/node"
import { json, redirect } from "@remix-run/node"
import {
  isRouteErrorResponse,
  useActionData,
  useFetcher,
  useLoaderData,
  useRouteError,
} from "@remix-run/react"
import * as React from "react"
import styled from "styled-components"
import invariant from "tiny-invariant"
import { Button, LoadingButton } from "~/components/Button"
import { Input } from "~/components/Input"
import { Stack } from "~/components/Stack"
import { Tooltip } from "~/components/Tooltip"
import { addUserEmailToGroup, getGroup, getGroupPermissions } from "~/models/group.server"

import { requireUserId } from "~/session.server"

export const loader = async ({ request, params }: LoaderArgs) => {
  const userId = await requireUserId(request)
  invariant(params.groupId, "groupId is required")
  const group = await getGroup({
    id: params.groupId,
  })

  if (!group) throw new Response("Not found", { status: 404 })

  const permissions = await getGroupPermissions({
    currentUserId: userId,
    group,
  })

  if (!permissions.invite) throw new Response("Permission denied", { status: 401 })

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
    return json<ActionData>({ errors: { email: "Email is required" } }, { status: 400 })
  }

  const group = await addUserEmailToGroup({ groupId, email })

  if ("error" in group) {
    return json<ActionData>({ errors: { email: group.error } }, { status: 400 })
  }

  return redirect(`/groups/${group.id}`)
}

export default function InvitePage() {
  const fetcher = useFetcher()
  const { groupInviteToken, groupId, userId, baseUrl } = useLoaderData<typeof loader>()
  const actionData = useActionData() as ActionData
  const emailRef = React.useRef<HTMLInputElement>(null)

  React.useEffect(() => {
    if (actionData?.errors?.email) {
      emailRef.current?.focus()
    }
  }, [actionData])

  return (
    <>
      {/* <h3>Add existing user to club</h3>
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
          <InviteDescription>Anyone with the link can join your club.</InviteDescription>
          <Stack gap={16}>
            <Input
              value={`${baseUrl}/join?token=${groupInviteToken}`}
              readOnly
              onFocus={(e) => e.target.select()}
              aria-label="Invite link"
              style={{
                cursor: "text",
              }}
            />
            <Stack gap={8} axis="horizontal" style={{ marginLeft: "auto" }}>
              <fetcher.Form method="post" action="/api/groups/invite-token">
                <input type="hidden" name="action" value={"delete"} />
                <input type="hidden" name="groupId" value={groupId} />
                <input type="hidden" name="userId" value={userId} />
                <Tooltip>
                  <Tooltip.Trigger asChild>
                    <LoadingButton
                      variant="round"
                      aria-label="Remove invite link"
                      loading={fetcher.state !== "idle"}
                    >
                      <Cross2Icon />
                    </LoadingButton>
                  </Tooltip.Trigger>
                  <Tooltip.Content>Remove invite link</Tooltip.Content>
                </Tooltip>
              </fetcher.Form>
              <Tooltip>
                <Tooltip.Trigger asChild>
                  <Button
                    variant="round"
                    onClick={() => {
                      navigator.clipboard.writeText(`${baseUrl}/join?token=${groupInviteToken}`)
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
        <fetcher.Form method="post" action="/api/groups/invite-token">
          <InviteDescription>Create a link that anyone can use to join your club.</InviteDescription>
          <input type="hidden" name="action" value={"create"} />
          <input type="hidden" name="groupId" value={groupId} />
          <input type="hidden" name="userId" value={userId} />
          <LoadingButton loading={fetcher.state !== "idle"}>Create invite link</LoadingButton>
        </fetcher.Form>
      )}
    </>
  )
}

const InviteDescription = styled.p`
  margin: 0;
  margin-bottom: 16px;
`

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
        <h2>Club not found</h2>
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
