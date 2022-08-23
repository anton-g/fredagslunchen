import { useEffect, useRef } from "react"
import type {
  ActionFunction,
  LoaderFunction,
  MetaFunction,
} from "@remix-run/node"
import { json, redirect } from "@remix-run/node"
import { Form, useActionData, useTransition } from "@remix-run/react"

import { getUserId } from "~/session.server"
import { createResetPasswordToken } from "~/models/user.server"
import { validateEmail } from "~/utils"
import { Stack } from "~/components/Stack"
import { Button } from "~/components/Button"
import styled from "styled-components"
import { Input } from "~/components/Input"
import { sendPasswordResetEmail } from "~/services/mail.server"

export const loader: LoaderFunction = async ({ request }) => {
  const userId = await getUserId(request)
  if (userId) return redirect("/")
  return json({})
}

interface ActionData {
  errors?: {
    email?: string
  }
}

export const action: ActionFunction = async ({ request }) => {
  const formData = await request.formData()
  const email = formData.get("email")

  if (!validateEmail(email)) {
    return json<ActionData>(
      { errors: { email: "Email is invalid" } },
      { status: 400 }
    )
  }

  const token = await createResetPasswordToken(email)
  if (token) await sendPasswordResetEmail(email, token)

  return json({
    ok: true,
  })
}

export const meta: MetaFunction = () => {
  return {
    title: "Forgot password",
  }
}

export default function ForgotPasswordPage() {
  const actionData = useActionData() as ActionData
  const emailRef = useRef<HTMLInputElement>(null)
  const transition = useTransition()

  useEffect(() => {
    if (actionData?.errors?.email) {
      emailRef.current?.focus()
    }
  }, [actionData])

  return (
    <>
      <h2>Reset password</h2>
      {actionData && !actionData.errors ? (
        <p>
          We've sent an email with instructions on how to reset your password!
          (If you don't receive it, check your junk folder.)
        </p>
      ) : (
        <Form method="post">
          <Stack gap={16}>
            <div>
              <label htmlFor="email">Email address</label>
              <div>
                <Input
                  ref={emailRef}
                  id="email"
                  required
                  autoFocus={true}
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
            <SubmitButton type="submit" disabled={transition.state !== "idle"}>
              Reset password
            </SubmitButton>
          </Stack>
        </Form>
      )}
    </>
  )
}

const SubmitButton = styled(Button)`
  margin-left: auto;
`
