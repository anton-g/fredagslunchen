import { ArrowDownIcon } from "@radix-ui/react-icons"
import type { ActionFunction, LoaderArgs } from "@remix-run/node"
import { redirect } from "@remix-run/node"
import { json } from "@remix-run/node"
import { Form, useActionData, useLoaderData } from "@remix-run/react"
import { useRef } from "react"
import styled from "styled-components"
import { Button } from "~/components/Button"
import { ComboBox, Item, Label } from "~/components/ComboBox"
import { Stack } from "~/components/Stack"
import { getAllLocations, mergeLocations } from "~/models/location.server"
import { checkIsAdmin } from "~/models/user.server"
import { requireUserId } from "~/session.server"

export const loader = async ({ request }: LoaderArgs) => {
  await requireUserId(request)

  const locations = await getAllLocations()

  return json({ locations })
}

type ActionData = {
  errors?: {
    locationFrom?: string
    locationTo?: string
  }
}

export const action: ActionFunction = async ({ request }) => {
  const userId = await requireUserId(request, "/")
  const isAdmin = checkIsAdmin(userId)

  if (!isAdmin) return redirect("/")

  const formData = await request.formData()
  const locationFromId = formData.get("locationFrom-key")
  const locationToId = formData.get("locationTo-key")

  if (typeof locationFromId !== "string" || locationFromId.length === 0) {
    return json<ActionData>({
      errors: {
        locationFrom: "Location is required",
      },
    })
  }

  if (typeof locationToId !== "string" || locationToId.length === 0) {
    return json<ActionData>({
      errors: {
        locationTo: "Location is required",
      },
    })
  }

  await mergeLocations({
    locationFromId: parseInt(locationFromId),
    locationToId: parseInt(locationToId),
  })

  return redirect("/admin/locations")
}

export default function AdminLocationsMergePage() {
  const { locations } = useLoaderData<typeof loader>()
  const actionData = useActionData<ActionData>()
  const locationRef = useRef<HTMLInputElement>(null!)

  return (
    <Form method="post">
      <Title>Merge</Title>
      <Stack gap={16}>
        <div>
          <ComboBox
            label="Duplicate location"
            name="locationFrom"
            defaultItems={locations}
            inputRef={locationRef}
            menuTrigger="focus"
          >
            {(item) => (
              <Item textValue={item.name}>
                <div>
                  <Label>{item.name}</Label>
                  <Label>{item.address}</Label>
                </div>
              </Item>
            )}
          </ComboBox>
          {actionData?.errors?.locationFrom && (
            <div id="locationFrom-error">{actionData.errors.locationFrom}</div>
          )}
        </div>
        <ArrowDownIcon style={{ margin: "0 auto" }} width={24} height={24} />
        <div>
          <ComboBox
            label="Target location"
            name="locationTo"
            defaultItems={locations}
            inputRef={locationRef}
            menuTrigger="focus"
          >
            {(item) => (
              <Item textValue={item.name}>
                <div>
                  <Label>{item.name}</Label>
                  <Label>{item.address}</Label>
                </div>
              </Item>
            )}
          </ComboBox>
          {actionData?.errors?.locationTo && <div id="locationTo-error">{actionData.errors.locationTo}</div>}
        </div>
        <Button style={{ marginLeft: "auto" }}>Submit</Button>
      </Stack>
    </Form>
  )
}

const Title = styled.h3`
  margin-top: 0;
`
