import type { ActionFunction } from "@remix-run/node"
import { json, redirect } from "@remix-run/node"
import { Form, useActionData } from "@remix-run/react"
import * as React from "react"
import { zfd } from "zod-form-data"
import type z from "zod"
import { Button } from "~/components/Button"
import { Input } from "~/components/Input"
import { Stack } from "~/components/Stack"

import { createGroup } from "~/models/group.server"
import { requireUserId } from "~/session.server"
import { mapToActualErrors } from "~/utils"

const formSchema = zfd.formData({
  name: zfd.text(),
})

type ActionData = {
  errors?: Partial<Record<keyof z.infer<typeof formSchema>, string>>
}

export const action: ActionFunction = async ({ request }) => {
  const userId = await requireUserId(request)

  const result = formSchema.safeParse(await request.formData())

  if (!result.success) {
    return json<ActionData>(
      {
        errors: mapToActualErrors<typeof formSchema>(result),
      },
      { status: 400 }
    )
  }

  const name = result.data.name

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
                // required
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
