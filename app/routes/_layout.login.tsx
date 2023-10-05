import type { ActionArgs, LoaderFunction, MetaFunction } from "@remix-run/node"
import { json, redirect } from "@remix-run/node"
import { Form, Link, useActionData, useSearchParams } from "@remix-run/react"
import { useForm, conform } from "@conform-to/react"
import { parse } from "@conform-to/zod"
import { createUserSession, getUserId } from "~/session.server"
import { verifyLogin } from "~/models/user.server"
import { safeRedirect } from "~/utils"
import { Stack } from "~/components/Stack"
import { Button } from "~/components/Button"
import styled from "styled-components"
import { Input } from "~/components/Input"
import { z } from "zod"

export const loader: LoaderFunction = async ({ request }) => {
  const userId = await getUserId(request)
  if (userId) return redirect("/")
  return json({})
}

const schema = z.object({
  email: z.string().min(1, "Email is required").email("Email is invalid"),
  password: z.string().min(8, "Password is too short"),
  redirectTo: z.string().refine((x) => safeRedirect(x, "/")),
})

export const action = async ({ request }: ActionArgs) => {
  const formData = await request.formData()

  const submission = parse(formData, { schema })

  if (!submission.value || submission.intent !== "submit") {
    return json(submission, { status: 400 })
  }

  const user = await verifyLogin(submission.value.email, submission.value.password)

  if (!user) {
    submission.error.email = "Email or password is incorrect"
    return json(submission, { status: 400 })
  }

  return createUserSession({
    request,
    userId: user.id,
    redirectTo: submission.value.redirectTo,
  })
}

export const meta: MetaFunction = () => {
  return {
    title: "Login",
  }
}

export default function LoginPage() {
  const [searchParams] = useSearchParams()
  const redirectToParam = searchParams.get("redirectTo") || "/"
  const lastSubmission = useActionData<typeof action>()
  const [form, { email, password, redirectTo }] = useForm({
    id: "login-form",
    lastSubmission,
    onValidate: ({ formData }) => parse(formData, { schema }),
  })

  return (
    <Wrapper>
      <h2>Login</h2>
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

          <div>
            <label htmlFor={password.id}>Password</label>
            <div>
              <Input
                {...conform.input(password, { type: "password", ariaAttributes: true })}
                autoComplete="current-password"
              />
              {password.error && <div id={`${password.id}-error`}>{password.error}</div>}
            </div>
          </div>

          <input type="hidden" name={redirectTo.name} value={redirectToParam} />
          <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
            <SubmitButton type="submit">Log in</SubmitButton>
          </div>
          <ForgotPasswordLink to="/forgot-password">Forgot your password?</ForgotPasswordLink>
        </Stack>
      </Form>
    </Wrapper>
  )
}

const Wrapper = styled.div`
  max-width: 430px;
  margin: 0 auto;
`

const SubmitButton = styled(Button)`
  margin-left: auto;
`

const ForgotPasswordLink = styled(Link)`
  margin-left: auto;
  &:hover {
    text-decoration: underline;
  }
`
