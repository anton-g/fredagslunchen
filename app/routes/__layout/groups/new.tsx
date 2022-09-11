import type { ActionFunction } from "@remix-run/node"
import { json, redirect } from "@remix-run/node"
import { Form, useActionData } from "@remix-run/react"
import * as React from "react"
import { Button } from "~/components/Button"
import { Input } from "~/components/Input"
import { Stack } from "~/components/Stack"

import { createGroup } from "~/models/group.server"
import { requireUserId } from "~/session.server"

type ActionData = {
  errors?: {
    name?: string
  }
}

export const action: ActionFunction = async ({ request }) => {
  const userId = await requireUserId(request)

  const formData = await request.formData()
  const name = formData.get("name")

  if (typeof name !== "string" || name.length === 0) {
    return json<ActionData>(
      { errors: { name: "Name is required" } },
      { status: 400 }
    )
  }

  const group = await createGroup({ name, userId })

  return redirect(`/groups/${group.id}`)
}

export default function NewGroupPage() {
  const actionData = useActionData() as ActionData
  const nameRef = React.useRef<HTMLInputElement>(null)

  React.useEffect(() => {
    if (actionData?.errors?.name) {
      nameRef.current?.focus()
    }
  }, [actionData])

  return (
    <>
      <h2>Create a new club</h2>
      <p>
        Create a new club to get started. When the club is created you can
        invite other users to join you on your lunch adventures!
      </p>
      <p>If you're looking to join a club, tell them to invite you instead!</p>
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
                required
                aria-invalid={actionData?.errors?.name ? true : undefined}
                aria-errormessage={
                  actionData?.errors?.name ? "name-error" : undefined
                }
              />
            </label>
            {actionData?.errors?.name && (
              <div id="name-error">{actionData.errors.name}</div>
            )}
          </div>

          <div>
            <Button style={{ marginLeft: "auto" }} type="submit">
              Create club
            </Button>
          </div>
        </Stack>
      </Form>
    </>
  )
}
