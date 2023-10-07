import type { ActionFunctionArgs, LoaderFunctionArgs, MetaFunction } from "@remix-run/node"
import { json, redirect } from "@remix-run/node"
import { Form, useActionData, useNavigation } from "@remix-run/react"
import { useForm, conform } from "@conform-to/react"
import { parse } from "@conform-to/zod"
import { getUserId } from "~/session.server"
import { createResetPasswordToken } from "~/models/user.server"
import { Stack } from "~/components/Stack"
import { Button } from "~/components/Button"
import styled from "styled-components"
import { Input } from "~/components/Input"
import { sendPasswordResetEmail } from "~/services/email.server"
import { z } from "zod"
import { mergeMeta } from "~/merge-meta"

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const userId = await getUserId(request)
  if (userId) return redirect("/")
  return json({})
}

const schema = z.object({
  email: z.string().min(1, "Email is required").email("Email is invalid"),
})

export const action = async ({ request }: ActionFunctionArgs) => {
  const formData = await request.formData()

  const submission = parse(formData, { schema })
  if (!submission.value || submission.intent !== "submit") {
    return json({ submission, success: false }, { status: 400 })
  }

  const token = await createResetPasswordToken(submission.value.email)
  if (token) await sendPasswordResetEmail(submission.value.email, token)

  return json({ submission, success: true })
}

export const meta: MetaFunction = mergeMeta(() => [
  {
    title: "Forgot password - Fredagslunchen",
  },
])

export default function ForgotPasswordPage() {
  const actionData = useActionData<typeof action>()
  const navigation = useNavigation()
  const [form, { email }] = useForm({
    id: "reset-password-form",
    lastSubmission: actionData?.submission,
    onValidate: ({ formData }) => parse(formData, { schema }),
  })

  return (
    <>
      <h2>Reset password</h2>
      {actionData && actionData.success ? (
        <p>
          We've sent an email with instructions on how to reset your password! (If you don't receive it, check
          your junk folder.)
        </p>
      ) : (
        <Form method="post" {...form.props}>
          <Stack gap={16}>
            <div>
              <label htmlFor={email.id}>Email address</label>
              <div>
                <Input
                  {...conform.input(email, { type: "email", ariaAttributes: true })}
                  autoFocus={true}
                  autoComplete="email"
                />
                {email.error && <div id={`${email.id}-error`}>{email.error}</div>}
              </div>
            </div>
            <SubmitButton type="submit" disabled={navigation.state !== "idle"}>
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
