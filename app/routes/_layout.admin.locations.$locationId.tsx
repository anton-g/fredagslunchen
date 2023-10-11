import { type ActionFunctionArgs, type LoaderFunctionArgs, redirect, json } from "@remix-run/node"
import { Form, useActionData, useLoaderData } from "@remix-run/react"
import { useEffect, useRef } from "react"
import styled from "styled-components"
import invariant from "tiny-invariant"
import { Button } from "~/components/Button"
import { Checkbox } from "~/components/Checkbox"
import { Input } from "~/components/Input"
import { Stack } from "~/components/Stack"
import { getLocation, updateLocation } from "~/models/location.server"
import { requireAdminUserId } from "~/auth.server"

export const loader = async ({ request, params }: LoaderFunctionArgs) => {
  await requireAdminUserId(request)
  invariant(params.locationId, "locationId not found")

  const location = await getLocation({ id: parseInt(params.locationId) })

  return json({ location })
}

type ActionData = {
  errors?: {
    name?: string
    address?: string
    lat?: string
    lon?: string
    city?: string
    zipCode?: string
  }
}

export const action = async ({ request, params }: ActionFunctionArgs) => {
  await requireAdminUserId(request)
  invariant(params.locationId, "locationId not found")

  const formData = await request.formData()
  const name = formData.get("name")
  const address = formData.get("address")
  const zipCode = formData.get("zipCode")
  const city = formData.get("city")
  const lat = formData.get("lat")
  const lon = formData.get("lon")
  const global = formData.get("global")

  if (typeof name !== "string" || name.length === 0) {
    return json<ActionData>({ errors: { name: "Name is required" } }, { status: 400 })
  }

  if (typeof address !== "string" || address.length === 0) {
    return json<ActionData>({ errors: { address: "Street address is required" } }, { status: 400 })
  }

  if (typeof zipCode !== "string" || zipCode.length === 0) {
    return json<ActionData>({ errors: { zipCode: "Zip code is required" } }, { status: 400 })
  }

  if (typeof city !== "string" || city.length === 0) {
    return json<ActionData>({ errors: { city: "City is required" } }, { status: 400 })
  }

  if (typeof lat !== "string" || lat.length === 0) {
    return json<ActionData>({ errors: { lat: "Latitude is required" } }, { status: 400 })
  }

  if (typeof lon !== "string" || lon.length === 0) {
    return json<ActionData>({ errors: { lon: "Longitude is required" } }, { status: 400 })
  }

  const parsedId = parseInt(params.locationId)

  await updateLocation({
    id: parsedId,
    name,
    address,
    lat,
    lon,
    city,
    zipCode,
    global: global === "on",
  })

  return redirect(`/admin/locations/`)
}

export default function AdminLocationDetailsPage() {
  const { location } = useLoaderData<typeof loader>()
  const actionData = useActionData() as ActionData
  const nameRef = useRef<HTMLInputElement>(null!)
  const addressRef = useRef<HTMLInputElement>(null)
  const zipCodeRef = useRef<HTMLInputElement>(null)
  const cityRef = useRef<HTMLInputElement>(null)
  const latRef = useRef<HTMLInputElement>(null)
  const lonRef = useRef<HTMLInputElement>(null)

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
    }
  }, [actionData])

  if (!location) return null

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
    <div>
      <Title>{location.name}</Title>
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
              <span>Name</span>
              <Input
                ref={nameRef}
                name="name"
                defaultValue={location.name}
                aria-invalid={actionData?.errors?.address ? true : undefined}
                aria-errormessage={actionData?.errors?.address ? "address-error" : undefined}
              />
            </label>
            {actionData?.errors?.name && <div id="name-error">{actionData.errors.name}</div>}
          </div>

          <div>
            <label>
              <span>Street address</span>
              <Input
                ref={addressRef}
                name="address"
                defaultValue={location.address}
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
                  ref={zipCodeRef}
                  name="zipCode"
                  defaultValue={location.zipCode}
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
                  ref={cityRef}
                  name="city"
                  defaultValue={location.city}
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
                  ref={latRef}
                  name="lat"
                  onPaste={handleCoordinatePaste}
                  defaultValue={location.lat || ""}
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
                  ref={lonRef}
                  name="lon"
                  onPaste={handleCoordinatePaste}
                  defaultValue={location.lon || ""}
                  aria-invalid={actionData?.errors?.lon ? true : undefined}
                  aria-errormessage={actionData?.errors?.lon ? "lon-error" : undefined}
                />
              </label>
              {actionData?.errors?.lon && <div id="lon-error">{actionData.errors.lon}</div>}
            </div>
          </Stack>

          <div>
            <Stack gap={8} axis="horizontal">
              <Checkbox id="global" name="global" defaultChecked={location.global} />
              <label htmlFor="global">Global</label>
            </Stack>
            {actionData?.errors?.address && <div id="address-error">{actionData.errors.address}</div>}
          </div>

          <div>
            <Button style={{ marginLeft: "auto" }} type="submit">
              Save
            </Button>
          </div>
        </Stack>
      </Form>
    </div>
  )
}

const Title = styled.h4`
  font-size: 36px;
  margin: 0;
  margin-bottom: 24px;
`
