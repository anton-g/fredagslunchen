import type { LoaderArgs } from "@remix-run/node";
import { json } from "@remix-run/node";
import { NavLink, useLoaderData } from "@remix-run/react";
import styled from "styled-components";
import { LinkButton } from "~/components/Button";
import { Card } from "~/components/Card";
import { Spacer } from "~/components/Spacer";

import { getUserGroups } from "~/models/group.server";
import { requireUserId } from "~/session.server";

export const loader = async ({ request }: LoaderArgs) => {
  const userId = await requireUserId(request);
  const groups = await getUserGroups({ userId });
  return json({ groups });
};

export default function GroupsPage() {
  const data = useLoaderData<typeof loader>();

  return (
    <main>
      <div>
        {data.groups.length === 0 ? (
          <p>No groups yet</p>
        ) : (
          <GroupList>
            {data.groups.map((group) => (
              <li key={group.id}>
                <NavLink to={`/groups/${group.id}`}>
                  <Card>
                    <GroupTitle>{group.name}</GroupTitle>
                    {group.members.map((m) => m.user.name).join(", ")}
                  </Card>
                </NavLink>
              </li>
            ))}
          </GroupList>
        )}
      </div>
      <Spacer size={48} />
      <NewGroupLink to="new">+ New group</NewGroupLink>
    </main>
  );
}

const GroupList = styled.ul`
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 24px;
`;

const GroupTitle = styled.h2`
  margin: 0;
`;

const NewGroupLink = styled(LinkButton)`
  margin-left: auto;
`;
