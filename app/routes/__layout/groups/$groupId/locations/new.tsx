import type { ActionFunction, LoaderArgs } from "@remix-run/node"
import { json, redirect } from "@remix-run/node"
import { Form, useActionData, useLoaderData, useSearchParams } from "@remix-run/react"
import { useEffect, useRef, useState } from "react"
import invariant from "tiny-invariant"
import { Button } from "~/components/Button"
import { ComboBox, Item, Label } from "~/components/ComboBox"
import { Input } from "~/components/Input"
import { Stack } from "~/components/Stack"
import { getGroup, getGroupPermissions } from "~/models/group.server"
import { zfd } from "zod-form-data"
import z from "zod"
import { createGroupLocation } from "~/models/location.server"
import { requireUserId } from "~/session.server"
import { mapToActualErrors, safeRedirect, useUser } from "~/utils"
import { LocationAutocomplete } from "~/components/LocationAutocomplete"
import { LocationSuggestion } from "~/services/locationiq.server"

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

  if (!permissions.addLocation) {
    throw new Response("Unauthorized", { status: 401 })
  }

  return json({ group })
}

const formSchema = zfd.formData({
  osmId: zfd.text(),
  name: zfd.text(),
  address: zfd.text(),
  zipCode: zfd.text(),
  city: zfd.text(),
  countryCode: zfd.text(),
  lat: zfd.text(z.string().optional()),
  lon: zfd.text(z.string().optional()),
  "discoveredBy-key": zfd.text(),
  redirectTo: zfd.text(z.string().optional()),
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

  const {
    redirectTo,
    osmId,
    name,
    address,
    lat,
    lon,
    city,
    zipCode,
    countryCode,
    "discoveredBy-key": discoveredById,
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
    osmId,
    countryCode,
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
  const { group } = useLoaderData<typeof loader>()
  const [searchParams] = useSearchParams()
  const redirectTo = searchParams.get("redirectTo") ?? undefined
  const nameRef = useRef<HTMLInputElement>(null!)
  const addressRef = useRef<HTMLInputElement>(null)
  const zipCodeRef = useRef<HTMLInputElement>(null)
  const cityRef = useRef<HTMLInputElement>(null)
  const latRef = useRef<HTMLInputElement>(null)
  const lonRef = useRef<HTMLInputElement>(null)
  const idRef = useRef<HTMLInputElement>(null)
  const countryRef = useRef<HTMLInputElement>(null)
  const discoveredByRef = useRef<HTMLInputElement>(null!)
  const [manualEdit, setManualEdit] = useState(false)

  useEffect(() => {
    if (actionData?.errors?.name) {
      nameRef.current?.focus()
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

  const members = group.members.map((x) => ({
    id: x.userId,
    name: x.user.name,
  }))

  const handleLocationSelect = (location: LocationSuggestion) => {
    nameRef.current!.value = location.name ?? ""
    addressRef.current!.value = location.address ?? ""
    zipCodeRef.current!.value = location.zipCode ?? ""
    cityRef.current!.value = location.city ?? ""
    latRef.current!.value = location.lat ?? ""
    lonRef.current!.value = location.lon ?? ""
    countryRef.current!.value = location.countryCode ?? ""
    idRef.current!.value = location.osmId?.toString() ?? ""
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

  const setManualEditing = () => {
    setManualEdit(true)
    nameRef.current.focus()
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
        <input type="hidden" name="osmId" ref={idRef} />
        <input type="hidden" name="countryCode" ref={countryRef} />
        <Stack gap={16}>
          <div style={{ marginBottom: 16 }}>
            <LocationAutocomplete
              label="Search location"
              onSelect={handleLocationSelect}
              origin={group.lat && group.lon ? { lat: group.lat, lng: group.lon } : undefined}
            />
          </div>
          <Button
            style={{ marginLeft: "auto", marginBottom: -28, visibility: manualEdit ? "hidden" : "visible" }}
            onClick={setManualEditing}
            type="button"
          >
            Manual edit
          </Button>
          <div>
            <label>
              <span>Name</span>
              <Input
                readOnly={!manualEdit}
                tabIndex={!manualEdit ? -1 : undefined}
                ref={nameRef}
                name="name"
                required
                aria-invalid={actionData?.errors?.name ? true : undefined}
                aria-errormessage={actionData?.errors?.name ? "name-error" : undefined}
              />
            </label>
            {actionData?.errors?.name && <div id="name-error">{actionData.errors.name}</div>}
          </div>

          <div>
            <label>
              <span>Street address</span>
              <Input
                readOnly={!manualEdit}
                tabIndex={!manualEdit ? -1 : undefined}
                ref={addressRef}
                name="address"
                required
                aria-invalid={actionData?.errors?.address ? true : undefined}
                aria-errormessage={actionData?.errors?.address ? "address-error" : undefined}
              />
            </label>
            {actionData?.errors?.address && <div id="address-error">{actionData.errors.address}</div>}
          </div>

          <Stack axis="horizontal" gap={16}>
            <div style={{ width: "100%" }}>
              <label>
                <span>Zip code</span>
                <Input
                  readOnly={!manualEdit}
                  tabIndex={!manualEdit ? -1 : undefined}
                  ref={zipCodeRef}
                  name="zipCode"
                  required
                  aria-invalid={actionData?.errors?.zipCode ? true : undefined}
                  aria-errormessage={actionData?.errors?.zipCode ? "zip-code-error" : undefined}
                />
              </label>
              {actionData?.errors?.zipCode && <div id="zip-code-error">{actionData.errors.zipCode}</div>}
            </div>

            <div style={{ width: "100%" }}>
              <label>
                <span>City</span>
                <Input
                  readOnly={!manualEdit}
                  tabIndex={!manualEdit ? -1 : undefined}
                  ref={cityRef}
                  name="city"
                  required
                  aria-invalid={actionData?.errors?.city ? true : undefined}
                  aria-errormessage={actionData?.errors?.city ? "city-error" : undefined}
                />
              </label>
              {actionData?.errors?.city && <div id="city-error">{actionData.errors.city}</div>}
            </div>
          </Stack>

          <Stack axis="horizontal" gap={16}>
            <div style={{ width: "100%" }}>
              <label>
                <span>Latitude</span>
                <Input
                  readOnly={!manualEdit}
                  tabIndex={!manualEdit ? -1 : undefined}
                  ref={latRef}
                  name="lat"
                  onPaste={handleCoordinatePaste}
                  aria-invalid={actionData?.errors?.lat ? true : undefined}
                  aria-errormessage={actionData?.errors?.lat ? "lat-error" : undefined}
                />
              </label>
              {actionData?.errors?.lat && <div id="lat-error">{actionData.errors.lat}</div>}
            </div>

            <div style={{ width: "100%" }}>
              <label>
                <span>Longitude</span>
                <Input
                  readOnly={!manualEdit}
                  tabIndex={!manualEdit ? -1 : undefined}
                  ref={lonRef}
                  name="lon"
                  onPaste={handleCoordinatePaste}
                  aria-invalid={actionData?.errors?.lon ? true : undefined}
                  aria-errormessage={actionData?.errors?.lon ? "lon-error" : undefined}
                />
              </label>
              {actionData?.errors?.lon && <div id="lon-error">{actionData.errors.lon}</div>}
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
              <div id="discoveredBy-error">{actionData.errors["discoveredBy-key"]}</div>
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
