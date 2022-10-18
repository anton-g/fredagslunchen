import type { ActionFunction, LoaderArgs } from "@remix-run/node"
import { json, redirect } from "@remix-run/node"
import {
  Form,
  useActionData,
  useLoaderData,
  useSearchParams,
} from "@remix-run/react"
import { useEffect, useRef } from "react"
import invariant from "tiny-invariant"
import { Button } from "~/components/Button"
import { ComboBox, Item, Label } from "~/components/ComboBox"
import { Input } from "~/components/Input"
import { Stack } from "~/components/Stack"
import { getGroup } from "~/models/group.server"
import { zfd } from "zod-form-data"
import z from "zod"
import {
  createGroupLocation,
  getAllLocationsForGroup,
} from "~/models/location.server"
import { requireUserId } from "~/session.server"
import { mapToActualErrors, safeRedirect, useUser } from "~/utils"

export const loader = async ({ request, params }: LoaderArgs) => {
  await requireUserId(request)
  invariant(params.groupId, "groupId not found")

  const group = await getGroup({ id: params.groupId })
  if (!group) {
    throw new Response("Not Found", { status: 404 })
  }

  const locations = await getAllLocationsForGroup({ groupId: params.groupId })

  return json({ group, locations })
}

const formSchema = zfd
  .formData({
    location: zfd.text(),
    "location-key": zfd.numeric(z.number().optional()),
    address: zfd.text(),
    zipCode: zfd.text(),
    city: zfd.text(),
    lat: zfd.text(z.string().optional()),
    lon: zfd.text(z.string().optional()),
    "discoveredBy-key": zfd.text(),
    redirectTo: zfd.text(z.string().optional()),
  })
  .refine((data) => !(data.location && data["location-key"]), {
    message: "Location is required",
    path: ["location"],
  })

type ActionData = {
  errors?: Partial<Record<keyof z.infer<typeof formSchema>, string>>
}

export const action: ActionFunction = async ({ request, params }) => {
  await requireUserId(request)
  const groupId = params.groupId
  invariant(groupId, "groupId not found")

  const result = formSchema.safeParse(await request.formData())

  console.log(result)

  if (!result.success) {
    return json<ActionData>(
      {
        errors: mapToActualErrors<typeof formSchema>(result),
      },
      { status: 400 }
    )
  }

  const {
    redirectTo,
    location: name,
    address,
    lat,
    lon,
    city,
    zipCode,
    "discoveredBy-key": discoveredById,
    "location-key": locationId,
  } = result.data

  const location = await createGroupLocation({
    groupId,
    name,
    address,
    lat: lat ?? null,
    lon: lon ?? null,
    city,
    zipCode,
    discoveredById,
    locationId,
    global: false,
  })

  const safeRedirectTo = safeRedirect(
    redirectTo + `?loc=${location.locationId}`,
    `/groups/${groupId}/locations/${location.locationId}`
  )

  return redirect(safeRedirectTo)
}

