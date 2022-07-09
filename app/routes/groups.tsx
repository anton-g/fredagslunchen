import type { LoaderFunction } from "@remix-run/node";
import { json } from "@remix-run/node";
import { Form, Link, NavLink, Outlet, useLoaderData } from "@remix-run/react";

// import { requireUserId } from "~/session.server";
import { useUser } from "~/utils";
import { getAllGroups } from "~/models/group.server";

type LoaderData = {
  groups: Awaited<ReturnType<typeof getAllGroups>>;
};

export const loader: LoaderFunction = async ({ request }) => {
  // const userId = await requireUserId(request);
  const groups = await getAllGroups();
  return json<LoaderData>({ groups });
};

export default function GroupsPage() {
  const data = useLoaderData() as LoaderData;
  const user = useUser();

  return (
    <div>
      <header>
        <h1>
          <Link to=".">Groups</Link>
        </h1>
        <p>{user.email}</p>
        <Form action="/logout" method="post">
          <button type="submit">Logout</button>
        </Form>
      </header>

      <main>
        <div>
          <Link to="new">+ New group</Link>

          <hr />

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

        <div>
          <Outlet />
        </div>
      </main>
    </div>
  );
}
