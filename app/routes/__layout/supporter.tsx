import type {
  ActionFunction,
  LoaderFunction,
  MetaFunction,
} from "@remix-run/node"
import { json } from "@remix-run/node"

import { getUserId } from "~/session.server"
import styled from "styled-components"

export const loader: LoaderFunction = async ({ request }) => {
  await getUserId(request)
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
      <h2>Become a supporter</h2>
    </Wrapper>
  )
}

const Wrapper = styled.div`
  max-width: 430px;
  margin: 0 auto;
`
