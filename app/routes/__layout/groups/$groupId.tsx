import type { Prisma } from "@prisma/client";
import type { LoaderFunction } from "@remix-run/node";
import type { RecursivelyConvertDatesToStrings } from "~/utils";
import { json } from "@remix-run/node";
import { useCatch, useLoaderData } from "@remix-run/react";
import invariant from "tiny-invariant";

import { getGroup } from "~/models/group.server";
import { requireUserId } from "~/session.server";
import { Link } from "react-router-dom";
import styled from "styled-components";
import { Table } from "~/components/Table";

type LoaderData = {
  group: NonNullable<Prisma.PromiseReturnType<typeof getGroup>>;
};

export const loader: LoaderFunction = async ({ request, params }) => {
  const userId = await requireUserId(request);
  invariant(params.groupId, "groupId not found");

  const group = await getGroup({ userId, id: params.groupId });
  if (!group) {
    throw new Response("Not Found", { status: 404 });
  }
  return json<LoaderData>({ group });
};

export default function GroupDetailsPage() {
  const data = useLoaderData() as RecursivelyConvertDatesToStrings<LoaderData>;

  return (
    <div>
      <Title>{data.group.name}</Title>
      <hr />
      <ul>
        {data.group.users.map((user) => (
          <li key={user.userId}>
            <Link to={`/users/${user.userId}`}>{user.user.name}</Link>
          </li>
        ))}
      </ul>
      <hr />
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
          {data.group.groupLocations.flatMap((loc) =>
            loc.lunches.map((lunch) => (
              <tr key={lunch.id}>
                <Table.Cell>
                  {new Date(lunch.date).toLocaleDateString()}
                </Table.Cell>
                <Table.Cell>
                  <Link
                    to={`/groups/${data.group.id}/locations/${loc.locationId}`}
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
