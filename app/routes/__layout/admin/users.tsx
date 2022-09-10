import type { LoaderArgs } from "@remix-run/node"
import { json } from "@remix-run/node"
import { useLoaderData } from "@remix-run/react"
import styled from "styled-components"
import { Spacer } from "~/components/Spacer"
import { Table } from "~/components/Table"
import { getAllAnonymousUsers, getAllUsers } from "~/models/user.server"
import { requireUserId } from "~/session.server"

export const loader = async ({ request }: LoaderArgs) => {
  await requireUserId(request)

  const users = await getAllUsers()
  const anonymousUsers = await getAllAnonymousUsers()

  return json({ users, anonymousUsers })
}

export default function AdminUsersPage() {
  const { users, anonymousUsers } = useLoaderData<typeof loader>()

  return (
    <div>
      <Title>Users</Title>
      <Table>
        <Table.Head>
          <tr>
            <Table.Heading>Name</Table.Heading>
            <Table.Heading>Email</Table.Heading>
            <Table.Heading numeric>Groups</Table.Heading>
            <Table.Heading numeric>Ratings</Table.Heading>
          </tr>
        </Table.Head>
        <tbody>
          {users.map((user) => (
            <tr key={user.id}>
              <Table.Cell>{user.name}</Table.Cell>
              <Table.Cell>{user.email?.email}</Table.Cell>
              <Table.Cell numeric>{user.groups.length}</Table.Cell>
              <Table.Cell numeric>{user.scores.length}</Table.Cell>
            </tr>
          ))}
        </tbody>
      </Table>
      <Spacer size={24} />
      <Title>Anonymous users</Title>
      <Table>
        <Table.Head>
          <tr>
            <Table.Heading>Name</Table.Heading>
            <Table.Heading numeric>Ratings</Table.Heading>
          </tr>
        </Table.Head>
        <tbody>
          {anonymousUsers.map((user) => (
            <tr key={user.id}>
              <Table.Cell>{user.name}</Table.Cell>
              <Table.Cell numeric>{user.scores.length}</Table.Cell>
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
