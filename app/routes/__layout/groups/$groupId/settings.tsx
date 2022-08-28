import type { ActionFunction, LoaderArgs } from "@remix-run/node"
import type { Group } from "~/models/group.server"
import type { User } from "~/models/user.server"
import { json, redirect } from "@remix-run/node"
import { Form, useActionData, useLoaderData } from "@remix-run/react"
import styled from "styled-components"
import invariant from "tiny-invariant"
import { Button } from "~/components/Button"
import { Dialog } from "~/components/Dialog"
import { Input } from "~/components/Input"
import { Spacer } from "~/components/Spacer"
import { Stack } from "~/components/Stack"
import { deleteGroup, getGroup, updateGroup } from "~/models/group.server"

import { requireUserId } from "~/session.server"
import { useEffect, useRef, useState } from "react"

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
    lat?: string
    lon?: string
  }
}

export const action: ActionFunction = async ({ request, params }) => {
  const userId = await requireUserId(request)
  invariant(params.groupId, "groupId not found")

  switch (request.method) {
    case "DELETE":
      return deleteGroupAction(userId, params.groupId)
    default:
      return updateGroupAction(request, params.groupId)
  }
}

const updateGroupAction = async (request: Request, groupId: Group["id"]) => {
  const formData = await request.formData()
  const name = formData.get("name")
  const latInput = formData.get("lat")
  const lonInput = formData.get("lon")

  if (typeof name !== "string" || name.length === 0) {
    return json<ActionData>(
      { errors: { name: "Name is required" } },
      { status: 400 }
    )
  }

  const lat = parseFloat(latInput?.toString().replace(",", ".") || "")
  if (latInput && isNaN(lat)) {
    return json<ActionData>(
      { errors: { lat: "Invalid value" } },
      { status: 400 }
    )
  }

  const lon = parseFloat(lonInput?.toString().replace(",", ".") || "")
  if (lonInput && isNaN(lon)) {
    return json<ActionData>(
      { errors: { lon: "Invalid value" } },
      { status: 400 }
    )
  }

  const group = await updateGroup({
    id: groupId,
    name,
    lat,
    lon,
  })

  return redirect(`/groups/${group.id}`)
}

const deleteGroupAction = async (userId: User["id"], groupId: Group["id"]) => {
  await deleteGroup({
    id: groupId,
    requestedByUserId: userId,
  })

  return redirect("/groups")
}

export default function GroupSettingsPage() {
  const { group } = useLoaderData<typeof loader>()
  const actionData = useActionData() as ActionData
  const nameRef = useRef<HTMLInputElement>(null)
  const latRef = useRef<HTMLInputElement>(null)
  const lonRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
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
        <Subtitle>Group location</Subtitle>
        <FieldDescription>
          Your groups "home base". Setting this will update the center of the
          map.
        </FieldDescription>
        <Stack axis="horizontal" gap={16}>
          <div style={{ width: "100%" }}>
            <label>
              <span>Latitude</span>
              <Input
                ref={latRef}
                name="lat"
                defaultValue={group.lat}
                aria-invalid={actionData?.errors?.lat ? true : undefined}
                aria-errormessage={
                  actionData?.errors?.lat ? "lat-error" : undefined
                }
              />
            </label>
            {actionData?.errors?.lat && (
              <div id="lat-error">{actionData.errors.lat}</div>
            )}
          </div>

          <div style={{ width: "100%" }}>
            <label>
              <span>Longitude</span>
              <Input
                ref={lonRef}
                name="lon"
                defaultValue={group.lon}
                aria-invalid={actionData?.errors?.lon ? true : undefined}
                aria-errormessage={
                  actionData?.errors?.lon ? "lon-error" : undefined
                }
              />
            </label>
            {actionData?.errors?.lon && (
              <div id="lon-error">{actionData.errors.lon}</div>
            )}
          </div>
        </Stack>
        <Spacer size={16} />
        <Button style={{ marginLeft: "auto" }}>Save changes</Button>
      </Form>
      <Subtitle>Destructive actions</Subtitle>
      <DeleteGroupAction groupName={group.name} />
    </div>
  )
}

const FieldDescription = styled.p`
  margin: 0;
`

const Subtitle = styled.h3`
  font-size: 24px;
  margin: 16px 0;

  + ${FieldDescription} {
    margin-top: -16px;
    margin-bottom: 16px;
  }
`

const DeleteGroupAction = ({ groupName }: { groupName: Group["name"] }) => {
  const [confirmNameValue, setConfirmNameValue] = useState("")

  return (
    <Dialog>
      <Dialog.Trigger asChild>
        <Button>Delete group</Button>
      </Dialog.Trigger>
      <Dialog.Content>
        <Dialog.Close />
        <Dialog.Title>
          Are you sure you want to delete the group {groupName}?
        </Dialog.Title>
        <DialogDescription>
          This will delete this group including all locations, lunches and
          scores. This action is <strong>irreversible</strong> and{" "}
          <strong>cannot be undone.</strong>
        </DialogDescription>
        <label htmlFor="name">
          Please type <strong>{groupName}</strong> to confirm.
        </label>
        <Input
          id="name"
          required
          name="name"
          onChange={(e) => setConfirmNameValue(e.target.value)}
        />
        <Spacer size={16} />
        <Form method="delete">
          <Button
            variant="large"
            style={{ marginLeft: "auto" }}
            disabled={confirmNameValue !== groupName}
          >
            I am sure
          </Button>
        </Form>
      </Dialog.Content>
    </Dialog>
  )
}

const DialogDescription = styled(Dialog.Description)`
  > p {
    margin: 0;
    margin-bottom: 16px;
  }
`