export default function NewLocationPage() {
  const user = useUser()
  const actionData = useActionData() as ActionData
  const loaderData = useLoaderData<typeof loader>()
  const [searchParams] = useSearchParams()
  const redirectTo = searchParams.get("redirectTo") ?? undefined
  const locationRef = useRef<HTMLInputElement>(null!)
  const addressRef = useRef<HTMLInputElement>(null)
  const zipCodeRef = useRef<HTMLInputElement>(null)
  const cityRef = useRef<HTMLInputElement>(null)
  const latRef = useRef<HTMLInputElement>(null)
  const lonRef = useRef<HTMLInputElement>(null)
  const discoveredByRef = useRef<HTMLInputElement>(null!)

  useEffect(() => {
    if (actionData?.errors?.location) {
      locationRef.current?.focus()
    } else if (actionData?.errors?.address) {
      addressRef.current?.focus()
    } else if (actionData?.errors?.zipCode) {
      zipCodeRef.current?.focus()
    } else if (actionData?.errors?.city) {
      cityRef.current?.focus()
    } else if (actionData?.errors?.lat) {
      latRef.current?.focus()
    } else if (actionData?.errors?.lon) {
      lonRef.current?.focus()
    } else if (actionData?.errors?.["discoveredBy-key"]) {
      discoveredByRef.current?.focus()
    }
  }, [actionData])

  const locations = loaderData.locations.filter(
    (l) => !loaderData.group.groupLocations.find((gl) => gl.locationId === l.id)
  )

  const members = loaderData.group.members.map((x) => ({
    id: x.userId,
    name: x.user.name,
  }))

  const handleLocationSelect = (key: any) => {
    const selectedLocation = locations.find((x) => x.id === key)
    if (!selectedLocation) return

    addressRef.current!.value = selectedLocation.address
    zipCodeRef.current!.value = selectedLocation.zipCode
    cityRef.current!.value = selectedLocation.city
    latRef.current!.value = selectedLocation.lat || ""
    lonRef.current!.value = selectedLocation.lon || ""
  }

  const handleCoordinatePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    const value = e.clipboardData.getData("Text")

    if (!value || value.indexOf(",") === -1) return

    const [lat, lon] = value.split(",")

    requestAnimationFrame(() => {
      latRef.current!.value = lat
      lonRef.current!.value = lon
    })
  }

  return (
    <>
      <h3>New location</h3>
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
            <ComboBox
              label="Name"
              name="location"
              defaultItems={locations}
              defaultSelectedKey={user.id}
              inputRef={locationRef}
              allowsCustomValue={true}
              menuTrigger="focus"
              onSelectionChange={handleLocationSelect}
            >
              {(item) => (
                <Item textValue={item.name}>
                  <div>
                    <Label>{item.name}</Label>
                  </div>
                </Item>
              )}
            </ComboBox>
            {actionData?.errors?.location && (
              <div id="name-error">{actionData.errors.location}</div>
            )}
          </div>

          <div>
            <label>
              <span>Street address</span>
              <Input
                ref={addressRef}
                name="address"
                required
                aria-invalid={actionData?.errors?.address ? true : undefined}
                aria-errormessage={
                  actionData?.errors?.address ? "address-error" : undefined
                }
              />
            </label>
            {actionData?.errors?.address && (
              <div id="address-error">{actionData.errors.address}</div>
            )}
          </div>

          <Stack axis="horizontal" gap={16}>
            <div style={{ width: "100%" }}>
              <label>
                <span>Zip code</span>
                <Input
                  ref={zipCodeRef}
                  name="zipCode"
                  required
                  aria-invalid={actionData?.errors?.zipCode ? true : undefined}
                  aria-errormessage={
                    actionData?.errors?.zipCode ? "zip-code-error" : undefined
                  }
                />
              </label>
              {actionData?.errors?.zipCode && (
                <div id="zip-code-error">{actionData.errors.zipCode}</div>
              )}
            </div>

            <div style={{ width: "100%" }}>
              <label>
                <span>City</span>
                <Input
                  ref={cityRef}
                  name="city"
                  required
                  aria-invalid={actionData?.errors?.city ? true : undefined}
                  aria-errormessage={
                    actionData?.errors?.city ? "city-error" : undefined
                  }
                />
              </label>
              {actionData?.errors?.city && (
                <div id="city-error">{actionData.errors.city}</div>
              )}
            </div>
          </Stack>

          <Stack axis="horizontal" gap={16}>
            <div style={{ width: "100%" }}>
              <label>
                <span>Latitude</span>
                <Input
                  ref={latRef}
                  name="lat"
                  onPaste={handleCoordinatePaste}
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
                  onPaste={handleCoordinatePaste}
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

          <div>
            <ComboBox
              label="Discovered by"
              name="discoveredBy"
              defaultItems={members}
              defaultSelectedKey={user.id}
              inputRef={discoveredByRef}
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
            {actionData?.errors?.["discoveredBy-key"] && (
              <div id="discoveredBy-error">
                {actionData.errors["discoveredBy-key"]}
              </div>
            )}
          </div>

          <input type="hidden" name="redirectTo" value={redirectTo} />
          <div>
            <Button style={{ marginLeft: "auto" }} type="submit">
              Save
            </Button>
          </div>
        </Stack>
      </Form>
    </>
  )
}
