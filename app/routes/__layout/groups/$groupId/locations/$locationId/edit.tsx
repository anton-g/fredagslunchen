import type { LoaderArgs } from "@remix-run/node"
import { json } from "@remix-run/node"
import { Form, useActionData, useCatch, useLoaderData } from "@remix-run/react"
import invariant from "tiny-invariant"

import { getUserId, requireUserId } from "~/session.server"
import { Link } from "react-router-dom"
import { getGroupLocation } from "~/models/location.server"
import { Table } from "~/components/Table"
import styled from "styled-components"
import { Button, LinkButton } from "~/components/Button"
import { Spacer } from "~/components/Spacer"
import { formatNumber } from "~/utils"
import { useRef } from "react"
import { Stack } from "~/components/Stack"
import { ComboBox, Item, Label } from "~/components/ComboBox"
import { Input } from "~/components/Input"
import { getGroup } from "~/models/group.server"

export const loader = async ({ request, params }: LoaderArgs) => {
  const userId = await requireUserId(request)
  invariant(params.groupId, "groupId not found")
  invariant(params.locationId, "locationId not found")

  const group = await getGroup({ id: params.groupId })
  const groupLocation = await getGroupLocation({
    groupId: params.groupId,
    id: parseInt(params.locationId),
  })

  if (!groupLocation) {
    throw new Response("Not Found", { status: 404 })
  }

  const currentMember = groupLocation.group.members.find(
    (m) => m.userId === userId
  )
  const isMember = Boolean(currentMember)

  if (!isMember) {
    throw new Response("Unauthorized", { status: 401 })
  }

  return json({ groupLocation, group })
}

type ActionData = {}

export default function GroupLocationEditPage() {
  const { groupLocation, group } = useLoaderData<typeof loader>()
  const actionData = useActionData() as ActionData

  const nameRef = useRef<HTMLInputElement>(null!)
  const addressRef = useRef<HTMLInputElement>(null)
  const zipCodeRef = useRef<HTMLInputElement>(null)
  const cityRef = useRef<HTMLInputElement>(null)
  const latRef = useRef<HTMLInputElement>(null)
  const lonRef = useRef<HTMLInputElement>(null)
  const discoveredByRef = useRef<HTMLInputElement>(null!)

  const members = group.members.map((member) => ({
    id: member.userId,
    name: member.user.name,
  }))

  return (
    <div>
      <Title>at {groupLocation.location.name}</Title>
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
              <span>Street address</span>
              <Input
                ref={addressRef}
                name="address"
                required
                // aria-invalid={actionData?.errors?.address ? true : undefined}
                // aria-errormessage={
                //   actionData?.errors?.address ? "address-error" : undefined
                // }
              />
            </label>
            {/* {actionData?.errors?.address && (
              <div id="address-error">{actionData.errors.address}</div>
            )} */}
          </div>

          <Stack axis="horizontal" gap={16}>
            <div style={{ width: "100%" }}>
              <label>
                <span>Zip code</span>
                <Input
                  ref={zipCodeRef}
                  name="zipCode"
                  required
                  // aria-invalid={actionData?.errors?.zipCode ? true : undefined}
                  // aria-errormessage={
                  //   actionData?.errors?.zipCode ? "zip-code-error" : undefined
                  // }
                />
              </label>
              {/* {actionData?.errors?.zipCode && (
                <div id="zip-code-error">{actionData.errors.zipCode}</div>
              )} */}
            </div>

            <div style={{ width: "100%" }}>
              <label>
                <span>City</span>
                <Input
                  ref={cityRef}
                  name="city"
                  required
                  // aria-invalid={actionData?.errors?.city ? true : undefined}
                  // aria-errormessage={
                  //   actionData?.errors?.city ? "city-error" : undefined
                  // }
                />
              </label>
              {/* {actionData?.errors?.city && (
                <div id="city-error">{actionData.errors.city}</div>
              )} */}
            </div>
          </Stack>

          <Stack axis="horizontal" gap={16}>
            <div style={{ width: "100%" }}>
              <label>
                <span>Latitude</span>
                <Input
                  ref={latRef}
                  name="lat"
                  // onPaste={handleCoordinatePaste}
                  // aria-invalid={actionData?.errors?.lat ? true : undefined}
                  // aria-errormessage={
                  //   actionData?.errors?.lat ? "lat-error" : undefined
                  // }
                />
              </label>
              {/* {actionData?.errors?.lat && (
                <div id="lat-error">{actionData.errors.lat}</div>
              )} */}
            </div>

            <div style={{ width: "100%" }}>
              <label>
                <span>Longitude</span>
                <Input
                  ref={lonRef}
                  name="lon"
                  // onPaste={handleCoordinatePaste}
                  // aria-invalid={actionData?.errors?.lon ? true : undefined}
                  // aria-errormessage={
                  //   actionData?.errors?.lon ? "lon-error" : undefined
                  // }
                />
              </label>
              {/* {actionData?.errors?.lon && (
                <div id="lon-error">{actionData.errors.lon}</div>
              )} */}
            </div>
          </Stack>

          <div>
            <ComboBox
              label="Discovered by"
              name="discoveredBy"
              defaultItems={members}
              defaultSelectedKey={groupLocation.discoveredById || undefined}
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
            {/* {actionData?.errors?.discoveredBy && (
              <div id="discoveredBy-error">
                {actionData.errors.discoveredBy}
              </div>
            )} */}
          </div>

          {/* <input type="hidden" name="redirectTo" value={redirectTo} /> */}
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

export function ErrorBoundary({ error }: { error: Error }) {
  console.error(error)

  return <div>An unexpected error occurred: {error.message}</div>
}

export function CatchBoundary() {
  const caught = useCatch()

  if (caught.status === 404) {
    return <div>Location not found</div>
  }

  throw new Error(`Unexpected caught response with status: ${caught.status}`)
}

const Title = styled.h2`
  font-size: 36px;
  margin: 0;
  margin-bottom: 24px;
`
