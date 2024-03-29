import { useEffect, useRef } from "react"
import type { ActionFunctionArgs, LoaderFunctionArgs } from "@remix-run/node"
import { json, redirect } from "@remix-run/node"
import { Form, useActionData, useLoaderData } from "@remix-run/react"
import styled from "styled-components"
import invariant from "tiny-invariant"
import { Button } from "~/components/Button"
import { Input } from "~/components/Input"
import { Spacer } from "~/components/Spacer"
import { Stack } from "~/components/Stack"
import type { User } from "~/models/user.server"
import {
  changeUserPassword,
  checkIsAdmin,
  getFullUserById,
  hasUserPassword,
  setUserPassword,
  updateUser,
} from "~/models/user.server"
import { requireUserId } from "~/auth.server"
import { ThemePicker } from "~/components/ThemePicker"
import { AvatarPicker } from "~/components/AvatarPicker"

export const loader = async ({ request, params }: LoaderFunctionArgs) => {
  const currentUserId = await requireUserId(request)
  invariant(params.userId, "userId is required")

  const isAdmin = checkIsAdmin(currentUserId)

  if (currentUserId !== params.userId && !isAdmin) {
    throw new Response("Not Found", { status: 404 })
  }

  const user = await getFullUserById({
    id: params.userId,
    requestUserId: currentUserId,
  })

  if (!user) {
    throw new Response("Not Found", { status: 404 })
  }

  const hasPassword = await hasUserPassword(user.id)

  return json({
    user,
    hasPassword,
  })
}

type ActionData = {
  errors?: {
    name?: string
    password?: string
    newPassword?: string
    theme?: string
    avatar?: string
    confirmNewPassword?: string
  }
}

export const action = async ({ request, params }: ActionFunctionArgs) => {
  const userId = await requireUserId(request)
  invariant(params.userId, "userId not found")

  if (userId !== params.userId) {
    throw new Response("Bad Request", { status: 400 })
  }

  const formData = await request.formData()

  const action = formData.get("action")
  switch (action) {
    case "updateAvatar":
      return await updateAvatar(formData, userId)
    case "updateTheme":
      return await updateTheme(formData, userId)
    case "updateDetails":
      return await updateDetails(formData, userId)
    case "changePassword":
      return await updatePassword(formData, userId)
    case "setPassword":
      return await setPassword(formData, userId)
  }
}

const updateDetails = async (formData: FormData, userId: User["id"]) => {
  const name = formData.get("name")
  if (typeof name !== "string" || name.length === 0) {
    return json<ActionData>({ errors: { name: "Name is required" } }, { status: 400 })
  }

  const user = await updateUser({
    id: userId,
    name,
  })

  return redirect(`/users/${user.id}`)
}

const updateAvatar = async (formData: FormData, userId: User["id"]) => {
  const avatar = formData.get("avatar")
  if (typeof avatar !== "string" || avatar.length === 0) {
    return json<ActionData>({ errors: { avatar: "Invalid avatar" } }, { status: 400 })
  }

  const avatarId = parseInt(avatar)

  if (avatarId < 1 || avatarId > 30) {
    return json<ActionData>({ errors: { avatar: "Invalid avatar" } }, { status: 400 })
  }

  await updateUser({
    id: userId,
    avatarId,
  })

  return json({ ok: true })
}

const updateTheme = async (formData: FormData, userId: User["id"]) => {
  const theme = formData.get("theme")
  if (typeof theme !== "string" || theme.length === 0) {
    return json<ActionData>({ errors: { theme: "Invalid theme" } }, { status: 400 })
  }

  await updateUser({
    id: userId,
    theme,
  })

  return json({ ok: true })
}

const updatePassword = async (formData: FormData, userId: User["id"]) => {
  const password = formData.get("current-password")
  const newPassword = formData.get("new-password")

  if (typeof password !== "string" || password.length === 0) {
    return json<ActionData>({ errors: { password: "Current password is required" } }, { status: 400 })
  }

  if (typeof newPassword !== "string" || newPassword.length === 0) {
    return json<ActionData>({ errors: { newPassword: "New password is required" } }, { status: 400 })
  }

  if (newPassword.length < 8) {
    return json<ActionData>({ errors: { newPassword: "Password is too short" } }, { status: 400 })
  }

  const userOrError = await changeUserPassword({
    id: userId,
    oldPassword: password,
    newPassword,
  })

  if ("error" in userOrError) {
    return json<ActionData>({ errors: { password: userOrError.error } }, { status: 400 })
  }

  return redirect(`/users/${userOrError.id}`)
}

