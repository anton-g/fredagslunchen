import { json } from "@remix-run/node"
import type { LoaderArgs } from "@remix-run/node"
import { Link, useFetcher, useLoaderData } from "@remix-run/react"
import styled from "styled-components"
import { Button, LinkButton } from "~/components/Button"
import { Spacer } from "~/components/Spacer"
import { getUserId } from "~/session.server"
import { getFullUserById } from "~/models/user.server"
import type { RecursivelyConvertDatesToStrings } from "~/utils"
import { formatTimeAgo } from "~/utils"
import { Card } from "~/components/Card"
import { Stack } from "~/components/Stack"
import { useEffect, useRef } from "react"
import { Input } from "~/components/Input"
import { TextArea } from "~/components/TextArea"

type FullUser = NonNullable<Awaited<ReturnType<typeof getFullUserById>>>
type ScoreRequest = RecursivelyConvertDatesToStrings<
  FullUser["scoreRequests"][0]
>

export const loader = async ({ request }: LoaderArgs) => {
  const userId = await getUserId(request)

  const user = userId
    ? await getFullUserById({ id: userId, requestUserId: userId })
    : null

  return json({
    user,
  })
}

export default function Index() {
  const { user } = useLoaderData<typeof loader>()

  if (!user) {
    return (
      <Wrapper>
        <Title style={{ textAlign: "center" }}>Welcome.</Title>
        <p>
          No more discussions about where to eat. Just get together with your
          friends or colleagues, discover new restaurants, have a lovely time,
          rate your lunch, soak in the statistics. And then do it all again.
        </p>
        <Spacer size={8} />
        <p style={{ fontWeight: "bold" }}>Enjoy Fredagslunchen.</p>
      </Wrapper>
    )
  }

  if (user.groups.length === 0) {
    return (
      <Wrapper>
        <Title style={{ textAlign: "center" }}>Welcome {user.name}!</Title>
        <p>
          <Link to="/groups/new">Create a new group</Link> to get started! You
          can create a group for whatever constellation of people you want. How
          about your team at work, that group of friends you always meet with
          over a bowl of ramen, or maybe a group just for you?
        </p>
        <Spacer size={24} />
        <LinkButton
          to="/groups/new"
          variant="large"
          style={{ margin: "0 auto" }}
        >
          Create your first group
        </LinkButton>
      </Wrapper>
    )
  }

  return (
    <Wrapper>
      <Title>Hello {user.name}!</Title>
      <Spacer size={16} />
      {user.scoreRequests.length > 0 && (
        <>
          <Subtitle>Score requests</Subtitle>
          <Stack gap={32}>
            {user.scoreRequests.map((request) => (
              <ScoreRequestCard request={request} key={request.id} />
            ))}
          </Stack>
        </>
      )}
    </Wrapper>
  )
}

const Wrapper = styled.div`
  display: flex;
  flex-direction: column;
  max-width: 450px;
  margin: 0 auto;

  > p {
    text-align: center;
    margin: 0;

    a {
      text-decoration: underline;
    }
  }
`

const Title = styled.h2`
  font-size: 32px;
  margin: 0;
  margin-bottom: 16px;
`

const Subtitle = styled.h3`
  font-size: 24px;
  margin: 0;
  margin-bottom: 16px;
`

const ScoreRequestCard = ({ request }: { request: ScoreRequest }) => {
  const scoreFetcher = useFetcher()
  const formRef = useRef<HTMLFormElement>(null)
  const scoreRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    const errors = scoreFetcher.data?.errors
    if (errors?.score) {
      scoreRef.current?.focus()
    }
  }, [scoreFetcher])

  return (
    <Card key={request.id}>
      <CardDescription>
        {request.requestedBy.name} requested your score for the{" "}
        <Link
          to={`/groups/${request.lunch.groupLocation.group.id}/lunches/${request.lunchId}`}
        >
          lunch at <strong>{request.lunch.groupLocation.location.name}</strong>
        </Link>{" "}
        with {request.lunch.groupLocation.group.name}{" "}
        {formatTimeAgo(new Date(request.lunch.date))}:
      </CardDescription>
      <scoreFetcher.Form
        method="post"
        action="/scores/new"
        ref={formRef}
        style={{
          width: "100%",
          display: "flex",
          flexDirection: "column",
          gap: 12,
          marginTop: 16,
        }}
      >
        <label>
          <span>Score</span>
          <Input
            defaultValue={0}
            name="score"
            min={0}
            max={10}
            step={0.25}
            type="number"
            ref={scoreRef}
            aria-invalid={scoreFetcher.data?.errors?.score ? true : undefined}
            aria-errormessage={
              scoreFetcher.data?.errors?.score ? "score-error" : undefined
            }
          />
        </label>
        {scoreFetcher.data?.errors?.score && (
          <div id="score-error">{scoreFetcher.data.errors.score}</div>
        )}
        <div style={{ width: "100%" }}>
          <CommentLabel>
            <span>Comment</span>
            <TextArea name="comment" />
          </CommentLabel>
        </div>
        <input type="hidden" name="user" value={request.userId} />
        <input type="hidden" name="user-key" value={request.userId} />
        <input type="hidden" name="lunchId" value={request.lunchId} />
        <input
          type="hidden"
          name="groupId"
          value={request.lunch.groupLocation.group.id}
        />
        <input
          type="hidden"
          name="redirectTo"
          value={`/groups/${request.lunch.groupLocation.group.id}/lunches/${request.lunchId}`}
        />
        <Button style={{ marginLeft: "auto" }}>Save score</Button>
      </scoreFetcher.Form>
    </Card>
  )
}

const CardDescription = styled.p`
  margin: 0;

  > a {
    text-decoration: underline;
  }
`

const CommentLabel = styled.label`
  display: flex;
  flex-direction: column;
  height: 100%;

  textarea {
    flex-grow: 1;
  }
`
