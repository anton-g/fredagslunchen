import type { ActionFunction, LoaderArgs } from "@remix-run/node"
import { json } from "@remix-run/node"
import { Form } from "@remix-run/react"
import styled from "styled-components"
import { Button } from "~/components/Button"
import { recreateDemoGroup } from "~/models/admin.server"
import { requireUserId } from "~/session.server"

export const loader = async ({ request }: LoaderArgs) => {
  await requireUserId(request)

  return json({})
}

export const action: ActionFunction = async ({ request }) => {
  await requireUserId(request)

  await recreateDemoGroup()

  return json({ ok: true })
}

export default function AdminToolsPage() {
  return (
    <div>
      <Title>Tools</Title>
      <Form method="post">
        <Button>Recreate demo</Button>
      </Form>
    </div>
  )
}

const Title = styled.h3`
  font-size: 24px;
  margin: 0;
  margin-bottom: 16px;
`
