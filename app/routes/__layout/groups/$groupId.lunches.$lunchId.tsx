import type { Prisma } from "@prisma/client";
import type { LoaderFunction } from "@remix-run/node";
import type { RecursivelyConvertDatesToStrings } from "~/utils";
import { formatTimeAgo } from "~/utils";
import { json } from "@remix-run/node";
import { Link, useCatch, useLoaderData } from "@remix-run/react";
import invariant from "tiny-invariant";

import { requireUserId } from "~/session.server";
import styled from "styled-components";
import { getGroupLunch } from "~/models/lunch.server";
import { Spacer } from "~/components/Spacer";
import { Stat } from "~/components/Stat";
import { Table } from "~/components/Table";

type LoaderData = {
  groupLunch: NonNullable<Prisma.PromiseReturnType<typeof getGroupLunch>>;
};

export const loader: LoaderFunction = async ({ request, params }) => {
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
  return json<LoaderData>({ groupLunch });
};

export default function LunchDetailsPage() {
  const { groupLunch } =
    useLoaderData() as RecursivelyConvertDatesToStrings<LoaderData>;

  const scores = groupLunch.scores;

  const sortedScores = groupLunch.scores
    .slice()
    .sort((a, b) => a.score - b.score);
  const lowestScore = sortedScores[0]?.score;
  const highestScore = sortedScores[1]?.score;

  const averageScore =
    scores.length > 0
      ? scores.reduce((acc, cur) => acc + cur.score, 0) / scores.length
      : "N/A";

  return (
    <div>
      <Title>
        <span title={groupLunch.date.split("T")[0]}>
          {formatTimeAgo(new Date(groupLunch.date))}
        </span>{" "}
        at {groupLunch.groupLocation.location.name}
      </Title>
      <Spacer size={24} />
      <Stats>
        <Stat label="Average score" value={averageScore} />
        <Stat label="Highest score" value={highestScore || "N/A"} />
        <Stat label="Lowest score" value={lowestScore || "N/A"} />
        <Stat label="Choosen by" value={groupLunch.choosenBy.name} />
      </Stats>
      <Spacer size={24} />
      <Subtitle>Scores</Subtitle>
      <Spacer size={16} />
      <Table>
        <Table.Head>
          <tr>
            <Table.Heading>By</Table.Heading>
            <Table.Heading>Score</Table.Heading>
          </tr>
        </Table.Head>
        <tbody>
          {scores.map((score) => (
            <tr key={score.id}>
              <Table.Cell>
                <Link to={`/users/${score.userId}`}>{score.user.name}</Link>
              </Table.Cell>
              <Table.Cell numeric>{score.score}</Table.Cell>
            </tr>
          ))}
        </tbody>
      </Table>
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
`;

const Stats = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
  gap: 24px;
  max-width: 600px;
`;

const Subtitle = styled.h3`
  margin: 0;
`;
