import type { LoaderArgs } from "@remix-run/node";
import { formatNumber } from "~/utils";
import { json } from "@remix-run/node";
import { useCatch, useLoaderData, Outlet } from "@remix-run/react";
import invariant from "tiny-invariant";

import { getGroupDetails } from "~/models/group.server";
import { requireUserId } from "~/session.server";
import { Link } from "react-router-dom";
import styled from "styled-components";
import { Table } from "~/components/Table";
import { SeedAvatar } from "~/components/Avatar";
import { Spacer } from "~/components/Spacer";
import { LinkButton } from "~/components/Button";
import { Stat } from "~/components/Stat";

export const loader = async ({ request, params }: LoaderArgs) => {
  const userId = await requireUserId(request);
  invariant(params.groupId, "groupId not found");

  const details = await getGroupDetails({ userId, id: params.groupId });
  if (!details) {
    throw new Response("Not Found", { status: 404 });
  }
  return json({ details });
};

export default function GroupDetailsPage() {
  const { details } = useLoaderData<typeof loader>();

  return (
    <div>
      <Title>
        <Link to={`/groups/${details.group.id}`}>{details.group.name}</Link>
      </Title>
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
      <Spacer size={36} />
      <Outlet />
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
