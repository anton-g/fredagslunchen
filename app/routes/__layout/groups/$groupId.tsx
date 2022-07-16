import type { Prisma } from "@prisma/client";
import type { LoaderFunction } from "@remix-run/node";
import type { RecursivelyConvertDatesToStrings } from "~/utils";
import { json } from "@remix-run/node";
import { useCatch, useLoaderData } from "@remix-run/react";
import invariant from "tiny-invariant";

import { getGroup, getGroupDetails } from "~/models/group.server";
import { requireUserId } from "~/session.server";
import { Link } from "react-router-dom";
import styled from "styled-components";
import { Table } from "~/components/Table";
import { SeedAvatar } from "~/components/Avatar";
import { Spacer } from "~/components/Spacer";
import { LinkButton } from "~/components/Button";
import { Stat } from "~/components/Stat";

type LoaderData = {
  details: NonNullable<Prisma.PromiseReturnType<typeof getGroupDetails>>;
};

export const loader: LoaderFunction = async ({ request, params }) => {
  const userId = await requireUserId(request);
  invariant(params.groupId, "groupId not found");

  const details = await getGroupDetails({ userId, id: params.groupId });
  if (!details) {
    throw new Response("Not Found", { status: 404 });
  }
  return json<LoaderData>({ details });
};

export default function GroupDetailsPage() {
  const { details } =
    useLoaderData() as RecursivelyConvertDatesToStrings<LoaderData>;

  return (
    <div>
      <Title>{details.group.name}</Title>
      <Spacer size={8} />
      <UsersList>
        {details.group.users.map((user) => (
          <li key={user.userId}>
            <Link to={`/users/${user.userId}`}>
              <SeedAvatar seed={user.userId} />
            </Link>
          </li>
        ))}
      </UsersList>
      <Spacer size={24} />
      <Stats>
        <Stat label="Average score" value={details.stats.averageScore} />
        <Stat label="Best score" value={"WokHouse"} />
        <Stat label="Worst score" value={"Franzén"} />
        <Stat label="Most positive" value={"N/A"} />
        <Stat label="Most negative" value={"N/A"} />
        <Stat label="Most average" value={"N/A"} />
      </Stats>
      <Spacer size={24} />
      <ActionBar>
        <LinkButton to="/">Add user</LinkButton>
        <LinkButton to={`/groups/${details.group.id}/lunches/new`}>
          New lunch
        </LinkButton>
      </ActionBar>
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
                  {lunch.scores.reduce((acc, cur) => acc + cur.score, 0) /
                    lunch.scores.length}
                </Table.Cell>
              </tr>
            ))
          )}
        </tbody>
      </Table>
      <Spacer size={124} />
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
`;

const UsersList = styled.ul`
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  gap: 16px;
`;

const ActionBar = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: 16px;
`;

const Stats = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
  gap: 24px;
  max-width: 600px;
`;
