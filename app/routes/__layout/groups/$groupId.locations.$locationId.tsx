import type { Prisma } from "@prisma/client";
import type { LoaderFunction } from "@remix-run/node";
import type { RecursivelyConvertDatesToStrings } from "~/utils";
import { json } from "@remix-run/node";
import { Links, useCatch, useLoaderData } from "@remix-run/react";
import invariant from "tiny-invariant";

import { requireUserId } from "~/session.server";
import { Link } from "react-router-dom";
import { getGroupLocation } from "~/models/location.server";

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
      <h3>{groupLocation.location.name}</h3>
      <hr />
      <table>
        <thead>
          <tr>
            <th>Date</th>
            <th>Choosen by</th>
            <th>Average score</th>
          </tr>
        </thead>
        <tbody>
          {groupLocation.lunches.map((lunch) => (
            <tr key={lunch.id}>
              <td>{new Date(lunch.date).toLocaleDateString()}</td>
              <td>
                <Link to={`/users/${lunch.choosenBy.id}`}>
                  {lunch.choosenBy.name}
                </Link>
              </td>
              <td>
                {lunch.scores.reduce((acc, cur) => acc + cur.score, 0) /
                  lunch.scores.length}
              </td>
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
