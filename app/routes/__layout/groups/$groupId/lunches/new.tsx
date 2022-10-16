import type { ActionFunction, LoaderArgs } from "@remix-run/node"
import { json, redirect } from "@remix-run/node"
import {
  Form,
  Link,
  useActionData,
  useLoaderData,
  useLocation,
} from "@remix-run/react"
import isSameDay from "date-fns/isSameDay"
import { useEffect, useRef, useState } from "react"
import invariant from "tiny-invariant"
import { Button, LinkButton } from "~/components/Button"
import { Card } from "~/components/Card"
import { ComboBox, Description, Item, Label } from "~/components/ComboBox"
import { Input } from "~/components/Input"
import { Stack } from "~/components/Stack"
import { getGroup } from "~/models/group.server"

import { createLunch } from "~/models/lunch.server"
import { requireUserId } from "~/session.server"
import { useUser } from "~/utils"

export const loader = async ({ request, params }: LoaderArgs) => {
  await requireUserId(request)
  invariant(params.groupId, "groupId not found")

  const group = await getGroup({ id: params.groupId })
  if (!group) {
    throw new Response("Not Found", { status: 404 })
  }

  const url = new URL(request.url)
  const preSelectedLocationId = url.searchParams.get("loc")

  return json({
    group,
    preSelectedLocationId: preSelectedLocationId ?? undefined,
  })
}

type ActionData = {
  errors?: {
    date?: string
    choosenById?: string
    locationId?: string
  }
}

export const action: ActionFunction = async ({ request, params }) => {
  await requireUserId(request)

  const formData = await request.formData()
  const date = formData.get("date")
  const locationId = formData.get("location-key")
  const choosenById = formData.get("choosenBy-key")
  const groupId = params.groupId
  invariant(groupId, "groupId not found")

  if (typeof date !== "string" || date.length === 0) {
    return json<ActionData>(
      { errors: { date: "Date is required" } },
      { status: 400 }
    )
  }

  if (typeof choosenById !== "string" || choosenById.length === 0) {
    return json<ActionData>(
      { errors: { choosenById: "Choosen by is required" } },
      { status: 400 }
    )
  }

  if (typeof locationId !== "string" || locationId.length === 0) {
    return json<ActionData>(
      { errors: { locationId: "Location is required" } },
      { status: 400 }
    )
  }

  const lunch = await createLunch({
    choosenByUserId: choosenById,
    date: date,
    locationId: parseInt(locationId),
    groupId,
  })

  return redirect(`/groups/${groupId}/lunches/${lunch.id}`)
}

export default function NewLunchPage() {
  const location = useLocation()
  const user = useUser()
  const actionData = useActionData() as ActionData
  const { group, preSelectedLocationId } = useLoaderData<typeof loader>()
  const choosenByRef = useRef<HTMLInputElement>(null!)
  const locationRef = useRef<HTMLInputElement>(null!)
  const dateRef = useRef<HTMLInputElement>(null)

  const defaultDate = new Date().toISOString().split("T")[0]

  const [selectedLocation, setSelectedLocation] = useState<number | null>(null)
  const [selectedDate, setSelectedDate] = useState<string | null>(defaultDate)

  useEffect(() => {
    if (actionData?.errors?.date) {
      dateRef.current?.focus()
    } else if (actionData?.errors?.choosenById) {
      choosenByRef.current?.focus()
    } else if (actionData?.errors?.locationId) {
      locationRef.current?.focus()
    }
  }, [actionData])

  const locations = group.groupLocations.map((x) => ({
    id: x.locationId,
    name: x.location.name,
    description: x.location.address,
  }))

  const members = group.members.map((member) => ({
    id: member.userId,
    name: member.user.name,
  }))

  const existingLunch =
    selectedLocation && selectedDate
      ? group.groupLocations
          .find((x) => x.locationId === selectedLocation)
          ?.lunches.find((x) =>
            isSameDay(new Date(x.date), new Date(selectedDate))
          )
      : null

  return (
    <>
      <h3>New lunch</h3>
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
              <span>Date</span>
              <Input
                ref={dateRef}
                defaultValue={defaultDate}
                name="date"
                type="date"
                required
                onChange={(e) => setSelectedDate(e.target.value)}
                aria-invalid={actionData?.errors?.date ? true : undefined}
                aria-errormessage={
                  actionData?.errors?.date ? "date-error" : undefined
                }
              />
            </label>
            {actionData?.errors?.date && (
              <div id="date-error">{actionData.errors.date}</div>
            )}
          </div>

          <div>
            <ComboBox
              label="Choosen by"
              name="choosenBy"
              defaultItems={members}
              defaultSelectedKey={user.id}
              inputRef={choosenByRef}
              menuTrigger="focus"
            >
              {(item) => (
                <Item textValue={item.name}>
                  <div>
                    <Label>{item.name}</Label>
                  </div>
                </Item>
              )}
            </ComboBox>
            {actionData?.errors?.choosenById && (
              <div id="choosenBy-error">{actionData.errors.choosenById}</div>
            )}
          </div>

          <div>
            <ComboBox
              label="Location"
              name="location"
              defaultItems={locations}
              inputRef={locationRef}
              menuTrigger="focus"
              onSelectionChange={(key) => {
                if (!key) return

                setSelectedLocation(parseInt(key.toString()))
              }}
              defaultSelectedKey={
                preSelectedLocationId
                  ? parseInt(preSelectedLocationId)
                  : undefined
              }
            >
              {(item) => (
                <Item textValue={item.name}>
                  <div>
                    <Label>{item.name}</Label>
                    <Description>{item.description}</Description>
                  </div>
                </Item>
              )}
            </ComboBox>
            {actionData?.errors?.locationId && (
              <div id="location-error">{actionData.errors.locationId}</div>
            )}
          </div>

          {existingLunch && (
            <Card>
              There already exists a lunch for this day at{" "}
              {locations.find((x) => x.id === selectedLocation)?.name}, do you
              want to{" "}
              <Link
                to={`/groups/${group.id}/lunches/${existingLunch.id}`}
                style={{ textDecoration: "underline" }}
              >
                add a score to the existing lunch instead?
              </Link>
            </Card>
          )}

          <Stack gap={16} axis="horizontal">
            <LinkButton
              to={`/groups/${group.id}/locations/new?redirectTo=${location.pathname}`}
            >
              New location
            </LinkButton>
            <Button style={{ marginLeft: "auto" }} type="submit">
              Save
            </Button>
          </Stack>
        </Stack>
      </Form>
    </>
  )
}