const setPassword = async (formData: FormData, userId: User["id"]) => {
  const newPassword = formData.get("new-password")
  const confirmNewPassword = formData.get("confirm-new-password")

  if (typeof newPassword !== "string" || newPassword.length === 0) {
    return json<ActionData>({ errors: { newPassword: "New password is required" } }, { status: 400 })
  }

  if (typeof confirmNewPassword !== "string" || confirmNewPassword.length === 0) {
    return json<ActionData>(
      { errors: { confirmNewPassword: "You must confirm your new password" } },
      { status: 400 },
    )
  }

  if (newPassword.length < 8) {
    return json<ActionData>({ errors: { newPassword: "Password is too short" } }, { status: 400 })
  }

  if (newPassword !== confirmNewPassword) {
    return json<ActionData>({ errors: { confirmNewPassword: "Passwords do not match" } }, { status: 400 })
  }

  const user = await setUserPassword({
    id: userId,
    newPassword,
  })

  if (!user) {
    return json<ActionData>({ errors: { password: "Something went wrong" } }, { status: 400 })
  }

  return redirect(`/users/${user.id}`)
}

export default function UserSettingsPage() {
  const { user, hasPassword } = useLoaderData<typeof loader>()
  const actionData = useActionData() as ActionData
  const nameRef = useRef<HTMLInputElement>(null)
  const currentPasswordRef = useRef<HTMLInputElement>(null)
  const newPasswordRef = useRef<HTMLInputElement>(null)
  const confirmNewPasswordRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (actionData?.errors?.name) {
      nameRef.current?.focus()
    }
  }, [actionData])

  return (
    <div>
      <Title>Your settings</Title>
      <AvatarPicker user={user} />
      <Form method="post">
        <input type="hidden" name="action" value="updateDetails" />
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
      {hasPassword && (
        <Form method="post">
          <input type="hidden" name="action" value="changePassword" />
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
                  <div id="current-password-error">{actionData.errors.password}</div>
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
                  aria-invalid={actionData?.errors?.newPassword ? true : undefined}
                  aria-describedby="new-password-error"
                />
                {actionData?.errors?.newPassword && (
                  <div id="new-password-error">{actionData.errors.newPassword}</div>
                )}
              </div>
            </div>
            <Button style={{ marginLeft: "auto" }}>Change password</Button>
          </Stack>
        </Form>
      )}
      {!hasPassword && (
        <Form method="post">
          <input type="hidden" name="action" value="setPassword" />
          <Subtitle style={{ marginBottom: 0 }}>Set password</Subtitle>
          <p style={{ marginTop: 0 }}>You can set a password to enable logging in with email and password.</p>
          <Stack gap={16}>
            <div>
              <label htmlFor="new-password">New password</label>
              <div>
                <Input
                  id="new-password"
                  ref={newPasswordRef}
                  name="new-password"
                  type="password"
                  aria-invalid={actionData?.errors?.newPassword ? true : undefined}
                  aria-describedby="new-password-error"
                />
                {actionData?.errors?.newPassword && (
                  <div id="new-password-error">{actionData.errors.newPassword}</div>
                )}
              </div>
            </div>
            <div>
              <label htmlFor="confirm-new-password">Confirm password</label>
              <div>
                <Input
                  id="confirm-new-password"
                  ref={confirmNewPasswordRef}
                  name="confirm-new-password"
                  minLength={8}
                  type="password"
                  aria-invalid={actionData?.errors?.confirmNewPassword ? true : undefined}
                  aria-describedby="confirm-new-password-error"
                />
                {actionData?.errors?.confirmNewPassword && (
                  <div id="confirm-new-password-error">{actionData.errors.confirmNewPassword}</div>
                )}
              </div>
            </div>
            <Button style={{ marginLeft: "auto" }}>Set password</Button>
          </Stack>
        </Form>
      )}
      <ThemePicker />
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
