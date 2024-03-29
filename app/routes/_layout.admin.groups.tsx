import type { LoaderFunctionArgs } from "@remix-run/node"
import { json } from "@remix-run/node"
import { Link, useLoaderData } from "@remix-run/react"
import styled from "styled-components"
import { HoverCard } from "~/components/HoverCard"
import { Table } from "~/components/Table"
import { getAllGroups } from "~/models/group.server"
import { requireAdminUserId } from "~/auth.server"

export const loader = async ({ request }: LoaderFunctionArgs) => {
  await requireAdminUserId(request)

  const groups = await getAllGroups()

  return json({ groups })
}

export default function AdminGroupsPage() {
  const { groups } = useLoaderData<typeof loader>()

  return (
    <div>
      <Title>Clubs</Title>
      <Table>
        <Table.Head>
          <tr>
            <Table.Heading>Name</Table.Heading>
            <Table.Heading>Members</Table.Heading>
            <Table.Heading>Locations</Table.Heading>
            <Table.Heading>Lunches</Table.Heading>
            <Table.Heading>Ratings</Table.Heading>
          </tr>
        </Table.Head>
        <tbody>
          {groups.map((group) => (
            <tr key={group.id}>
              <Table.Cell title={group.id}>
                <Link to={`/groups/${group.id}`}>{group.name}</Link>
              </Table.Cell>
              <Table.Cell numeric>
                <HoverCard>
                  <HoverCard.Trigger>{group.members.length}</HoverCard.Trigger>
                  <HoverCard.Content>
                    <ul style={{ padding: "0px 8px" }}>
                      {group.members.map((member) => (
                        <li key={member.userId}>{member.user.name}</li>
                      ))}
                    </ul>
                  </HoverCard.Content>
                </HoverCard>
              </Table.Cell>
              <Table.Cell numeric>{group.groupLocations.length}</Table.Cell>
              <Table.Cell numeric>
                {group.groupLocations.reduce((tot, cur) => tot + cur.lunches.length, 0)}
              </Table.Cell>
              <Table.Cell numeric>
                {group.groupLocations.reduce(
                  (tot, cur) => tot + cur.lunches.reduce((tot2, cur2) => tot2 + cur2._count.scores, 0),
                  0,
                )}
              </Table.Cell>
            </tr>
          ))}
        </tbody>
      </Table>
    </div>
  )
}

const Title = styled.h3`
  font-size: 24px;
  margin: 0;
  margin-bottom: 16px;
`
