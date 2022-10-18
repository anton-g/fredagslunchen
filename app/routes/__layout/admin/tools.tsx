import type { ActionFunction, LoaderArgs } from "@remix-run/node"
import { json } from "@remix-run/node"
import { Form } from "@remix-run/react"
import styled from "styled-components"
import { Button } from "~/components/Button"
import { Spacer } from "~/components/Spacer"
import { recreateDemoGroup } from "~/models/admin.server"
import { setAllUserAvatars } from "~/models/user.server"
import { requireUserId } from "~/session.server"

export const loader = async ({ request }: LoaderArgs) => {
  await requireUserId(request)

  return json({})
}

export const action: ActionFunction = async ({ request }) => {
  await requireUserId(request)

  const formData = await request.formData()
  const action = formData.get("action")

  if (typeof action !== "string" || action.length === 0) {
    return json({}, { status: 400 })
  }

  switch (action) {
    case "demo":
      await recreateDemoGroup()
      break
    case "avatars":
      await setAllUserAvatars()
      break
  }

  return json({ ok: true })
}

export default function AdminToolsPage() {
  return (
    <div>
      <Title>Tools</Title>
      <Form method="post">
        <input type="hidden" name="action" value="demo" />
        <Button>Recreate demo</Button>
      </Form>
      <Spacer size={16} />
      <Form method="post">
        <input type="hidden" name="action" value="avatars" />
        <Button>Set all user avatars</Button>
      </Form>
    </div>
  )
}

const Title = styled.h3`
  font-size: 24px;
  margin: 0;
  margin-bottom: 16px;
`
