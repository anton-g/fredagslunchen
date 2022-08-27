import type { MouseEventHandler, ReactNode } from "react"
import { useEffect, useRef, useState } from "react"
import styled from "styled-components"
import type { Group, Lunch, Score, ScoreRequest, User } from "@prisma/client"
import { json, redirect } from "@remix-run/node"
import type { ActionFunction, LoaderArgs } from "@remix-run/node"
import {
  Form,
  Link,
  useCatch,
  useFetcher,
  useLoaderData,
} from "@remix-run/react"
import invariant from "tiny-invariant"
import type { RecursivelyConvertDatesToStrings } from "~/utils"
import { formatNumber, getAverageNumber, shorten, formatTimeAgo } from "~/utils"
import { Cross2Icon } from "@radix-ui/react-icons"
import { requireUserId } from "~/session.server"
import { deleteLunch, getGroupLunch } from "~/models/lunch.server"
import { Spacer } from "~/components/Spacer"
import { Stat } from "~/components/Stat"
import { Table } from "~/components/Table"
import { Input } from "~/components/Input"
import { ComboBox, Item, Label } from "~/components/ComboBox"
import { TextArea } from "~/components/TextArea"
import { Stack } from "~/components/Stack"
import { Button } from "~/components/Button"
import { Tooltip } from "~/components/Tooltip"
import { Dialog } from "~/components/Dialog"
import { StatsGrid } from "~/components/StatsGrid"
import { Help } from "~/components/Help"

export const loader = async ({ request, params }: LoaderArgs) => {
  const userId = await requireUserId(request)
  invariant(params.groupId, "groupId not found")
  invariant(params.lunchId, "lunchId not found")

  const groupLunch = await getGroupLunch({
    id: parseInt(params.lunchId),
  })

  const isAdmin = groupLunch?.groupLocation.group.members.some(
    (m) => m.userId === userId && m.role === "ADMIN"
  )

  if (!groupLunch) {
    throw new Response("Not Found", { status: 404 })
  }
  return json({ groupLunch, isAdmin, userId })
}

export const action: ActionFunction = async ({ request, params }) => {
  if (request.method !== "DELETE") return null

  const userId = await requireUserId(request)
  invariant(params.lunchId, "lunchId not found")
  invariant(params.groupId, "groupId not found")

  await deleteLunch({
    id: parseInt(params.lunchId),
    requestedByUserId: userId,
  })

  return redirect(`/groups/${params.groupId}`)
}

export default function LunchDetailsPage() {
  const { groupLunch, isAdmin, userId } = useLoaderData<typeof loader>()

  const scores = groupLunch.scores

  const sortedScores = groupLunch.scores
    .slice()
    .sort((a, b) => a.score - b.score)
  const lowestScore = sortedScores[0]?.score
  const highestScore = sortedScores[sortedScores.length - 1]?.score

  const averageScore =
    scores.length > 0 ? formatNumber(getAverageNumber(scores, "score")) : "-"

  const usersWithoutScoresOrRequests = groupLunch.groupLocation.group.members
    .filter((x) => !groupLunch.scores.find((s) => s.userId === x.userId))
    .filter(
      (x) =>
        !groupLunch.scoreRequests.find(
          (r) => r.userId !== userId && r.userId === x.userId
        )
    )
    .map((x) => x.user)

  return (
    <div>
      <Title>
        <span title={groupLunch.date.split("T")[0]}>
          {formatTimeAgo(new Date(groupLunch.date))}
        </span>{" "}
        at{" "}
        <Link
          to={`/groups/${groupLunch.groupLocationGroupId}/locations/${groupLunch.groupLocationLocationId}`}
        >
          {groupLunch.groupLocation.location.name}
        </Link>
      </Title>
      <Spacer size={24} />
      <StatsGrid>
        <Stat label="Average score" value={averageScore} />
        <Stat label="Highest score" value={highestScore || "-"} />
        <Stat label="Lowest score" value={lowestScore || "-"} />
        <Stat
          label="Choosen by"
          value={groupLunch.choosenBy.name}
          to={`/users/${groupLunch.choosenByUserId}`}
        />
      </StatsGrid>
      <Spacer size={24} />
      {(scores.length > 0 || groupLunch.scoreRequests.length > 0) && (
        <>
          <Subtitle>Scores</Subtitle>
          <Spacer size={16} />
          <Table>
            <Table.Head>
              <tr>
                <Table.Heading>By</Table.Heading>
                <Table.Heading numeric>Score</Table.Heading>
                <Table.Heading>Comment</Table.Heading>
                <Table.Heading></Table.Heading>
              </tr>
            </Table.Head>
            <tbody>
              {scores.map((score) => (
                <ScoreRow key={score.id}>
                  <Table.Cell>
                    <Link to={`/users/${score.userId}`}>{score.user.name}</Link>
                  </Table.Cell>
                  <Table.Cell numeric>{score.score}</Table.Cell>
                  <Table.Cell title={score.comment ?? undefined}>
                    {shorten(score.comment)}
                  </Table.Cell>
                  <Table.Cell
                    style={{ maxWidth: 130, textAlign: "end", paddingRight: 0 }}
                  >
                    {(isAdmin || score.userId === userId) && (
                      <ScoreDeleteAction
                        scoreId={score.id}
                        description={
                          <>
                            {score.user.name} gave{" "}
                            {groupLunch.groupLocation.location.name} a score of{" "}
                            {score.score}.<br />
                            This action is <strong>irreversible.</strong>
                          </>
                        }
                      />
                    )}
                  </Table.Cell>
                </ScoreRow>
              ))}
              {groupLunch.scoreRequests.map((request) => (
                <ScoreRow key={request.userId}>
                  <Table.Cell>
                    <Link to={`/users/${request.userId}`}>
                      {request.user.name}
                    </Link>
                  </Table.Cell>
                  <Table.Cell numeric>Requested</Table.Cell>
                  <Table.Cell></Table.Cell>
                  <Table.Cell
                    style={{ maxWidth: 130, textAlign: "end", paddingRight: 0 }}
                  >
                    <ScoreRequestDeleteAction requestId={request.id} />
                  </Table.Cell>
                </ScoreRow>
              ))}
            </tbody>
          </Table>
        </>
      )}
      <Spacer size={24} />
      {usersWithoutScoresOrRequests.length > 0 && (
        <>
          <Subtitle>New score</Subtitle>
          <Spacer size={8} />
          <NewScoreForm
            users={usersWithoutScoresOrRequests}
            lunchId={groupLunch.id}
            groupId={groupLunch.groupLocationGroupId}
            userId={userId}
          />
        </>
      )}
      {isAdmin && (
        <>
          <Spacer size={48} />
          <AdminActions />
        </>
      )}
      <Spacer size={128} />
    </div>
  )
}

