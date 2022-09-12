import type { ActionFunction, LoaderArgs } from "@remix-run/server-runtime"
import { formatNumber, formatTimeAgo } from "~/utils"
import { useLoaderData, Link, Form, useActionData } from "@remix-run/react"
import { json } from "@remix-run/server-runtime"
import styled from "styled-components"
import { Spacer } from "~/components/Spacer"
import { Table } from "~/components/Table"
import {
  createEmailVerificationToken,
  getFullUserById,
} from "~/models/user.server"
import { requireUserId } from "~/session.server"
import invariant from "tiny-invariant"
import { SeedAvatar } from "~/components/Avatar"
import { Stat } from "~/components/Stat"
import { StatsGrid } from "~/components/StatsGrid"
import { Button, LinkButton } from "~/components/Button"
import { Stack } from "~/components/Stack"
import { sendEmailVerificationEmail } from "~/services/mail.server"

export const loader = async ({ request, params }: LoaderArgs) => {
  const userId = await requireUserId(request)
  invariant(params.userId, "userId not found")

  const user = await getFullUserById({
    id: params.userId,
    requestUserId: userId,
  })
  if (!user) {
    throw new Response("Not Found", { status: 404 })
  }
  return json({ user, isYou: userId === params.userId })
}

interface ActionData {
  ok: boolean
}

export const action: ActionFunction = async ({ request }) => {
  const userId = await requireUserId(request)

  const result = await createEmailVerificationToken({ id: userId })
  if (!result) return json<ActionData>({ ok: false })

  await sendEmailVerificationEmail(result.email, result.token)

  return json<ActionData>({ ok: true })
}

export default function Index() {
  const { user, isYou } = useLoaderData<typeof loader>()
  const actionData = useActionData() as ActionData

  const sortedScores = user.scores.sort(
    (a, b) =>
      new Date(b.lunch.date).getTime() - new Date(a.lunch.date).getTime()
  )

  return (
    <Wrapper>
      <Section>
        <TitleRow>
          <SeedAvatar seed={user.id} />
          <Title>{isYou ? "You" : user.name}</Title>
        </TitleRow>
        <Spacer size={24} />
        <Stack gap={16} axis="horizontal">
          <LinkButton to={`/users/${user.id}/settings`}>Settings</LinkButton>
          {isYou && !user.email?.verified && (
            <Form method="post">
              <Stack gap={8} axis="horizontal">
                <Button disabled={actionData?.ok}>Verify your email</Button>
                {actionData?.ok && <span>Check your email (and spam)</span>}
              </Stack>
            </Form>
          )}
        </Stack>
        <Spacer size={24} />
        <StatsGrid>
          <Stat label="Number of lunches" value={user.stats.lunchCount} />
          <Stat
            label="Average rating"
            value={formatNumber(user.stats.averageScore)}
          />
          <Stat
            label="Most popular choice"
            value={
              user.stats.bestChoosenLunch?.groupLocation.location.name || "-"
            }
          />
          <Stat label="Lowest rating" value={user.stats.lowestScore} />
          <Stat label="Highest rating" value={user.stats.highestScore} />
        </StatsGrid>
      </Section>
      <Spacer size={64} />
      {sortedScores.length > 0 && (
        <Section>
          <Subtitle>Lunches</Subtitle>
          <Table>
            <Table.Head>
              <tr>
                <Table.Heading>Date</Table.Heading>
                <Table.Heading>Location</Table.Heading>
                <Table.Heading numeric>Rating</Table.Heading>
                <Table.Heading>Club</Table.Heading>
                <Table.Heading>Choosen by</Table.Heading>
                <Table.Heading>Comment</Table.Heading>
              </tr>
            </Table.Head>
            <tbody>
              {sortedScores.map((score) => (
                <Table.LinkRow
                  to={`/groups/${score.lunch.groupLocation.groupId}/lunches/${score.lunchId}`}
                  key={score.id}
                >
                  <Table.Cell>
                    <Link
                      to={`/groups/${score.lunch.groupLocation.groupId}/lunches/${score.lunchId}`}
                    >
                      {formatTimeAgo(new Date(score.lunch.date))}
                    </Link>
                  </Table.Cell>
                  <Table.Cell>
                    {score.lunch.groupLocation.location.name}
                  </Table.Cell>
                  <Table.Cell numeric>{score.score}</Table.Cell>
                  <Table.Cell>
                    {score.lunch.groupLocation.group.name}
                  </Table.Cell>
                  <Table.Cell>
                    {score.lunch.choosenBy ? score.lunch.choosenBy.name : "-"}
                  </Table.Cell>
                  <Table.Cell>{score.comment}</Table.Cell>
                </Table.LinkRow>
              ))}
            </tbody>
          </Table>
        </Section>
      )}
      {user.role === "ANONYMOUS" && (
        <>
          <Spacer size={128} />
          <Footer>
            <p>This is a user without an account.</p>
            <p>
              If this is you, you can{" "}
              <Link to={`/users/${user.id}/claim`}>claim its data</Link>.
            </p>
          </Footer>
        </>
      )}
    </Wrapper>
  )
}

const Wrapper = styled.div`
  display: flex;
  flex-direction: column;
`

const TitleRow = styled.div`
  display: flex;
  align-items: center;
  gap: 16px;
`

const Title = styled.h2`
  font-size: 48px;
  margin: 0;
`

const Subtitle = styled.h3`
  margin: 0;
  font-size: 36px;
  margin-bottom: 16px;
`

const Section = styled.div``

const Footer = styled.div`
  text-align: center;

  > p {
    margin: 0;
  }

  a {
    text-decoration: underline;
  }
`
