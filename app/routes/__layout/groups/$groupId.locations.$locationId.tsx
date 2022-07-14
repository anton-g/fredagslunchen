import type { Prisma } from "@prisma/client";
import type { LoaderFunction } from "@remix-run/node";
import type { RecursivelyConvertDatesToStrings } from "~/utils";
import { json } from "@remix-run/node";
import { Links, useCatch, useLoaderData } from "@remix-run/react";
import invariant from "tiny-invariant";

import { requireUserId } from "~/session.server";
import { Link } from "react-router-dom";
import { getGroupLocation } from "~/models/location.server";
import { Table } from "~/components/Table";
import styled from "styled-components";

type LoaderData = {
  groupLocation: NonNullable<Prisma.PromiseReturnType<typeof getGroupLocation>>;
};

export const loader: LoaderFunction = async ({ request, params }) => {
  const userId = await requireUserId(request);
  invariant(params.groupId, "groupId not found");
  invariant(params.locationId, "locationId not found");

  const groupLocation = await getGroupLocation({
    groupId: params.groupId,
    id: params.locationId,
  });
  console.log("test");
  if (!groupLocation) {
    throw new Response("Not Found", { status: 404 });
  }
  return json<LoaderData>({ groupLocation });
};

export default function GroupDetailsPage() {
  const { groupLocation } =
    useLoaderData() as RecursivelyConvertDatesToStrings<LoaderData>;

  return (
    <div>
      <Title>{groupLocation.location.name}</Title>
      <Table>
        <Table.Head>
          <tr>
            <Table.Heading>Date</Table.Heading>
            <Table.Heading>Choosen by</Table.Heading>
            <Table.Heading>Average score</Table.Heading>
          </tr>
        </Table.Head>
        <tbody>
          {groupLocation.lunches.map((lunch) => (
            <tr key={lunch.id}>
              <Table.Cell>
                {new Date(lunch.date).toLocaleDateString()}
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
  margin-bottom: 24px;
`;
