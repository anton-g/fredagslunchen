import type { GroupLocation } from "@prisma/client"
import type { ActionFunction, LoaderArgs } from "@remix-run/node"
import { json } from "@remix-run/node"
import { Form } from "@remix-run/react"
import styled from "styled-components"
import { Button } from "~/components/Button"
import { Stack } from "~/components/Stack"
import { TextArea } from "~/components/TextArea"
import { importGroupSchema } from "~/import-schema.server"
import { createGroup } from "~/models/group.server"
import { createGroupLocation } from "~/models/location.server"
import { createLunch } from "~/models/lunch.server"
import { createScore } from "~/models/score.server"
import type { User } from "~/models/user.server"
import { createAnonymousUser } from "~/models/user.server"
import { requireUserId } from "~/session.server"

export const loader = async ({ request }: LoaderArgs) => {
  await requireUserId(request)

  return json({})
}

type ActionData = {
  errors?: {
    data?: string
  }
}

export const action: ActionFunction = async ({ request }) => {
  const userId = await requireUserId(request)

  const formData = await request.formData()
  const data = formData.get("data")

  if (typeof data !== "string" || data.length === 0) {
    return json<ActionData>({
      errors: {
        data: "JSON is required",
      },
    })
  }

  const parsedData = JSON.parse(data)

  const result = importGroupSchema.safeParse(parsedData)
  if (!result.success) {
    console.log(result.error.errors)
    return json<ActionData>({
      errors: {
        data: Object.values(result.error.flatten().fieldErrors).join(", "),
      },
    })
  }

  const group = await createGroup({
    name: result.data.groupName,
    userId,
  })
  console.log("Created group", group.id)

  const users: Record<string, User | undefined> = {}
  const locations: Record<string, GroupLocation | undefined> = {}
  for (const lunch of result.data.lunches) {
    let picker = users[lunch.picker]
    if (!picker) {
      const newUser = await createAnonymousUser(lunch.picker, group.id)
      users[lunch.picker] = newUser
      picker = newUser
    }

    let location = locations[lunch.location]
    if (!location) {
      const newLocation = await createGroupLocation({
        address: "N/A",
        city: "N/A",
        countryCode: null,
        discoveredById: picker.id,
        groupId: group.id,
        lat: null,
        lon: null,
        global: false,
        name: lunch.location,
        osmId: null,
        zipCode: "N/A",
      })
      locations[lunch.location] = newLocation
      location = newLocation
    }

    const createdLunch = await createLunch({
      date: lunch.date,
      choosenByUserId: picker.id,
      groupId: group.id,
      locationId: location.locationId,
    })

    for (const score of lunch.scores) {
      let scoreUser = users[score.author]
      if (!scoreUser) {
        const newUser = await createAnonymousUser(score.author, group.id)
        users[score.author] = newUser
        scoreUser = newUser
      }

      await createScore({
        comment: null,
        lunchId: createdLunch.id,
        score: score.score,
        userId: scoreUser.id,
      })
    }
  }

  return json({ ok: true })
}

export default function AdminToolsPage() {
  return (
    <div>
      <Title>Import JSON</Title>
      <Form method="post">
        <Stack gap={16}>
          <TextArea placeholder="JSON goes here.." rows={10} name="data" />
          <Button>Import</Button>
        </Stack>
      </Form>
    </div>
  )
}

const Title = styled.h3`
  font-size: 24px;
  margin: 0;
  margin-bottom: 16px;
`
