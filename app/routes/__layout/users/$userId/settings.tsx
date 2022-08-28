import type { ActionFunction, LoaderArgs } from "@remix-run/node"
import { json, redirect } from "@remix-run/node"
import { Form, useActionData, useLoaderData } from "@remix-run/react"
import * as React from "react"
import styled from "styled-components"
import invariant from "tiny-invariant"
import { Button } from "~/components/Button"
import { Input } from "~/components/Input"
import { Spacer } from "~/components/Spacer"
import { getUserById, updateUser } from "~/models/user.server"

import { requireUserId } from "~/session.server"

export const loader = async ({ request, params }: LoaderArgs) => {
  const userId = await requireUserId(request)
  invariant(params.userId, "userId is required")

  if (userId !== params.userId) {
    throw new Response("Not Found", { status: 404 })
  }

  const user = await getUserById(userId)

  if (!user) {
    throw new Response("Not Found", { status: 404 })
  }

  return json({
    user,
  })
}

type ActionData = {
  errors?: {
    name?: string
  }
}

export const action: ActionFunction = async ({ request, params }) => {
  const userId = await requireUserId(request)
  invariant(params.userId, "userId not found")

  if (userId !== params.userId) {
    throw new Response("Bad Request", { status: 400 })
  }

  const formData = await request.formData()
  const name = formData.get("name")

  if (typeof name !== "string" || name.length === 0) {
    return json<ActionData>(
      { errors: { name: "Name is required" } },
      { status: 400 }
    )
  }

  const user = await updateUser({
    id: userId,
    name,
  })

  return redirect(`/users/${user.id}`)
}

export default function UserSettingsPage() {
  const { user } = useLoaderData<typeof loader>()
  const actionData = useActionData() as ActionData
  const nameRef = React.useRef<HTMLInputElement>(null)

  React.useEffect(() => {
    if (actionData?.errors?.name) {
      nameRef.current?.focus()
    }
  }, [actionData])

  return (
    <div>
      <Title>Your settings</Title>
      <Form method="post">
        <div>
          <label htmlFor="name">Name</label>
          <div>
            <Input
              ref={nameRef}
              id="name"
              required
              name="name"
              type="name"
              autoComplete="name"
              defaultValue={user.name}
              aria-invalid={actionData?.errors?.name ? true : undefined}
              aria-describedby="name-error"
            />
            {actionData?.errors?.name && (
              <div id="name-error">{actionData.errors.name}</div>
            )}
          </div>
        </div>
        <Spacer size={16} />
        <Button style={{ marginLeft: "auto" }}>Save changes</Button>
      </Form>
    </div>
  )
}

const Title = styled.h2`
  font-size: 48px;
  margin: 0;
  margin-bottom: 24px;
`
