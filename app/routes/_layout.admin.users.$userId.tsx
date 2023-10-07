import type { ActionFunctionArgs, LoaderFunctionArgs } from "@remix-run/node"
import { json, redirect } from "@remix-run/node"
import { Form, useActionData, useLoaderData } from "@remix-run/react"
import * as React from "react"
import styled from "styled-components"
import invariant from "tiny-invariant"
import { Button } from "~/components/Button"
import { Input } from "~/components/Input"
import { Spacer } from "~/components/Spacer"
import { Stack } from "~/components/Stack"
import { forceCreateResetPasswordTokenForUserId, getUserForAdmin, updateUser } from "~/models/user.server"

import { requireAdminUserId } from "~/session.server"

export const loader = async ({ request, params }: LoaderFunctionArgs) => {
  await requireAdminUserId(request)
  invariant(params.userId, "userId is required")

  const user = await getUserForAdmin({ id: params.userId })

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

export const action = async ({ request, params }: ActionFunctionArgs) => {
  await requireAdminUserId(request)
  invariant(params.userId, "userId not found")

  const formData = await request.formData()

  const generateResetToken = formData.get("generateResetToken") === "true"

  if (generateResetToken) {
    await forceCreateResetPasswordTokenForUserId(params.userId)
    return redirect(`/admin/users/${params.userId}`)
  }

  const name = formData.get("name")

  if (typeof name !== "string" || name.length === 0) {
    return json<ActionData>({ errors: { name: "Name is required" } }, { status: 400 })
  }

  const user = await updateUser({
    id: params.userId,
    name,
  })

  return redirect(`/admin/users/${user.id}`)
}

export default function AdminUserSettingsPage() {
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
      <Title>{user.name}</Title>
      <Form method="post">
        <Stack gap={16}>
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
              {actionData?.errors?.name && <div id="name-error">{actionData.errors.name}</div>}
            </div>
          </div>
          <div>
            <label htmlFor="email">Email</label>
            <div>
              <Input
                // ref={emailRef}
                // id="email"
                required
                // name="email"
                type="email"
                disabled
                defaultValue={user.email?.email}
                // aria-invalid={actionData?.errors?.name ? true : undefined}
                // aria-describedby="name-error"
              />
              {/* {actionData?.errors?.name && (
              <div id="name-error">{actionData.errors.name}</div>
            )} */}
            </div>
          </div>
        </Stack>
        <Spacer size={16} />
        <Button style={{ marginLeft: "auto" }}>Save changes</Button>
      </Form>
      <Spacer size={24} />
      <Form method="post">
        <input type="hidden" value="true" name="generateResetToken" />
        <Subtitle>Password reset</Subtitle>
        <Stack axis="horizontal" gap={16}>
          <Button size="large">Generate</Button>
          <Input
            type="text"
            id="reset-link"
            disabled
            value={
              user.passwordResetToken
                ? `https://fredagslunchen.club/reset-password?token=${user.passwordResetToken}`
                : ""
            }
          />
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
