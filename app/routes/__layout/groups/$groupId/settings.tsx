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
import { Spacer } from "~/components/Spacer"
import { Stack } from "~/components/Stack"
import { Tooltip } from "~/components/Tooltip"
import {
  addUserEmailToGroup,
  getGroup,
  getGroupInviteToken,
  updateGroup,
} from "~/models/group.server"

import { requireUserId } from "~/session.server"

export const loader = async ({ request, params }: LoaderArgs) => {
  const userId = await requireUserId(request)
  invariant(params.groupId, "groupId is required")
  const group = await getGroup({
    id: params.groupId,
    userId,
  })

  if (!group) return new Response("Not found", { status: 404 })

  return json({
    group,
  })
}

type ActionData = {
  errors?: {
    name?: string
  }
}

export const action: ActionFunction = async ({ request, params }) => {
  await requireUserId(request)
  const groupId = params.groupId
  invariant(groupId, "groupId not found")

  const formData = await request.formData()
  const name = formData.get("name")

  if (typeof name !== "string" || name.length === 0) {
    return json<ActionData>(
      { errors: { name: "Name is required" } },
      { status: 400 }
    )
  }

  const group = await updateGroup({
    id: groupId,
    name,
  })

  return redirect(`/groups/${group.id}`)
}

export default function InvitePage() {
  const { group } = useLoaderData<typeof loader>()
  const actionData = useActionData() as ActionData
  const nameRef = React.useRef<HTMLInputElement>(null)

  React.useEffect(() => {
    if (actionData?.errors?.name) {
      nameRef.current?.focus()
    }
  }, [actionData])

  return (
    <div>
      <Form method="post">
        <div>
          <label htmlFor="name">Name</label>
          <div>
            <Input
              ref={nameRef}
              id="name"
              required
              name="name"
              type="name"
              autoComplete="name"
              defaultValue={group.name}
              aria-invalid={actionData?.errors?.name ? true : undefined}
              aria-describedby="name-error"
            />
            {actionData?.errors?.name && (
              <div id="name-error">{actionData.errors.name}</div>
            )}
          </div>
        </div>
        <Spacer size={16} />
        <Button style={{ marginLeft: "auto" }}>Save changes</Button>
      </Form>
    </div>
  )
}
