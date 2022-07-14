import type { Prisma } from "@prisma/client";
import type { LoaderFunction } from "@remix-run/node";
import type { RecursivelyConvertDatesToStrings } from "~/utils";
import { json } from "@remix-run/node";
import { useCatch, useLoaderData } from "@remix-run/react";
import invariant from "tiny-invariant";

import { requireUserId } from "~/session.server";
import styled from "styled-components";
import { getGroupLunch } from "~/models/lunch.server";

type LoaderData = {
  groupLunch: NonNullable<Prisma.PromiseReturnType<typeof getGroupLunch>>;
};

export const loader: LoaderFunction = async ({ request, params }) => {
  await requireUserId(request);
  invariant(params.groupId, "groupId not found");
  invariant(params.lunchId, "lunchId not found");

  const groupLunch = await getGroupLunch({
    groupId: params.groupId,
    id: params.lunchId,
  });

  if (!groupLunch) {
    throw new Response("Not Found", { status: 404 });
  }
  return json<LoaderData>({ groupLunch });
};

export default function LunchDetailsPage() {
  const { groupLunch } =
    useLoaderData() as RecursivelyConvertDatesToStrings<LoaderData>;

  return (
    <div>
      <Title>{groupLunch.date}</Title>
      {/* <Table>
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
      </Table> */}
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
