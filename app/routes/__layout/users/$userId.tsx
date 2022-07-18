import type { LoaderArgs } from "@remix-run/server-runtime";
import { formatNumber, formatTimeAgo, getAverageNumber } from "~/utils";
import { useLoaderData, Link } from "@remix-run/react";
import { json } from "@remix-run/server-runtime";
import styled from "styled-components";
import { Spacer } from "~/components/Spacer";
import { Table } from "~/components/Table";
import { getFullUserById } from "~/models/user.server";
import { requireUserId } from "~/session.server";
import { useOptionalUser } from "~/utils";
import invariant from "tiny-invariant";
import { SeedAvatar } from "~/components/Avatar";
import { Stat } from "~/components/Stat";

export const loader = async ({ request, params }: LoaderArgs) => {
  const userId = await requireUserId(request);
  invariant(params.userId, "userId not found");

  const details = await getFullUserById(params.userId);
  if (!details) {
    throw new Response("Not Found", { status: 404 });
  }
  return json({ details, isYou: userId === params.userId });
};

export default function Index() {
  const user = useOptionalUser();
  const data = useLoaderData<typeof loader>();

  if (!user) return null;

  // TODO move stats calc to server?
  const numberOfLunches = data.details.scores.length;
  const averageScore = formatNumber(
    getAverageNumber(data.details.scores, "score")
  );
  const sortedScores = data.details.scores
    .slice()
    .sort((a, b) => a.score - b.score);
  const lowestScore =
    sortedScores[0]?.lunch.groupLocation.location.name || "N/A";
  const highestScore =
    sortedScores[sortedScores.length - 1]?.lunch.groupLocation.location.name ||
    "N/A";

  const bestChoosenLunch = data.details.choosenLunches.reduce<
    typeof data.details.choosenLunches[0] | null
  >((acc, cur) => {
    if (!acc) return cur;

    if (
      getAverageNumber(cur.scores, "score") >
      getAverageNumber(acc.scores, "score")
    ) {
      return cur;
    }

    return acc;
  }, null);

  return (
    <Wrapper>
      <Section>
        <TitleRow>
          <SeedAvatar seed={data.details.id} />
          <Title>{data.isYou ? "You" : data.details.name}</Title>
        </TitleRow>
        <Spacer size={24} />
        <Stats>
          <Stat label="Number of lunches" value={numberOfLunches} />
          <Stat label="Average score" value={averageScore} />
          <Stat
            label="Most popular choice"
            value={bestChoosenLunch?.groupLocation.location.name || "N/A"}
          />
          <Stat label="Lowest score" value={lowestScore} />
          <Stat label="Highest score" value={highestScore} />
        </Stats>
      </Section>
      <Spacer size={64} />
      <Section>
        <Subtitle>Lunches</Subtitle>
        <Table>
          <Table.Head>
            <tr>
              <Table.Heading>Date</Table.Heading>
              <Table.Heading>Location</Table.Heading>
              <Table.Heading numeric>Score</Table.Heading>
              <Table.Heading>Group</Table.Heading>
              <Table.Heading>Choosen by</Table.Heading>
              <Table.Heading>Comment</Table.Heading>
            </tr>
          </Table.Head>
          <tbody>
            {data.details.scores.map((score) => (
              <tr key={score.id}>
                <Table.Cell>
                  <Link
                    to={`/groups/${score.lunch.groupLocation.groupId}/lunches/${score.lunchId}`}
                  >
                    {formatTimeAgo(new Date(score.lunch.date))}
                  </Link>
                </Table.Cell>
                <Table.Cell>
                  <Link
                    to={`/groups/${score.lunch.groupLocation.groupId}/locations/${score.lunch.groupLocation.locationId}`}
                  >
                    {score.lunch.groupLocation.location.name}
                  </Link>
                </Table.Cell>
                <Table.Cell numeric>{score.score}</Table.Cell>
                <Table.Cell>
                  <Link to={`/groups/${score.lunch.groupLocationGroupId}`}>
                    {score.lunch.groupLocation.group.name}
                  </Link>
                </Table.Cell>
                <Table.Cell>
                  <Link to={`/users/${score.lunch.choosenBy.id}`}>
                    {score.lunch.choosenBy.name}
                  </Link>
                </Table.Cell>
                <Table.Cell>{score.comment}</Table.Cell>
              </tr>
            ))}
          </tbody>
        </Table>
      </Section>
    </Wrapper>
  );
}

const Wrapper = styled.div`
  display: flex;
  flex-direction: column;
`;

const TitleRow = styled.div`
  display: flex;
  align-items: center;
  gap: 16px;
`;

const Title = styled.h2`
  font-size: 48px;
  margin: 0;
`;

const Subtitle = styled.h3`
  margin: 0;
  font-size: 36px;
  margin-bottom: 16px;
`;

const Stats = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
  gap: 24px 48px;
  width: 100%;
  width: 100%;
`;

const Section = styled.div``;