export function ErrorBoundary({ error }: { error: Error }) {
  console.error(error)

  return <div>An unexpected error occurred: {error.message}</div>
}

export function CatchBoundary() {
  const caught = useCatch()

  if (caught.status === 404) {
    return <div>Group not found</div>
  }

  throw new Error(`Unexpected caught response with status: ${caught.status}`)
}

const Title = styled.h2`
  font-size: 48px;
  margin: 0;

  ::first-letter {
    text-transform: uppercase;
  }

  a:hover {
    text-decoration: underline;
  }
`

const Subtitle = styled.h3`
  margin: 0;
`

const ScoreDeleteAction = ({
  description,
  scoreId,
}: {
  description: ReactNode
  scoreId: Score["id"]
}) => {
  const fetcher = useFetcher()

  return (
    <Dialog>
      <Tooltip>
        <Tooltip.Trigger asChild>
          <Dialog.Trigger asChild>
            <DeleteButton aria-label="Delete score">
              <Cross2Icon></Cross2Icon>
            </DeleteButton>
          </Dialog.Trigger>
        </Tooltip.Trigger>
        <Tooltip.Content>Delete score</Tooltip.Content>
      </Tooltip>
      <Dialog.Content>
        <Dialog.Close />
        <Dialog.Title>Are you sure you want to delete this score?</Dialog.Title>
        <Dialog.Description>{description}</Dialog.Description>
        <fetcher.Form method="post" action="/scores/delete">
          <Button variant="large">I am sure</Button>
          <input type="hidden" name="scoreId" value={scoreId} />
        </fetcher.Form>
      </Dialog.Content>
    </Dialog>
  )
}

const ScoreRequestDeleteAction = ({
  requestId,
}: {
  requestId: ScoreRequest["id"]
}) => {
  const fetcher = useFetcher()

  return (
    <fetcher.Form method="post" action="/scores/request/delete">
      <input type="hidden" name="requestId" value={requestId} />
      <DeleteButton aria-label="Delete request for score">
        <Cross2Icon></Cross2Icon>
      </DeleteButton>
    </fetcher.Form>
  )
}

const DeleteButton = styled.button`
  all: unset;
  border: 2px solid transparent;
  border-radius: 50%;
  padding: 2px;
  opacity: 0;

  &:focus {
    outline: auto;
    opacity: 1;
  }
  &:hover {
    border-color: ${({ theme }) => theme.colors.primary};
  }
`

const ScoreRow = styled.tr`
  &:hover {
    ${DeleteButton} {
      opacity: 1;
    }
  }
`

type NewScoreFormProps = {
  users: RecursivelyConvertDatesToStrings<User>[]
  lunchId: Lunch["id"]
  groupId: Group["id"]
  userId: User["id"]
}

