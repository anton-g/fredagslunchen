import type { ActionFunctionArgs, LoaderFunctionArgs, MetaFunction } from "@remix-run/node"
import { json, redirect } from "@remix-run/node"
import { Form, Link, useActionData, useLocation, useSearchParams } from "@remix-run/react"
import * as React from "react"
import { getUserId, createUserSession } from "~/session.server"
import { parse } from "@conform-to/zod"
import { useForm, conform } from "@conform-to/react"
import { createUser, getUserByEmail } from "~/models/user.server"
import { safeRedirect } from "~/utils"
import { Stack } from "~/components/Stack"
import { Button } from "~/components/Button"
import { Input } from "~/components/Input"
import styled from "styled-components"
import { addUserToGroupWithInviteToken } from "~/models/group.server"
import { sendEmailVerificationEmail } from "~/services/email.server"
import { z } from "zod"
import { mergeMeta } from "~/merge-meta"

export const loader = async ({ request, params }: LoaderFunctionArgs) => {
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

const schema = z.object({
  email: z.string().min(1, "Email is required").email("Email is invalid"),
  password: z.string().min(8, "Password is too short"),
  name: z.string().min(1, "Name is required"),
  redirectTo: z.string().optional(),
})

export const action = async ({ request }: ActionFunctionArgs) => {
  const formData = await request.formData()

  const submission = parse(formData, { schema })
  if (!submission.value || submission.intent !== "submit") {
    return json(submission, { status: 400 })
  }

  const url = new URL(request.url)
  const inviteToken = url.searchParams.get("token")

  const existingUser = await getUserByEmail(submission.value.email)
  if (existingUser) {
    submission.error.email = ["This email already exists"]
    return json(submission, { status: 400 })
  }

  const { user, groupId } = await createUser(
    submission.value.email,
    submission.value.name,
    submission.value.password,
    inviteToken,
  )

  if (user.email?.verificationToken) {
    await sendEmailVerificationEmail(user.email.email, user.email.verificationToken)
  }

  return createUserSession({
    request,
    userId: user.id,
    redirectTo: groupId ? `/groups/${groupId}` : safeRedirect(submission.value.redirectTo, "/"),
  })
}

export const meta: MetaFunction = mergeMeta(() => [
  {
    title: "Sign up - Fredagslunchen",
  },
])

export default function Join() {
  const [searchParams] = useSearchParams()
  const redirectTo = searchParams.get("redirectTo") ?? undefined
  const lastSubmission = useActionData<typeof action>()
  const [form, { email, password, name }] = useForm({
    id: "signup-form",
    lastSubmission,
    shouldValidate: "onSubmit",
    onValidate: ({ formData }) => parse(formData, { schema }),
  })

  const location = useLocation()

  return (
    <Wrapper>
      <h2>Join the club</h2>
      {/* Workaround to include search to action: https://github.com/remix-run/remix/issues/3133 */}
      <Form method="post" {...form.props} action={`${location.pathname}${location.search}`}>
        <Stack gap={16}>
          <div>
            <label htmlFor={name.id}>Name</label>
            <div>
              <Input
                {...conform.input(name, { ariaAttributes: true })}
                autoFocus={true}
                autoComplete="name"
              />
              {name.error && <div id={`${name.id}-error`}>{name.error}</div>}
            </div>
          </div>

          <div>
            <label htmlFor={email.id}>Email address</label>
            <div>
              <Input
                {...conform.input(email, { type: "email", ariaAttributes: true })}
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
                autoComplete="new-password"
              />
              {password.error && <div id={`${password.id}-error`}>{password.error}</div>}
            </div>
          </div>

          <input type="hidden" name="redirectTo" value={redirectTo} />
          <div style={{ display: "flex" }}>
            <PrivacyLink to={"/privacy"}>Privacy Policy</PrivacyLink>
            <SubmitButton type="submit">Create Account</SubmitButton>
          </div>
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

const PrivacyLink = styled(Link)`
  &:hover {
    text-decoration: underline;
  }
`
