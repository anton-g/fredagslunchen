import type { ActionFunctionArgs, LoaderFunctionArgs, MetaFunction } from "@remix-run/node"
import { json, redirect } from "@remix-run/node"
import { Form, useActionData, useSearchParams } from "@remix-run/react"
import { getUserId } from "~/auth.server"
import { changeUserPasswordWithToken as resetUserPassword } from "~/models/user.server"
import { Stack } from "~/components/Stack"
import { Button } from "~/components/Button"
import styled from "styled-components"
import { Input } from "~/components/Input"
import { parse } from "@conform-to/zod"
import { useForm, conform } from "@conform-to/react"
import { z } from "zod"
import { mergeMeta } from "~/merge-meta"

export const loader = async ({ request, params }: LoaderFunctionArgs) => {
  const userId = await getUserId(request)
  if (userId) return redirect("/")

  const url = new URL(request.url)
  const token = url.searchParams.get("token")

  if (!token) return redirect("/forgot-password")

  return json({})
}

const schema = z
  .object({
    password: z.string().min(8, "Password is too short"),
    confirmPassword: z.string().min(8, "Password is too short"),
    token: z.string().min(1, "Missing password reset token"),
  })
  .refine(({ password, confirmPassword }) => password === confirmPassword, {
    path: ["confirmPassword"],
    message: "Passwords doesn't match",
  })

export const action = async ({ request }: ActionFunctionArgs) => {
  const formData = await request.formData()
  const submission = parse(formData, { schema })
  if (!submission.value || submission.intent !== "submit") {
    return json(submission, { status: 400 })
  }

  await resetUserPassword({
    token: submission.value.token,
    newPassword: submission.value.password,
  })

  return redirect("/login")
}

export const meta: MetaFunction = mergeMeta(() => [
  {
    title: "Forgot password - Fredagslunchen",
  },
])

export default function ResetPasswordPage() {
  const [searchParams] = useSearchParams()
  const lastSubmission = useActionData<typeof action>()
  const [form, { password, confirmPassword, token }] = useForm({
    id: "reset-password-form",
    lastSubmission,
    onValidate: ({ formData }) => parse(formData, { schema }),
  })

  const resetToken = searchParams.get("token")

  return (
    <>
      <h2>Reset password</h2>
      <Form method="post" {...form.props}>
        <Stack gap={16}>
          {resetToken && (
            <>
              <div>
                <label htmlFor={password.id}>New password</label>
                <div>
                  <Input
                    autoFocus={true}
                    autoComplete="password"
                    {...conform.input(password, { type: "password", ariaAttributes: true })}
                  />
                  {password.error && <div id={`${password.id}-error`}>{password.error}</div>}
                </div>
              </div>
              <div>
                <label htmlFor={confirmPassword.id}>Confirm password</label>
                <div>
                  <Input {...conform.input(confirmPassword, { type: "password", ariaAttributes: true })} />
                  {confirmPassword.error && (
                    <div id={`${confirmPassword.id}-error`}>{confirmPassword.error}</div>
                  )}
                </div>
              </div>
              <input value={resetToken} {...conform.input(token, { hidden: true })} />
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
