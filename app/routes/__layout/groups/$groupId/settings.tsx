import type { ActionFunction, LoaderArgs } from "@remix-run/node"
import { json, redirect } from "@remix-run/node"
import { Form, useActionData, useLoaderData } from "@remix-run/react"
import * as React from "react"
import styled from "styled-components"
import invariant from "tiny-invariant"
import { Button } from "~/components/Button"
import { Input } from "~/components/Input"
import { Spacer } from "~/components/Spacer"
import { Stack } from "~/components/Stack"
import { getGroup, updateGroup } from "~/models/group.server"

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
    lat?: string
    lon?: string
  }
}

export const action: ActionFunction = async ({ request, params }) => {
  await requireUserId(request)
  const groupId = params.groupId
  invariant(groupId, "groupId not found")

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

export default function GroupSettingsPage() {
  const { group } = useLoaderData<typeof loader>()
  const actionData = useActionData() as ActionData
  const nameRef = React.useRef<HTMLInputElement>(null)
  const latRef = React.useRef<HTMLInputElement>(null)
  const lonRef = React.useRef<HTMLInputElement>(null)

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
