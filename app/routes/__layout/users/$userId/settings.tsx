import type { ActionFunction, LoaderArgs } from "@remix-run/node"
import { json, redirect } from "@remix-run/node"
import { Form, useActionData, useLoaderData } from "@remix-run/react"
import * as React from "react"
import styled from "styled-components"
import invariant from "tiny-invariant"
import { Button } from "~/components/Button"
import { Input } from "~/components/Input"
import { Spacer } from "~/components/Spacer"
import { Stack } from "~/components/Stack"
import {
  changeUserPassword,
  getUserById,
  updateUser,
} from "~/models/user.server"

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
    password?: string
    newPassword?: string
  }
}

export const action: ActionFunction = async ({ request, params }) => {
  const userId = await requireUserId(request)
  invariant(params.userId, "userId not found")

  if (userId !== params.userId) {
    throw new Response("Bad Request", { status: 400 })
  }

  const formData = await request.formData()
  const password = formData.get("current-password")
  if (password) {
    // todo move to func
    const newPassword = formData.get("new-password")

    if (typeof password !== "string" || password.length === 0) {
      return json<ActionData>(
        { errors: { password: "Current password is required" } },
        { status: 400 }
      )
    }

    if (typeof newPassword !== "string" || newPassword.length === 0) {
      return json<ActionData>(
        { errors: { newPassword: "New password is required" } },
        { status: 400 }
      )
    }

    if (newPassword.length < 8) {
      return json<ActionData>(
        { errors: { newPassword: "Password is too short" } },
        { status: 400 }
      )
    }

    const userOrError = await changeUserPassword({
      id: userId,
      oldPassword: password,
      newPassword,
    })

    if ("error" in userOrError) {
      return json<ActionData>(
        { errors: { password: userOrError.error } },
        { status: 400 }
      )
    }

    return redirect(`/users/${userOrError.id}`)
  }

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
  const currentPasswordRef = React.useRef<HTMLInputElement>(null)
  const newPasswordRef = React.useRef<HTMLInputElement>(null)

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
      <Form method="post">
        <Subtitle>Change password</Subtitle>
        <Stack gap={16}>
          <div>
            <label htmlFor="current-password">Current password</label>
            <div>
              <Input
                id="current-password"
                ref={currentPasswordRef}
                name="current-password"
                type="password"
                aria-invalid={actionData?.errors?.password ? true : undefined}
                aria-describedby="current-password-error"
              />
              {actionData?.errors?.password && (
                <div id="current-password-error">
                  {actionData.errors.password}
                </div>
              )}
            </div>
          </div>
          <div>
            <label htmlFor="new-password">New password</label>
            <div>
              <Input
                id="new-password"
                ref={newPasswordRef}
                name="new-password"
                minLength={8}
                type="password"
                aria-invalid={
                  actionData?.errors?.newPassword ? true : undefined
                }
                aria-describedby="new-password-error"
              />
              {actionData?.errors?.newPassword && (
                <div id="new-password-error">
                  {actionData.errors.newPassword}
                </div>
              )}
            </div>
          </div>
          <Button style={{ marginLeft: "auto" }}>Change password</Button>
        </Stack>
      </Form>
    </div>
  )
}

const Title = styled.h2`
  font-size: 48px;
  margin: 0;
  margin-bottom: 24px;
`

const Subtitle = styled.h3`
  font-size: 24px;
  margin: 16px 0;
`
