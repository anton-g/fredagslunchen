import type { Lunch, User } from "@prisma/client";
import type { LoaderArgs } from "@remix-run/node";
import type { RecursivelyConvertDatesToStrings } from "~/utils";
import { formatNumber, getAverageNumber } from "~/utils";
import { formatTimeAgo } from "~/utils";
import { json } from "@remix-run/node";
import { Link, useCatch, useFetcher, useLoaderData } from "@remix-run/react";
import invariant from "tiny-invariant";

import { requireUserId } from "~/session.server";
import styled from "styled-components";
import { getGroupLunch } from "~/models/lunch.server";
import { Spacer } from "~/components/Spacer";
import { Stat } from "~/components/Stat";
import { Table } from "~/components/Table";
import { Input } from "~/components/Input";
import { ComboBox, Item, Label } from "~/components/ComboBox";
import { TextArea } from "~/components/TextArea";
import { Stack } from "~/components/Stack";
import { Button } from "~/components/Button";
import { useEffect, useRef } from "react";

export const loader = async ({ request, params }: LoaderArgs) => {
  await requireUserId(request);
  invariant(params.groupId, "groupId not found");
  invariant(params.lunchId, "lunchId not found");

  const groupLunch = await getGroupLunch({
    groupId: params.groupId,
    id: parseInt(params.lunchId),
  });

  if (!groupLunch) {
    throw new Response("Not Found", { status: 404 });
  }
  return json({ groupLunch });
};

export default function LunchDetailsPage() {
  const { groupLunch } = useLoaderData<typeof loader>();

  const scores = groupLunch.scores;

  const sortedScores = groupLunch.scores
    .slice()
    .sort((a, b) => a.score - b.score);
  const lowestScore = sortedScores[0]?.score;
  const highestScore = sortedScores[sortedScores.length - 1]?.score;

  const averageScore =
    scores.length > 0 ? formatNumber(getAverageNumber(scores, "score")) : "-";

  const usersWithoutScores = groupLunch.groupLocation.group.members
    .filter((x) => !groupLunch.scores.find((s) => s.userId === x.userId))
    .map((x) => x.user);

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
      <Stats>
        <Stat label="Average score" value={averageScore} />
        <Stat label="Highest score" value={highestScore || "-"} />
        <Stat label="Lowest score" value={lowestScore || "-"} />
        <Stat
          label="Choosen by"
          value={groupLunch.choosenBy.name}
          to={`/users/${groupLunch.choosenByUserId}`}
        />
      </Stats>
      <Spacer size={24} />
      {scores.length > 0 && (
        <>
          <Subtitle>Scores</Subtitle>
          <Spacer size={16} />
          <Table>
            <Table.Head>
              <tr>
                <Table.Heading>By</Table.Heading>
                <Table.Heading numeric>Score</Table.Heading>
                <Table.Heading>Comment</Table.Heading>
              </tr>
            </Table.Head>
            <tbody>
              {scores.map((score) => (
                <tr key={score.id}>
                  <Table.Cell>
                    <Link to={`/users/${score.userId}`}>{score.user.name}</Link>
                  </Table.Cell>
                  <Table.Cell numeric>{score.score}</Table.Cell>
                  <Table.Cell>{score.comment}</Table.Cell>
                </tr>
              ))}
            </tbody>
          </Table>
        </>
      )}
      <Spacer size={24} />
      {usersWithoutScores.length > 0 && (
        <>
          <Subtitle>New score</Subtitle>
          <Spacer size={8} />
          <NewScoreForm users={usersWithoutScores} lunchId={groupLunch.id} />
        </>
      )}
      <Spacer size={128} />
    </div>
  );
}

export function ErrorBoundary({ error }: { error: Error }) {
  console.error(error);

  return <div>An unexpected error occurred: {error.message}</div>;
}

export function CatchBoundary() {
  const caught = useCatch();

  if (caught.status === 404) {
    return <div>Group not found</div>;
  }

  throw new Error(`Unexpected caught response with status: ${caught.status}`);
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
`;

const Stats = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(auto, 175px));
  gap: 24px;
  width: 100%;
`;

const Subtitle = styled.h3`
  margin: 0;
`;

type NewScoreFormProps = {
  users: RecursivelyConvertDatesToStrings<User>[];
  lunchId: Lunch["id"];
};

const NewScoreForm = ({ users, lunchId }: NewScoreFormProps) => {
  const fetcher = useFetcher();
  const formRef = useRef<HTMLFormElement>(null);
  const userRef = useRef<HTMLInputElement>(null!);
  const scoreRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (fetcher.type === "done" && fetcher.data.ok) {
      formRef.current?.reset();
    }

    const errors = fetcher.data?.errors;
    if (errors?.user) {
      userRef.current?.focus();
    } else if (errors?.score) {
      scoreRef.current?.focus();
    }
  }, [fetcher]);

  return (
    <fetcher.Form
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
          <ComboBox
            label="From"
            name="user"
            defaultItems={users}
            // defaultSelectedKey={users[0].id}
            inputRef={userRef}
          >
            {(item) => (
              <Item textValue={item.name}>
                <div>
                  <Label>{item.name}</Label>
                </div>
              </Item>
            )}
          </ComboBox>
          {fetcher.data?.errors?.user && (
            <div id="user-error">{fetcher.data.errors.user}</div>
          )}
          <label>
            <span>Score</span>
            <Input
              defaultValue={0}
              name="score"
              min={0}
              max={10}
              type="number"
              ref={scoreRef}
              aria-invalid={fetcher.data?.errors?.score ? true : undefined}
              aria-errormessage={
                fetcher.data?.errors?.score ? "score-error" : undefined
              }
            />
          </label>
          {fetcher.data?.errors?.score && (
            <div id="score-error">{fetcher.data.errors.score}</div>
          )}
        </Stack>
        <div style={{ width: "100%" }}>
          <CommentLabel>
            <span>Comment</span>
            <TextArea name="comment" />
          </CommentLabel>
        </div>
      </Stack>
      <Button>Save score</Button>
    </fetcher.Form>
  );
};

const CommentLabel = styled.label`
  display: flex;
  flex-direction: column;
  height: 100%;

  textarea {
    flex-grow: 1;
  }
`;
