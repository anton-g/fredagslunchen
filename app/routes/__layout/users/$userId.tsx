import type { Prisma } from "@prisma/client";
import type { LoaderFunction } from "@remix-run/node";
import type { RecursivelyConvertDatesToStrings } from "~/utils";
import { json } from "@remix-run/node";
import { Link, useCatch, useLoaderData } from "@remix-run/react";
import invariant from "tiny-invariant";

import { getFullUserById } from "~/models/user.server";
import { requireUserId } from "~/session.server";
import styled from "styled-components";

type LoaderData = {
  user: NonNullable<Prisma.PromiseReturnType<typeof getFullUserById>>;
};

export const loader: LoaderFunction = async ({ request, params }) => {
  await requireUserId(request);
  invariant(params.userId, "userId not found");

  const user = await getFullUserById(params.userId);
  if (!user) {
    throw new Response("Not Found", { status: 404 });
  }
  return json<LoaderData>({ user });
};

export default function UserDetailsPage() {
  const data = useLoaderData() as RecursivelyConvertDatesToStrings<LoaderData>;

  return (
    <div>
      <Title>{data.user.name}</Title>
      <hr />
      <table>
        <thead>
          <tr>
            <th>Date</th>
            <th>Location</th>
            <th>Your score</th>
          </tr>
        </thead>
        <tbody>
          {data.user.scores.map((score) => (
            <tr key={score.id}>
              <td>{new Date(score.lunch.date).toLocaleDateString()}</td>
              <td>
                <Link
                  to={`/groups/${score.lunch.groupLocation.groupId}/locations/${score.lunch.groupLocation.locationId}`}
                >
                  {score.lunch.groupLocation.location.name}
                </Link>
              </td>
              <td>{score.score}</td>
            </tr>
          ))}
        </tbody>
      </table>
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
