import type { LoaderArgs } from "@remix-run/node"
import { json } from "@remix-run/node"
import { useLoaderData } from "@remix-run/react"
import styled from "styled-components"
import { Table } from "~/components/Table"
import { getAllGroups } from "~/models/group.server"
import { requireUserId } from "~/session.server"

export const loader = async ({ request }: LoaderArgs) => {
  await requireUserId(request)

  const groups = await getAllGroups()

  return json({ groups })
}

export default function AdminGroupsPage() {
  const { groups } = useLoaderData<typeof loader>()

  return (
    <div>
      <Title>Groups</Title>
      <Table>
        <Table.Head>
          <tr>
            <Table.Heading>Name</Table.Heading>
            <Table.Heading>Members</Table.Heading>
            <Table.Heading>Locations</Table.Heading>
            <Table.Heading>Lunches</Table.Heading>
            <Table.Heading>Scores</Table.Heading>
          </tr>
        </Table.Head>
        <tbody>
          {groups.map((group) => (
            <tr key={group.id}>
              <Table.Cell>{group.name}</Table.Cell>
              <Table.Cell numeric>{group.members.length}</Table.Cell>
              <Table.Cell numeric>{group.groupLocations.length}</Table.Cell>
              <Table.Cell numeric>
                {group.groupLocations.reduce(
                  (tot, cur) => tot + cur.lunches.length,
                  0
                )}
              </Table.Cell>
              <Table.Cell numeric>
                {group.groupLocations.reduce(
                  (tot, cur) =>
                    tot +
                    cur.lunches.reduce(
                      (tot2, cur2) => tot2 + cur2._count.scores,
                      0
                    ),
                  0
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
