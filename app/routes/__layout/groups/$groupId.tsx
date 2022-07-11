import type { Prisma } from "@prisma/client";
import type { LoaderFunction } from "@remix-run/node";
import type { RecursivelyConvertDatesToStrings } from "~/utils";
import { json } from "@remix-run/node";
import { useCatch, useLoaderData } from "@remix-run/react";
import invariant from "tiny-invariant";

import { getGroup } from "~/models/group.server";
import { requireUserId } from "~/session.server";
import { Link } from "react-router-dom";

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
      <h3>{data.group.name}</h3>
      <hr />
      <ul>
        {data.group.users.map((user) => (
          <li key={user.userId}>
            <Link to={`/users/${user.userId}`}>{user.user.name}</Link>
          </li>
        ))}
      </ul>
      <hr />
      <table>
        <thead>
          <tr>
            <th>Date</th>
            <th>Location</th>
            <th>Choosen by</th>
            <th>Average score</th>
          </tr>
        </thead>
        <tbody>
          {data.group.locations.flatMap((loc) =>
            loc.lunches.map((lunch) => (
              <tr key={lunch.id}>
                <td>{new Date(lunch.date).toLocaleDateString()}</td>
                <td>{loc.location.name}</td>
                <td>{lunch.choosenBy.name}</td>
                <td>
                  {lunch.scores.reduce((acc, cur) => acc + cur.score, 0) /
                    lunch.scores.length}
                </td>
              </tr>
            ))
          )}
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
