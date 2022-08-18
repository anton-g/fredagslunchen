import type {
  ActionFunction,
  LoaderFunction,
  MetaFunction,
} from "@remix-run/node"
import { json, redirect } from "@remix-run/node"
import { Form, useActionData, useSearchParams } from "@remix-run/react"
import * as React from "react"
import { getUserId } from "~/session.server"
import { changeUserPassword as resetUserPassword } from "~/models/user.server"
import { Stack } from "~/components/Stack"
import { Button } from "~/components/Button"
import styled from "styled-components"
import { Input } from "~/components/Input"

export const loader: LoaderFunction = async ({ request, params }) => {
  const userId = await getUserId(request)
  if (userId) return redirect("/")

  const url = new URL(request.url)
  const token = url.searchParams.get("token")

  if (!token) return redirect("/forgot-password")

  return json({})
}

interface ActionData {
  errors?: {
    password?: string
    confirmPassword?: string
    token?: string
  }
}

export const action: ActionFunction = async ({ request }) => {
  const formData = await request.formData()
  const password = formData.get("password")
  const confirmPassword = formData.get("confirm-password")
  const token = formData.get("token")

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

  // TODO maybe only do this client side?
  if (typeof confirmPassword !== "string" || password !== confirmPassword) {
    return json<ActionData>(
      { errors: { confirmPassword: "Password doesn't match" } },
      { status: 400 }
    )
  }

  if (typeof token !== "string" || token.length === 0) {
    return json<ActionData>(
      { errors: { token: "Reset token is required" } },
      { status: 400 }
    )
  }

  await resetUserPassword({
    token,
    newPassword: password,
  })

  return redirect("/login")
}

export const meta: MetaFunction = () => {
  return {
    title: "Forgot password",
  }
}

export default function ResetPasswordPage() {
  const [searchParams] = useSearchParams()
  const actionData = useActionData() as ActionData

  const passwordRef = React.useRef<HTMLInputElement>(null)
  const confirmPasswordRef = React.useRef<HTMLInputElement>(null)

  React.useEffect(() => {
    if (actionData?.errors?.password) {
      passwordRef.current?.focus()
    } else if (actionData?.errors?.confirmPassword) {
      confirmPasswordRef.current?.focus()
    }
  }, [actionData])

  const resetToken = searchParams.get("token")

  return (
    <>
      <h2>Reset password</h2>
      <Form method="post">
        <Stack gap={16}>
          {resetToken && (
            <>
              <div>
                <label htmlFor="password">New password</label>
                <div>
                  <Input
                    ref={passwordRef}
                    id="password"
                    required
                    autoFocus={true}
                    name="password"
                    type="password"
                    autoComplete="password"
                    aria-invalid={
                      actionData?.errors?.password ? true : undefined
                    }
                    aria-describedby="password-error"
                  />
                  {actionData?.errors?.password && (
                    <div id="password-error">{actionData.errors.password}</div>
                  )}
                </div>
              </div>
              <div>
                <label htmlFor="confirm-password">Confirm password</label>
                <div>
                  <Input
                    ref={confirmPasswordRef}
                    id="confirm-password"
                    required
                    autoFocus={true}
                    name="confirm-password"
                    type="password"
                    aria-invalid={
                      actionData?.errors?.confirmPassword ? true : undefined
                    }
                    aria-describedby="confirm-password-error"
                  />
                  {actionData?.errors?.confirmPassword && (
                    <div id="confirm-password-error">
                      {actionData.errors.confirmPassword}
                    </div>
                  )}
                </div>
              </div>
              <input type="hidden" name="token" value={resetToken} />
              <SubmitButton type="submit">Save password</SubmitButton>
            </>
          )}
        </Stack>
      </Form>
    </>
  )
}

const SubmitButton = styled(Button)`
  margin-left: auto;
`