const NewScoreForm = ({
  users,
  lunchId,
  groupId,
  userId,
}: NewScoreFormProps) => {
  const scoreFetcher = useFetcher()
  const requestFetcher = useFetcher()
  const [selectedFrom, setSelectedFrom] = useState<string | null>(null)
  const [fromInputValue, setFromInputValue] = useState<string | null>(null)
  const formRef = useRef<HTMLFormElement>(null)
  const userRef = useRef<HTMLInputElement>(null!)
  const scoreRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (scoreFetcher.type === "done" && scoreFetcher.data.ok) {
      formRef.current?.reset()
    }

    const errors = scoreFetcher.data?.errors
    if (errors?.user) {
      userRef.current?.focus()
    } else if (errors?.score) {
      scoreRef.current?.focus()
    }
  }, [scoreFetcher])

  useEffect(() => {
    if (requestFetcher.type === "done" && requestFetcher.data.ok) {
      formRef.current?.reset()
    }

    const errors = requestFetcher.data?.errors
    if (errors?.user) {
      userRef.current?.focus()
    }
  }, [requestFetcher])

  const handleRequestScore: MouseEventHandler<HTMLButtonElement> = (e) => {
    e.preventDefault()
    requestFetcher.submit(
      { userId: selectedFrom || "", lunchId: `${lunchId}` },
      { method: "post", action: "/scores/request" }
    )
  }

  const isFromNewAnonymousUser = Boolean(
    fromInputValue &&
      !users.some((x) => x.name === fromInputValue) &&
      !selectedFrom
  )

  return (
    <scoreFetcher.Form
      method="post"
      action="/scores/new"
      ref={formRef}
      style={{
        width: "100%",
        display: "flex",
        flexDirection: "column",
        gap: 16,
        alignItems: "flex-end",
      }}
    >
      <input type="hidden" name="lunchId" value={lunchId} />
      <Stack gap={24} axis="horizontal" style={{ width: "100%" }}>
        <Stack gap={16} style={{ width: "100%" }}>
          <Stack gap={4}>
            <ComboBox
              label="From"
              name="user"
              defaultItems={users}
              menuTrigger="focus"
              inputRef={userRef}
              onSelectionChange={(key) => setSelectedFrom(key?.toString())}
              onBlur={(e: any) => setFromInputValue(e.target.value)}
              allowsCustomValue
              defaultSelectedKey={userId}
            >
              {(item) => (
                <Item textValue={item.name}>
                  <div>
                    <Label>{item.name}</Label>
                  </div>
                </Item>
              )}
            </ComboBox>
            {scoreFetcher.data?.errors?.user && (
              <div id="user-error">{scoreFetcher.data.errors.user}</div>
            )}
            {requestFetcher.data?.errors?.userId && (
              <div id="user-error">{requestFetcher.data.errors.userId}</div>
            )}
          </Stack>
          <label>
            <span>Score</span>
            <Input
              defaultValue={0}
              name="score"
              min={0}
              max={10}
              step={0.25}
              type="number"
              required
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
        </Stack>
        <div style={{ width: "100%" }}>
          <CommentLabel>
            <span>Comment</span>
            <TextArea name="comment" />
          </CommentLabel>
        </div>
      </Stack>
      <Stack
        axis="horizontal"
        gap={16}
        style={{ width: "100%", justifyContent: "flex-end" }}
      >
        <Stack axis="horizontal" gap={8} style={{ marginRight: "auto" }}>
          <Button form="request-form" onClick={handleRequestScore}>
            Request score
          </Button>
          <Help>
            By sending a score request the user will get a notification that
            they should submit their score. This will ignore any score and
            comment set above.
          </Help>
        </Stack>
        <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
          {isFromNewAnonymousUser && (
            <>
              You're creating a new anonymous user.
              <Help>
                <p>
                  Anonymous users are users without an account. Use these for
                  people that haven't yet created their account or the
                  occational guest that you don't really want in your group.
                </p>
                <p>
                  You can transfer the anonymous users data to their account
                  later.
                </p>
              </Help>
            </>
          )}
        </div>
        <Button>Save score</Button>
      </Stack>
      <input type="hidden" name="groupId" value={groupId} />
    </scoreFetcher.Form>
  )
}

const CommentLabel = styled.label`
  display: flex;
  flex-direction: column;
  height: 100%;

  textarea {
    flex-grow: 1;
  }
`

const AdminActions = () => {
  return (
    <Wrapper axis="horizontal" gap={16}>
      <Dialog>
        <Tooltip>
          <Tooltip.Trigger asChild>
            <Dialog.Trigger asChild>
              <Button variant="round" aria-label="Delete lunch">
                <Cross2Icon />
              </Button>
            </Dialog.Trigger>
          </Tooltip.Trigger>
          <Tooltip.Content>Delete lunch</Tooltip.Content>
        </Tooltip>
        <Dialog.Content>
          <Dialog.Close />
          <Dialog.Title>
            Are you sure you want to delete this lunch?
          </Dialog.Title>
          <DialogDescription>
            This will delete this lunch including all scores. This action is{" "}
            <strong>irreversible</strong>.
          </DialogDescription>
          <Form method="delete">
            <Button variant="large" style={{ marginLeft: "auto" }}>
              I am sure
            </Button>
          </Form>
        </Dialog.Content>
      </Dialog>
    </Wrapper>
  )
}

const Wrapper = styled(Stack)`
  justify-content: center;
`

const DialogDescription = styled(Dialog.Description)`
  > p {
    margin: 0;
    margin-bottom: 16px;
  }
`