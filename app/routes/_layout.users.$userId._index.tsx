import type { ActionFunctionArgs, LoaderFunctionArgs } from "@remix-run/server-runtime"
import { formatNumber, formatTimeAgo, getAverageNumber, shorten } from "~/utils"
import { useLoaderData, Link, Form, useActionData } from "@remix-run/react"
import { json } from "@remix-run/server-runtime"
import styled from "styled-components"
import { Spacer } from "~/components/Spacer"
import { SortableTable } from "~/components/SortableTable"
import { createEmailVerificationToken, getFullUserById, getUserPermissions } from "~/models/user.server"
import { getUserId, requireUserId } from "~/auth.server"
import invariant from "tiny-invariant"
import { UserAvatar } from "~/components/Avatar"
import { Stat } from "~/components/Stat"
import { StatsGrid } from "~/components/StatsGrid"
import { Button, LinkButton } from "~/components/Button"
import { Stack } from "~/components/Stack"
import { sendEmailVerificationEmail } from "~/services/email.server"
import { BrandText } from "~/components/BrandText"
import { isAfter, sub } from "date-fns"

export const loader = async ({ request, params }: LoaderFunctionArgs) => {
  const userId = await getUserId(request)
  invariant(params.userId, "userId not found")

  const user = await getFullUserById({
    id: params.userId,
    requestUserId: userId,
  })
  if (!user) {
    throw new Response("Not Found", { status: 404 })
  }

  const permissions = await getUserPermissions({ user, currentUserId: userId })

  const noPublicData = !user.groups.some((x) => x.group.public) && !permissions.view

  return json({
    user,
    isYou: userId === params.userId,
    emailVerificationPending:
      !user.email?.verified &&
      user.email?.verificationRequestTime &&
      isAfter(user.email.verificationRequestTime, sub(new Date(), { hours: 1 })),
    permissions,
    noPublicData,
  })
}

interface ActionData {
  ok: boolean
}

export const action = async ({ request }: ActionFunctionArgs) => {
  const userId = await requireUserId(request)

  const result = await createEmailVerificationToken({ id: userId })
  if (!result) return json<ActionData>({ ok: false })

  await sendEmailVerificationEmail(result.email, result.token)

  return json<ActionData>({ ok: true })
}

export default function Index() {
  const { user, isYou, permissions, noPublicData, emailVerificationPending } = useLoaderData<typeof loader>()
  const actionData = useActionData() as ActionData

  const sortedScores = user.scores.sort(
    (a, b) => new Date(b.lunch.date).getTime() - new Date(a.lunch.date).getTime(),
  )

  const verificationPending = Boolean(actionData?.ok || emailVerificationPending)
  return (
    <Wrapper>
      <Section>
        <TitleRow>
          <UserAvatar user={user} />
          <Title>{isYou ? "You" : user.name}</Title>
        </TitleRow>
        <Spacer size={24} />
        <Stack gap={16} axis="horizontal">
          {permissions.settings && <LinkButton to={`/users/${user.id}/settings`}>Settings</LinkButton>}
          {isYou && !user.email?.verified && (
            <Form method="post">
              <Stack gap={8} axis="horizontal">
                <Button disabled={verificationPending}>Verify your email</Button>
                {verificationPending && (
                  <span>
                    Check your email (and <BrandText>spam folder</BrandText>)
                  </span>
                )}
              </Stack>
            </Form>
          )}
        </Stack>
        <Spacer size={24} />
        {noPublicData ? (
          <Subtitle>Sorry, {user.name} has no public data.</Subtitle>
        ) : (
          <StatsGrid>
            <Stat label="Number of lunches" value={user.stats.lunchCount} />
            <Stat label="Average rating" value={formatNumber(user.stats.averageScore)} />
            <Stat
              label="Most popular choice"
              value={user.stats.bestChoosenLunch?.groupLocation.location.name || "-"}
              detail={
                user.stats.bestChoosenLunch
                  ? formatNumber(getAverageNumber(user.stats.bestChoosenLunch.scores, "score"))
                  : undefined
              }
              to={
                user.stats.bestChoosenLunch
                  ? `/groups/${user.stats.bestChoosenLunch.groupLocationGroupId}/lunches/${user.stats.bestChoosenLunch.id}`
                  : undefined
              }
            />
            <Stat
              label="Worst lunch"
              value={user.stats.lowestScore?.name || "-"}
              detail={user.stats.lowestScore?.score}
              to={
                user.stats.lowestScore
                  ? `/groups/${user.stats.lowestScore.groupId}/lunches/${user.stats.lowestScore.id}`
                  : undefined
              }
            />
            <Stat
              label="Favorite lunch"
              value={user.stats.highestScore?.name || "-"}
              detail={user.stats.highestScore?.score}
              to={
                user.stats.highestScore
                  ? `/groups/${user.stats.highestScore.groupId}/lunches/${user.stats.highestScore.id}`
                  : undefined
              }
            />
          </StatsGrid>
        )}
      </Section>
      <Spacer size={64} />
      {sortedScores.length > 0 && (
        <Section>
          <Subtitle>Lunches</Subtitle>
          <SortableTable
            data={sortedScores}
            defaultSort={{
              key: (row) => row.lunch.date,
              label: "Date",
            }}
            defaultDirection="desc"
            columns={[
              { label: "Date", key: (row) => row.lunch.date },
              { label: "Location", key: (row) => row.lunch.groupLocation.location.name },
              {
                label: "Rating",
                key: (row) => row.score,
                props: {
                  numeric: true,
                },
              },
              { label: "Club", key: (row) => row.lunch.groupLocation.group.name },
              { label: "Choosen by", key: (row) => (row.lunch.choosenBy ? row.lunch.choosenBy.name : "-") },
              { label: "Comment", key: (row) => row.comment },
            ]}
          >
            {(score) => (
              <SortableTable.LinkRow
                to={`/groups/${score.lunch.groupLocation.groupId}/lunches/${score.lunchId}`}
                key={score.id}
              >
                <SortableTable.Cell>
                  <Link to={`/groups/${score.lunch.groupLocation.groupId}/lunches/${score.lunchId}`}>
                    {formatTimeAgo(new Date(score.lunch.date))}
                  </Link>
                </SortableTable.Cell>
                <SortableTable.Cell>{score.lunch.groupLocation.location.name}</SortableTable.Cell>
                <SortableTable.Cell numeric>{score.score}</SortableTable.Cell>
                <SortableTable.Cell>{score.lunch.groupLocation.group.name}</SortableTable.Cell>
                <SortableTable.Cell>
                  {score.lunch.choosenBy ? score.lunch.choosenBy.name : "-"}
                </SortableTable.Cell>
                <SortableTable.Cell>{shorten(score.comment, { length: 30 })}</SortableTable.Cell>
              </SortableTable.LinkRow>
            )}
          </SortableTable>
        </Section>
      )}
      {user.role === "ANONYMOUS" && permissions.claim && (
        <>
          <Spacer size={128} />
          <Footer>
            <p>This is a user without an account.</p>
            <p>
              If this is you, you can <Link to={`/users/${user.id}/claim`}>claim its data</Link>.
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
