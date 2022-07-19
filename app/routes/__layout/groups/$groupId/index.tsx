import type { LoaderArgs } from "@remix-run/node";
import { formatNumber, getAverageNumber } from "~/utils";
import { json } from "@remix-run/node";
import { useCatch, useLoaderData } from "@remix-run/react";
import invariant from "tiny-invariant";

import { getGroupDetails } from "~/models/group.server";
import { requireUserId } from "~/session.server";
import { Link } from "react-router-dom";
import styled from "styled-components";
import { Table } from "~/components/Table";
import { Spacer } from "~/components/Spacer";
import { LinkButton } from "~/components/Button";
import { Stat } from "~/components/Stat";

export const loader = async ({ request, params }: LoaderArgs) => {
  const userId = await requireUserId(request);
  invariant(params.groupId, "groupId not found");

  const details = await getGroupDetails({ userId, id: params.groupId });
  if (!details) {
    throw new Response("Not Found", { status: 404 });
  }
  return json({ details });
};

export default function GroupDetailsPage() {
  const { details } = useLoaderData<typeof loader>();

  return (
    <div>
      <Stats>
        <Stat label="Average score" value={details.stats.averageScore} />
        <Stat
          label="Best score"
          value={`${details.stats.bestLocation.name || "N/A"}`}
          detail={
            details.stats.bestLocation.name
              ? formatNumber(details.stats.bestLocation.score, 10)
              : undefined
          }
        />
        <Stat
          label="Worst score"
          value={`${details.stats.worstLocation.name || "N/A"}`}
          detail={
            details.stats.worstLocation.name
              ? formatNumber(details.stats.worstLocation.score, 10)
              : undefined
          }
        />
        <Stat
          label="Most positive"
          value={`${
            details.stats.mostPositive ? details.stats.mostPositive.name : "N/A"
          }`}
          detail={
            details.stats.mostPositive
              ? formatNumber(details.stats.mostPositive.score)
              : undefined
          }
        />
        <Stat
          label="Most negative"
          value={`${
            details.stats.mostNegative ? details.stats.mostNegative.name : "N/A"
          }`}
          detail={
            details.stats.mostNegative
              ? formatNumber(details.stats.mostNegative.score)
              : undefined
          }
        />
        <Stat
          label="Most average"
          value={`${
            details.stats.mostAvarage ? details.stats.mostAvarage.name : "N/A"
          }`}
          detail={
            details.stats.mostAvarage
              ? formatNumber(details.stats.mostAvarage.score)
              : undefined
          }
        />
      </Stats>
      <Spacer size={48} />
      <SectionHeader>
        <Subtitle>Members</Subtitle>
        <ActionBar>
          <LinkButton to={`/groups/${details.group.id}/invite`}>
            Invite user
          </LinkButton>
        </ActionBar>
      </SectionHeader>
      <Spacer size={8} />
      <Table>
        <Table.Head>
          <tr>
            <Table.Heading>Name</Table.Heading>
            <Table.Heading numeric>Lunches</Table.Heading>
            <Table.Heading numeric>Average score</Table.Heading>
            <Table.Heading>Favorite lunch</Table.Heading>
            <Table.Heading>Worst lunch</Table.Heading>
          </tr>
        </Table.Head>
        <tbody>
          {details.group.members.map((member) => (
            <tr key={member.userId}>
              <Table.Cell>
                <Link to={`/users/${member.userId}`}>{member.user.name}</Link>
              </Table.Cell>
              <Table.Cell numeric>{member.stats.lunchCount}</Table.Cell>
              <Table.Cell numeric>
                {formatNumber(member.stats.averageScore)}
              </Table.Cell>
              <Table.Cell>{member.stats.highestScore}</Table.Cell>
              <Table.Cell>{member.stats.lowestScore}</Table.Cell>
            </tr>
          ))}
        </tbody>
      </Table>
      <Spacer size={48} />
      <SectionHeader>
        <Subtitle>Lunches</Subtitle>
        <ActionBar>
          <LinkButton to={`/groups/${details.group.id}/lunches/new`}>
            New lunch
          </LinkButton>
          <LinkButton to={`/groups/${details.group.id}/locations/new`}>
            New location
          </LinkButton>
        </ActionBar>
      </SectionHeader>
      <Spacer size={8} />
      <Table>
        <Table.Head>
          <tr>
            <Table.Heading>Date</Table.Heading>
            <Table.Heading>Location</Table.Heading>
            <Table.Heading>Choosen by</Table.Heading>
            <Table.Heading numeric>Average score</Table.Heading>
          </tr>
        </Table.Head>
        <tbody>
          {details.group.groupLocations.flatMap((loc) =>
            loc.lunches.map((lunch) => (
              <tr key={lunch.id}>
                <Table.Cell>
                  <Link to={`/groups/${details.group.id}/lunches/${lunch.id}`}>
                    {new Date(lunch.date).toLocaleDateString()}
                  </Link>
                </Table.Cell>
                <Table.Cell>
                  <Link
                    to={`/groups/${details.group.id}/locations/${loc.locationId}`}
                  >
                    {loc.location.name}
                  </Link>
                </Table.Cell>
                <Table.Cell>
                  <Link to={`/users/${lunch.choosenBy.id}`}>
                    {lunch.choosenBy.name}
                  </Link>
                </Table.Cell>
                <Table.Cell numeric>
                  {formatNumber(getAverageNumber(lunch.scores, "score"))}
                </Table.Cell>
              </tr>
            ))
          )}
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

const ActionBar = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: 16px;
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

const SectionHeader = styled.div`
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
`;
