import type { ActionArgs, LoaderArgs } from "@remix-run/node"
import { json, redirect } from "@remix-run/node"
import { Form, Link, useActionData, useLoaderData, useLocation } from "@remix-run/react"
import isSameDay from "date-fns/isSameDay"
import { useRef, useState } from "react"
import invariant from "tiny-invariant"
import { LinkButton, LoadingButton } from "~/components/Button"
import { Card } from "~/components/Card"
import { ComboBox, Description, Item, Label } from "~/components/ComboBox"
import { Input } from "~/components/Input"
import { Stack } from "~/components/Stack"
import { getGroup, getGroupPermissions } from "~/models/group.server"
import z from "zod"
import { createLunch } from "~/models/lunch.server"
import { requireUserId } from "~/session.server"
import { numeric, useUser } from "~/utils"
import { useNavigation } from "@remix-run/react"
import { parse } from "@conform-to/zod"
import { useForm, conform } from "@conform-to/react"

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

const schema = z.object({
  date: z.string().min(1, "Date is required"),
  choosenBy: z.string().min(1, "Choosen by is required"),
  "choosenBy-key": z.string().min(1, "Choosen by is required"),
  location: z.string().min(1, "Location is required"),
  "location-key": numeric(z.coerce.number({ invalid_type_error: "Invalid" })),
})

export const action = async ({ request, params }: ActionArgs) => {
  await requireUserId(request)
  const groupId = params.groupId
  invariant(groupId, "groupId not found")

  const formData = await request.formData()
  const submission = parse(formData, { schema })
  if (!submission.value || submission.intent !== "submit") {
    return json(submission, { status: 400 })
  }

  const { "choosenBy-key": choosenById, date, "location-key": locationId } = submission.value

  const lunch = await createLunch({
    choosenByUserId: choosenById,
    date,
    locationId: locationId.toString(),
    groupId,
  })

  return redirect(`/groups/${groupId}/lunches/${lunch.id}`)
}

export default function NewLunchPage() {
  const { pathname } = useLocation()
  const navigation = useNavigation()
  const user = useUser()
  const defaultDate = new Date().toISOString().split("T")[0]
  const lastSubmission = useActionData<typeof action>()
  const [form, { choosenBy, date, location }] = useForm({
    id: "new-lunch-form",
    lastSubmission,
    onValidate: ({ formData }) => parse(formData, { schema }),
    defaultValue: {
      date: defaultDate,
    },
  })
  const { group, preSelectedLocationId } = useLoaderData<typeof loader>()
  const choosenByRef = useRef<HTMLInputElement>(null!)
  const locationRef = useRef<HTMLInputElement>(null!)
  const dateRef = useRef<HTMLInputElement>(null)

  const [selectedLocation, setSelectedLocation] = useState<number | null>(null)
  const [selectedDate, setSelectedDate] = useState<string | null>(defaultDate)

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
        {...form.props}
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
                {...conform.input(date, { ariaAttributes: true, type: "date" })}
                onChange={(e) => setSelectedDate(e.target.value)}
              />
            </label>
            {date.error && <div id={`${date.id}-error`}>{date.error}</div>}
          </div>

          <div>
            <ComboBox
              label="Choosen by"
              name={choosenBy.name}
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
            {choosenBy.error && <div id={`${choosenBy.id}-error`}>{choosenBy.error}</div>}
          </div>

          <div>
            <ComboBox
              label="Location"
              name={location.name}
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
            {location.error && <div id={`${location.id}-error`}>{location.error}</div>}
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
            <LinkButton to={`/groups/${group.id}/locations/new?redirectTo=${pathname}`}>
              New location
            </LinkButton>
            <LoadingButton
              loading={navigation.state !== "idle" && navigation.formMethod === "POST"}
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
