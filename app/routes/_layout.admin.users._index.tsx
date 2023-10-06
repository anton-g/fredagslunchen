import type { LoaderFunctionArgs } from "@remix-run/node"
import { json } from "@remix-run/node"
import { useLoaderData } from "@remix-run/react"
import styled from "styled-components"
import { Spacer } from "~/components/Spacer"
import { Table } from "~/components/Table"
import { getAllAnonymousUsers, getAllUsers } from "~/models/user.server"
import { requireAdminUserId } from "~/session.server"
import { format } from "date-fns"

export const loader = async ({ request }: LoaderFunctionArgs) => {
  await requireAdminUserId(request)

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
            <Table.Heading numeric>Clubs</Table.Heading>
            <Table.Heading numeric>Ratings</Table.Heading>
            <Table.Heading>Last login</Table.Heading>
          </tr>
        </Table.Head>
        <tbody>
          {users.map((user) => (
            <Table.LinkRow key={user.id} to={`/admin/users/${user.id}`}>
              <Table.Cell>{user.name}</Table.Cell>
              <Table.Cell>
                {user.email?.email} {user.email?.verified ? "☑️" : ""}
              </Table.Cell>
              <Table.Cell numeric>{user.groups.length}</Table.Cell>
              <Table.Cell numeric>{user.scores.length}</Table.Cell>
              <Table.Cell>{user.lastLogin ? format(new Date(user.lastLogin), "yyyy-MM-dd") : "-"}</Table.Cell>
            </Table.LinkRow>
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
