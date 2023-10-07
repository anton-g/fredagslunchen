import type { ActionFunctionArgs, LoaderFunctionArgs } from "@remix-run/node"
import { json, redirect } from "@remix-run/node"
import { Form, Link, useActionData, useLoaderData, useNavigation, useSearchParams } from "@remix-run/react"
import { useRef, useState } from "react"
import invariant from "tiny-invariant"
import { Button, LoadingButton } from "~/components/Button"
import { ComboBox, Item, Label } from "~/components/ComboBox"
import { Input } from "~/components/Input"
import { Stack } from "~/components/Stack"
import { getGroup, getGroupPermissions } from "~/models/group.server"
import z from "zod"
import { createGroupLocation } from "~/models/location.server"
import { requireUserId } from "~/session.server"
import { optionalNumeric, safeRedirect, useUser } from "~/utils"
import { LocationAutocomplete } from "~/components/LocationAutocomplete"
import type { LocationSuggestion } from "~/services/locationiq.server"
import { parse } from "@conform-to/zod"
import { useForm, conform } from "@conform-to/react"

export const loader = async ({ request, params }: LoaderFunctionArgs) => {
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

  return json({ group, permissions })
}

const schema = z.object({
  osmId: z.string().optional(),
  name: z.string().min(1, "Name is required"),
  address: z.string().min(1, "Address is required"),
  zipCode: z.string().min(1, "Zip code is required"),
  city: z.string().min(1, "City is required"),
  countryCode: z.string().optional(),
  lat: optionalNumeric(),
  lon: optionalNumeric(),
  discoveredBy: z.string().min(1, "Discovered by is required"),
  "discoveredBy-key": z.string().min(1, "Discovered by is required"),
  redirectTo: z.string().optional(),
})

export const action = async ({ request, params }: ActionFunctionArgs) => {
  const currentUserId = await requireUserId(request)
  const groupId = params.groupId
  invariant(groupId, "groupId not found")

  const formData = await request.formData()

  const submission = parse(formData, { schema })
  if (!submission.value || submission.intent !== "submit") {
    return json(submission, { status: 400 })
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
  } = submission.value

  const location = await createGroupLocation({
    groupId,
    name,
    address,
    lat: lat?.toString() ?? null,
    lon: lon?.toString() ?? null,
    city,
    zipCode,
    discoveredById,
    osmId: osmId || null,
    countryCode: countryCode || null,
    global: false,
    requestedByUserId: currentUserId,
  })

  if (!location) {
    return json(
      {
        ...submission,
        error: {
          "": ["Something went wrong"],
        },
      },
      { status: 400 }
    )
  }

  const safeRedirectTo = safeRedirect(
    redirectTo + `?loc=${location.locationId}`,
    `/groups/${groupId}/locations/${location.locationId}`
  )

  return redirect(safeRedirectTo)
}

export default function NewLocationPage() {
  const user = useUser()
  const lastSubmission = useActionData<typeof action>()
  const [form, { osmId, name, address, zipCode, city, countryCode, lat, lon, discoveredBy, redirectTo }] =
    useForm({
      id: "new-location-form",
      lastSubmission,
      onValidate: ({ formData }) => parse(formData, { schema }),
    })
  const { group, permissions } = useLoaderData<typeof loader>()
  const navigation = useNavigation()
  const [searchParams] = useSearchParams()
  const redirectToValue = searchParams.get("redirectTo") ?? undefined
  const nameRef = useRef<HTMLInputElement>(null!)
  const addressRef = useRef<HTMLInputElement>(null)
  const zipCodeRef = useRef<HTMLInputElement>(null)
  const cityRef = useRef<HTMLInputElement>(null)
  const latRef = useRef<HTMLInputElement>(null)
  const lonRef = useRef<HTMLInputElement>(null)
  const idRef = useRef<HTMLInputElement>(null)
  const countryRef = useRef<HTMLInputElement>(null)
  const discoveredByRef = useRef<HTMLInputElement>(null!)

  // TODO this should probably work but some issue with Conform
  const [manualEdit, setManualEdit] = useState(true)
  // useEffect(() => {
  //   if (lastSubmission?.error) {
  //     setManualEdit(true)
  //   }
  // }, [lastSubmission])

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
        {...form.props}
        style={{
          display: "flex",
          flexDirection: "column",
          gap: 8,
          width: "100%",
        }}
      >
        <input type="hidden" {...conform.input(osmId, { hidden: true })} ref={idRef} />
        <input type="hidden" {...conform.input(countryCode, { hidden: true })} ref={countryRef} />
        <input type="hidden" name={redirectTo.name} value={redirectToValue} />
        <Stack gap={16}>
          <div style={{ marginBottom: 16 }}>
            <LocationAutocomplete
              label="Search location"
              onSelect={handleLocationSelect}
              origin={group.lat && group.lon ? { lat: group.lat, lng: group.lon } : undefined}
            />
            {!(group.lat && group.lon) && permissions.settings && (
              <span>
                Update your{" "}
                <Link to={`/groups/${group.id}/settings`} style={{ textDecoration: "underline" }}>
                  club location
                </Link>{" "}
                to get better suggestions.
              </span>
            )}
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
                {...conform.input(name, { ariaAttributes: true })}
              />
            </label>
            {name.error && <div id={`${name.id}-error`}>{name.error}</div>}
          </div>

          <div>
            <label>
              <span>Street address</span>
              <Input
                readOnly={!manualEdit}
                tabIndex={!manualEdit ? -1 : undefined}
                ref={addressRef}
                {...conform.input(address, { ariaAttributes: true })}
              />
            </label>
            {address.error && <div id={`${address.id}-error`}>{address.error}</div>}
          </div>

          <Stack axis="horizontal" gap={16}>
            <div style={{ width: "100%" }}>
              <label>
                <span>Zip code</span>
                <Input
                  readOnly={!manualEdit}
                  tabIndex={!manualEdit ? -1 : undefined}
                  ref={zipCodeRef}
                  {...conform.input(zipCode, { ariaAttributes: true })}
                />
              </label>
              {zipCode.error && <div id={`${zipCode}-error`}>{zipCode.error}</div>}
            </div>

            <div style={{ width: "100%" }}>
              <label>
                <span>City</span>
                <Input
                  readOnly={!manualEdit}
                  tabIndex={!manualEdit ? -1 : undefined}
                  ref={cityRef}
                  {...conform.input(city, { ariaAttributes: true })}
                />
              </label>
              {city.error && <div id={`${city}-error`}>{city.error}</div>}
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
                  onPaste={handleCoordinatePaste}
                  {...conform.input(lat, { ariaAttributes: true })}
                />
              </label>
              {lat.error && <div id={`${lat}-error`}>{lat.error}</div>}
            </div>

            <div style={{ width: "100%" }}>
              <label>
                <span>Longitude</span>
                <Input
                  readOnly={!manualEdit}
                  tabIndex={!manualEdit ? -1 : undefined}
                  ref={lonRef}
                  onPaste={handleCoordinatePaste}
                  {...conform.input(lon, { ariaAttributes: true })}
                />
              </label>
              {lon.error && <div id={`${lon}-error`}>{lon.error}</div>}
            </div>
          </Stack>

          <div>
            <ComboBox
              label="Discovered by"
              name={discoveredBy.name}
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
            {discoveredBy.error && <div id={`${discoveredBy.id}-error`}>{discoveredBy.error}</div>}
          </div>

          <div>
            <LoadingButton loading={navigation.state !== "idle"} style={{ marginLeft: "auto" }} type="submit">
              Save location
            </LoadingButton>
          </div>
        </Stack>
      </Form>
    </>
  )
}
