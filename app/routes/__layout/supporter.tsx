import type { ActionFunction, LoaderFunction, MetaFunction } from "@remix-run/node"
import { redirect } from "@remix-run/node"
import { json } from "@remix-run/node"

import { getUserId } from "~/session.server"
import styled from "styled-components"
import { Button } from "~/components/Button"
import { Spacer } from "~/components/Spacer"
import { getEnv } from "~/env.server"

export const loader: LoaderFunction = async ({ request }) => {
  await getUserId(request)

  const ENV = getEnv()
  if (!ENV.ENABLE_PREMIUM) return redirect("/")

  return json({})
}

export const action: ActionFunction = async ({ request }) => {}

export const meta: MetaFunction = () => {
  return {
    title: "Become a Fredagslunchen supporter",
  }
}

export default function SupporterPage() {
  // const actionData = useActionData() as ActionData

  return (
    <Wrapper>
      <h2>Support Fredagslunchen</h2>
      <p>By supporting Fredagslunchen you help ensure its continued existence and further development.</p>
      <strong>Supporter</strong> costs <strong>10€ per year</strong> and as a token of gratitude for believing
      in us, you get some perks only available to Supporters:
      <ul>
        <li>Exclusive themes</li>
        <li>Custom avatars</li>
        <li>Advanced statistics</li>
      </ul>
      <p>It's okay if you decide to not become a supporter, but if you do, it would mean the world to us ♥</p>
      <Spacer size={16} />
      <Button size="huge" variant="inverted" style={{ margin: "0 auto" }}>
        Become a Supporter
      </Button>
      <Spacer size={24} />
      FAQ
    </Wrapper>
  )
}

const Wrapper = styled.div`
  max-width: 430px;
  margin: 0 auto;
`
