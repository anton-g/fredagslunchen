import type { ActionFunction, LoaderArgs } from "@remix-run/node"
import { json, redirect } from "@remix-run/node"
import { Form, Link, useActionData, useLoaderData, useLocation } from "@remix-run/react"
import isSameDay from "date-fns/isSameDay"
import { useEffect, useRef, useState } from "react"
import invariant from "tiny-invariant"
import { LinkButton, LoadingButton } from "~/components/Button"
import { Card } from "~/components/Card"
import { ComboBox, Description, Item, Label } from "~/components/ComboBox"
import { Input } from "~/components/Input"
import { Stack } from "~/components/Stack"
import { getGroup, getGroupPermissions } from "~/models/group.server"
import { zfd } from "zod-form-data"
import type z from "zod"
import { createLunch } from "~/models/lunch.server"
import { requireUserId } from "~/session.server"
import { mapToActualErrors, useUser } from "~/utils"
import { useNavigation } from "@remix-run/react"

export const loader = async ({ request, params }: LoaderArgs) => {
  const userId = await requireUserId(request)
  invariant(params.groupId, "groupId not found")

  const group = await getGroup({ id: params.groupId })
  if (!group) {
    throw new Response("Not Found", { status: 404 })
  }

  const permissions = await getGroupPermissions({
    currentUserId: userId,
    group,
  })

  if (!permissions.addLunch) {
    throw new Response("Unauthorized", { status: 401 })
  }

  const url = new URL(request.url)
  const preSelectedLocationId = url.searchParams.get("loc")

  return json({
    group,
    preSelectedLocationId: preSelectedLocationId ?? undefined,
  })
}

const formSchema = zfd.formData({
  date: zfd.text(),
  "choosenBy-key": zfd.text(),
  "location-key": zfd.numeric(),
})

type ActionData = {
  errors?: Partial<Record<keyof z.infer<typeof formSchema>, string>>
}

export const action: ActionFunction = async ({ request, params }) => {
  await requireUserId(request)
  const groupId = params.groupId
  invariant(groupId, "groupId not found")

  const result = formSchema.safeParse(await request.formData())

  if (!result.success) {
    return json<ActionData>(
      {
        errors: mapToActualErrors<typeof formSchema>(result),
      },
      { status: 400 }
    )
  }

  const { "choosenBy-key": choosenById, date, "location-key": locationId } = result.data

  const lunch = await createLunch({
    choosenByUserId: choosenById,
    date,
    locationId,
    groupId,
  })

  return redirect(`/groups/${groupId}/lunches/${lunch.id}`)
}

export default function NewLunchPage() {
  const location = useLocation()
  const navigation = useNavigation()
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
    } else if (actionData?.errors?.["choosenBy-key"]) {
      choosenByRef.current?.focus()
    } else if (actionData?.errors?.["location-key"]) {
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
          ?.lunches.find((x) => isSameDay(new Date(x.date), new Date(selectedDate)))
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
                // required
                onChange={(e) => setSelectedDate(e.target.value)}
                aria-invalid={actionData?.errors?.date ? true : undefined}
                aria-errormessage={actionData?.errors?.date ? "date-error" : undefined}
              />
            </label>
            {actionData?.errors?.date && <div id="date-error">{actionData.errors.date}</div>}
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
            {actionData?.errors?.["choosenBy-key"] && (
              <div id="choosenBy-error">{actionData.errors?.["choosenBy-key"]}</div>
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
              defaultSelectedKey={preSelectedLocationId ? parseInt(preSelectedLocationId) : undefined}
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
            {actionData?.errors?.["location-key"] && (
              <div id="location-error">{actionData.errors?.["location-key"]}</div>
            )}
          </div>

          {existingLunch && (
            <Card>
              There already exists a lunch for this day at{" "}
              {locations.find((x) => x.id === selectedLocation)?.name}, do you want to{" "}
              <Link
                to={`/groups/${group.id}/lunches/${existingLunch.id}`}
                style={{ textDecoration: "underline" }}
              >
                add a score to the existing lunch instead?
              </Link>
            </Card>
          )}

          <Stack gap={16} axis="horizontal">
            <LinkButton to={`/groups/${group.id}/locations/new?redirectTo=${location.pathname}`}>
              New location
            </LinkButton>
            <LoadingButton
              loading={navigation.state !== "idle" && navigation.formMethod === "post"}
              style={{ marginLeft: "auto" }}
              type="submit"
            >
              Save lunch
            </LoadingButton>
          </Stack>
        </Stack>
      </Form>
    </>
  )
}
