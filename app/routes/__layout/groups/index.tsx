import type { LoaderFunction } from "@remix-run/node";
import { json } from "@remix-run/node";
import { Link, NavLink, useLoaderData } from "@remix-run/react";

import { getUserGroups } from "~/models/group.server";
import { requireUserId } from "~/session.server";

type LoaderData = {
  groups: Awaited<ReturnType<typeof getUserGroups>>;
};

export const loader: LoaderFunction = async ({ request }) => {
  const userId = await requireUserId(request);
  const groups = await getUserGroups({ userId });
  return json<LoaderData>({ groups });
};

export default function GroupsPage() {
  const data = useLoaderData() as LoaderData;

  return (
    <div>
      <main>
        <div>
          {data.groups.length === 0 ? (
            <p>No groups yet</p>
          ) : (
            <ol>
              {data.groups.map((group) => (
                <li key={group.id}>
                  <NavLink to={`/groups/${group.id}`}>{group.name}</NavLink>
                </li>
              ))}
            </ol>
          )}
        </div>
        <Link to="new">+ New group</Link>
      </main>
    </div>
  );
}
