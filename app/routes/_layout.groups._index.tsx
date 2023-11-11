import type { LoaderFunctionArgs } from "@remix-run/node"
import { json } from "@remix-run/node"
import { NavLink, useLoaderData } from "@remix-run/react"
import styled from "styled-components"
import { UserAvatar } from "~/components/Avatar"
import { LinkButton } from "~/components/Button"
import { Card } from "~/components/Card"
import { Spacer } from "~/components/Spacer"

import { getUserGroups } from "~/models/group.server"
import { requireUserId } from "~/auth.server"
import { formatTimeAgo } from "~/utils"

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const userId = await requireUserId(request)
  const groups = await getUserGroups({ userId })
  return json({ groups })
}

export default function GroupsPage() {
  const data = useLoaderData<typeof loader>()

  return (
    <main>
      <h1>Your clubs</h1>
      <div>
        {data.groups.length === 0 ? (
          <>
            <GroupTitle>No clubs yet</GroupTitle>
            <p>Create a new club or ask for an invite to see them here!</p>
          </>
        ) : (
          <GroupList>
            {data.groups.map((group) => (
              <li key={group.id}>
                <NavLink to={`/groups/${group.id}`}>
                  <Card>
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        flexWrap: "wrap",
                      }}
                    >
                      <GroupTitle>{group.name}</GroupTitle>
                      <div
                        style={{ display: "flex", gap: group.members.length > 10 ? 4 : 8, flexWrap: "wrap" }}
                      >
                        {group.members.map((m) => (
                          <UserAvatar
                            key={m.userId}
                            user={m.user}
                            size={group.members.length > 10 ? "tiny" : "small"}
                          />
                        ))}
                      </div>
                    </div>
                    <Spacer size={8} />
                    {group.groupLocations.reduce((total, gl) => total + gl._count.lunches, 0)} lunches in{" "}
                    {group.groupLocations.length} locations since {formatTimeAgo(new Date(group.createdAt))}
                  </Card>
                </NavLink>
              </li>
            ))}
          </GroupList>
        )}
      </div>
      <Spacer size={48} />
      <NewGroupLink to="new">+ New club</NewGroupLink>
    </main>
  )
}

const GroupList = styled.ul`
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 24px;
`

const GroupTitle = styled.h2`
  margin: 0;
  font-size: 36px;
`

const NewGroupLink = styled(LinkButton)`
  margin-left: auto;
`
