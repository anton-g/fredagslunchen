import type { Prisma } from "@prisma/client";
import type { LoaderFunction } from "@remix-run/server-runtime";
import type { RecursivelyConvertDatesToStrings } from "~/utils";
import { useLoaderData, Link as RemixLink } from "@remix-run/react";
import { json } from "@remix-run/server-runtime";
import styled from "styled-components";
import { Spacer } from "~/components/Spacer";
import { Table } from "~/components/Table";
import { getFullUserById } from "~/models/user.server";
import { requireUserId } from "~/session.server";
import { useOptionalUser } from "~/utils";
import invariant from "tiny-invariant";

type LoaderData = {
  details: NonNullable<Prisma.PromiseReturnType<typeof getFullUserById>>;
  isYou: boolean;
};

export const loader: LoaderFunction = async ({ request, params }) => {
  const userId = await requireUserId(request);
  invariant(params.userId, "userId not found");

  const details = await getFullUserById(params.userId);
  if (!details) {
    throw new Response("Not Found", { status: 404 });
  }
  return json<LoaderData>({ details, isYou: userId === params.userId });
};

export default function Index() {
  const user = useOptionalUser();
  const data = useLoaderData() as RecursivelyConvertDatesToStrings<LoaderData>;

  if (!user) return null;

  const numberOfLunches = data.details.scores.length;
  const averageScore =
    data.details.scores.reduce((acc, cur) => acc + cur.score, 0) /
    data.details.scores.length;
  const sortedScores = data.details.scores
    .slice()
    .sort((a, b) => a.score - b.score);
  const lowestScore = sortedScores[0].lunch.groupLocation.location.name;
  const highestScore = sortedScores[1].lunch.groupLocation.location.name;

  return (
    <Wrapper>
      <Title>{data.isYou ? "You" : data.details.name}</Title>
      <Spacer size={24} />
      <Stats>
        <Stat>
          <h3>Number of lunches</h3>
          <span>{numberOfLunches}</span>
        </Stat>
        <Stat>
          <h3>Average score</h3>
          <span>{averageScore}</span>
        </Stat>
        <Stat>
          <h3>Lowest score</h3>
          <span>{lowestScore}</span>
        </Stat>
        <Stat>
          <h3>Highest score</h3>
          <span>{highestScore}</span>
        </Stat>
      </Stats>
      <Spacer size={64} />
      <Subtitle>Lunches</Subtitle>
      <Table>
        <Table.Head>
          <tr>
            <Table.Heading>Date</Table.Heading>
            <Table.Heading>Location</Table.Heading>
            <Table.Heading numeric>Score</Table.Heading>
            <Table.Heading>Comment</Table.Heading>
          </tr>
        </Table.Head>
        <tbody>
          {data.details.scores.map((score) => (
            <tr key={score.id}>
              <Table.Cell>{score.lunch.date}</Table.Cell>
              <Table.Cell>
                <RemixLink
                  to={`/groups/${score.lunch.groupLocation.groupId}/locations/${score.lunch.groupLocation.locationId}`}
                >
                  {score.lunch.groupLocation.location.name}
                </RemixLink>
              </Table.Cell>
              <Table.Cell numeric>{score.score}</Table.Cell>
              <Table.Cell>{score.comment}</Table.Cell>
            </tr>
          ))}
        </tbody>
      </Table>
    </Wrapper>
  );
}

const Wrapper = styled.div``;

const Title = styled.h2`
  font-size: 48px;
  margin: 0;
`;

const Subtitle = styled.h3`
  margin: 0;
  font-size: 36px;
  margin-bottom: 16px;
`;

const Stat = styled.div`
  display: flex;
  flex-direction: column;

  h3 {
    font-weight: normal;
    font-size: 14px;
    margin: 0;
  }

  span {
    font-weight: bold;
    font-size: 24px;
  }
`;

const Stats = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 24px;
  max-width: 400px;
`;
