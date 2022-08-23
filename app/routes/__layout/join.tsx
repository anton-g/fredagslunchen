import type {
  ActionFunction,
  LoaderFunction,
  MetaFunction,
} from "@remix-run/node"
import { json, redirect } from "@remix-run/node"
import {
  Form,
  Link,
  useActionData,
  useLocation,
  useSearchParams,
} from "@remix-run/react"
import * as React from "react"

import { getUserId, createUserSession } from "~/session.server"

import { createUser, getUserByEmail } from "~/models/user.server"
import { safeRedirect, validateEmail } from "~/utils"
import { Stack } from "~/components/Stack"
import { Button } from "~/components/Button"
import { Input } from "~/components/Input"
import styled from "styled-components"
import { addUserToGroupWithInviteToken } from "~/models/group.server"
import { sendEmailVerificationEmail } from "~/services/mail.server"

export const loader: LoaderFunction = async ({ request, params }) => {
  const userId = await getUserId(request)

  if (userId) {
    const url = new URL(request.url)
    const inviteToken = url.searchParams.get("token")

    if (inviteToken) {
      const group = await addUserToGroupWithInviteToken({
        inviteToken,
        userId,
      })

      return redirect(`/groups/${group.id}`)
    }

    return redirect("/")
  }
  return json({})
}

interface ActionData {
  errors: {
    email?: string
    password?: string
    name?: string
  }
}

export const action: ActionFunction = async ({ request }) => {
  const formData = await request.formData()
  const email = formData.get("email")
  const name = formData.get("name")
  const password = formData.get("password")
  const redirectTo = safeRedirect(formData.get("redirectTo"), "/")
  const url = new URL(request.url)
  const inviteToken = url.searchParams.get("token")

  if (!validateEmail(email)) {
    return json<ActionData>(
      { errors: { email: "Email is invalid" } },
      { status: 400 }
    )
  }

  if (typeof name !== "string" || name.length === 0) {
    return json<ActionData>(
      { errors: { name: "Name is required" } },
      { status: 400 }
    )
  }

  if (typeof password !== "string" || password.length === 0) {
    return json<ActionData>(
      { errors: { password: "Password is required" } },
      { status: 400 }
    )
  }

  if (password.length < 8) {
    return json<ActionData>(
      { errors: { password: "Password is too short" } },
      { status: 400 }
    )
  }

  const existingUser = await getUserByEmail(email)
  if (existingUser) {
    return json<ActionData>(
      { errors: { email: "A user already exists with this email" } },
      { status: 400 }
    )
  }

  const { user, groupId } = await createUser(email, name, password, inviteToken)

  if (user.email?.verificationToken) {
    await sendEmailVerificationEmail(
      user.email.email,
      user.email.verificationToken
    )
  }

  return createUserSession({
    request,
    userId: user.id,
    remember: false,
    redirectTo: groupId ? `/groups/${groupId}` : redirectTo,
  })
}

export const meta: MetaFunction = () => {
  return {
    title: "Sign Up",
  }
}

export default function Join() {
  const [searchParams] = useSearchParams()
  const redirectTo = searchParams.get("redirectTo") ?? undefined
  const actionData = useActionData() as ActionData
  const emailRef = React.useRef<HTMLInputElement>(null)
  const passwordRef = React.useRef<HTMLInputElement>(null)
  const nameRef = React.useRef<HTMLInputElement>(null)
  const location = useLocation()

  React.useEffect(() => {
    if (actionData?.errors?.email) {
      emailRef.current?.focus()
    } else if (actionData?.errors?.password) {
      passwordRef.current?.focus()
    }
  }, [actionData])

  return (
    <div>
      <h2>Sign up</h2>
      {/* Workaround to include search to action: https://github.com/remix-run/remix/issues/3133 */}
      <Form method="post" action={`${location.pathname}${location.search}`}>
        <Stack gap={16}>
          <div>
            <label htmlFor="name">Name</label>
            <div>
              <Input
                ref={nameRef}
                id="name"
                required
                autoFocus={true}
                name="name"
                type="name"
                autoComplete="name"
                aria-invalid={actionData?.errors?.name ? true : undefined}
                aria-describedby="name-error"
              />
              {actionData?.errors?.name && (
                <div id="name-error">{actionData.errors.name}</div>
              )}
            </div>
          </div>

          <div>
            <label htmlFor="email">Email address</label>
            <div>
              <Input
                ref={emailRef}
                id="email"
                required
                name="email"
                type="email"
                autoComplete="email"
                aria-invalid={actionData?.errors?.email ? true : undefined}
                aria-describedby="email-error"
              />
              {actionData?.errors?.email && (
                <div id="email-error">{actionData.errors.email}</div>
              )}
            </div>
          </div>

          <div>
            <label htmlFor="password">Password</label>
            <div>
              <Input
                id="password"
                ref={passwordRef}
                name="password"
                type="password"
                autoComplete="new-password"
                aria-invalid={actionData?.errors?.password ? true : undefined}
                aria-describedby="password-error"
              />
              {actionData?.errors?.password && (
                <div id="password-error">{actionData.errors.password}</div>
              )}
            </div>
          </div>

          <input type="hidden" name="redirectTo" value={redirectTo} />
          <div style={{ display: "flex" }}>
            <PrivacyLink to={"/privacy"}>Privacy Policy</PrivacyLink>
            <SubmitButton type="submit">Create Account</SubmitButton>
          </div>
        </Stack>
      </Form>
    </div>
  )
}

const SubmitButton = styled(Button)`
  margin-left: auto;
`

const PrivacyLink = styled(Link)`
  &:hover {
    text-decoration: underline;
  }
`
