import type { ActionFunctionArgs, LoaderFunctionArgs, MetaFunction } from "@remix-run/node"
import { json } from "@remix-run/node"
import { Form, Link, useActionData, useSearchParams } from "@remix-run/react"
import { safeRedirect, validateEmail } from "~/utils"
import { Stack } from "~/components/Stack"
import { Button } from "~/components/Button"
import styled from "styled-components"
import { Input } from "~/components/Input"
import { mergeMeta } from "~/merge-meta"
import { useEffect, useRef } from "react"
import { authenticator } from "~/auth.server"
import { SocialsProvider } from "remix-auth-socials"
import { SocialButton } from "../components/SocialButton"

export const loader = async ({ request }: LoaderFunctionArgs) => {
  await authenticator.isAuthenticated(request, {
    successRedirect: "/",
  })

  return json({})
}

interface ActionData {
  errors?: {
    email?: string
    password?: string
  }
}

export const action = async ({ request }: ActionFunctionArgs) => {
  const formData = await request.formData()

  const email = formData.get("email")
  const password = formData.get("password")
  const redirectTo = safeRedirect(formData.get("redirectTo"), "/")

  if (!validateEmail(email)) {
    return json<ActionData>({ errors: { email: "Email is invalid" } }, { status: 400 })
  }

  if (typeof password !== "string" || password.length === 0) {
    return json<ActionData>({ errors: { password: "Password is required" } }, { status: 400 })
  }

  if (password.length < 8) {
    return json<ActionData>({ errors: { password: "Password is too short" } }, { status: 400 })
  }

  try {
    return await authenticator.authenticate("user-pass", request, {
      successRedirect: redirectTo,
      throwOnError: true,
      context: { formData },
    })
  } catch (error) {
    if (error instanceof Response) return error

    const message = (error as Error).message || "Unknown error"
    return json<ActionData>({ errors: { password: message } }, { status: 400 })
  }
}

export const meta: MetaFunction = mergeMeta(() => [
  {
    title: "Login - Fredagslunchen",
  },
])

export default function LoginPage() {
  const [searchParams] = useSearchParams()
  const redirectTo = searchParams.get("redirectTo") || "/"
  const error = searchParams.get("error")
  const actionData = useActionData() as ActionData
  const emailRef = useRef<HTMLInputElement>(null)
  const passwordRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (actionData?.errors?.email) {
      emailRef.current?.focus()
    } else if (actionData?.errors?.password) {
      passwordRef.current?.focus()
    }
  }, [actionData])

  return (
    <Wrapper>
      <h2>Login</h2>
      <Form method="post">
        <Stack gap={16}>
          <div>
            <label htmlFor={"email"}>Email address</label>
            <div>
              <Input
                ref={emailRef}
                name="email"
                aria-invalid={actionData?.errors?.email ? true : undefined}
                autoFocus={true}
                autoComplete="email"
              />
              {actionData?.errors?.email && <div id="email-error">{actionData.errors.email}</div>}
            </div>
          </div>

          <div>
            <label htmlFor={"password"}>Password</label>
            <div>
              <Input
                id="password"
                name="password"
                ref={passwordRef}
                type="password"
                minLength={8}
                autoComplete="current-password"
                aria-describedby="password-error"
                aria-invalid={actionData?.errors?.password ? true : undefined}
              />
              {actionData?.errors?.password && <div id="password-error">{actionData.errors.password}</div>}
            </div>
          </div>

          <input type="hidden" name="redirectTo" value={redirectTo} />
          <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
            <SubmitButton type="submit">Log in</SubmitButton>
          </div>
          <ForgotPasswordLink to="/forgot-password">Forgot your password?</ForgotPasswordLink>
        </Stack>
      </Form>
      <h2>Use your socials</h2>
      {error && <p>{error}</p>}
      <SocialButton provider={SocialsProvider.GOOGLE} label="Log in with Google" />
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
