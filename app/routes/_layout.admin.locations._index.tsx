import { GlobeIcon, MagnifyingGlassIcon, MixerHorizontalIcon } from "@radix-ui/react-icons"
import type { LoaderArgs } from "@remix-run/node"
import { json } from "@remix-run/node"
import { useLoaderData } from "@remix-run/react"
import { ExternalLinkButton, LinkButton } from "~/components/Button"
import { Table } from "~/components/Table"
import { getAllLocations } from "~/models/location.server"
import { requireAdminUserId } from "~/session.server"

export const loader = async ({ request }: LoaderArgs) => {
  await requireAdminUserId(request)

  const locations = await getAllLocations()

  return json({ locations })
}

export default function AdminLocationsPage() {
  const { locations } = useLoaderData<typeof loader>()

  return (
    <div>
      <Table>
        <Table.Head>
          <tr>
            <Table.Heading>
              <GlobeIcon />
            </Table.Heading>
            <Table.Heading>Name</Table.Heading>
            <Table.Heading>Address</Table.Heading>
            <Table.Heading>Zip</Table.Heading>
            <Table.Heading>City</Table.Heading>
            <Table.Heading>Country</Table.Heading>
            <Table.Heading>Clubs</Table.Heading>
            <Table.Heading>Lunches</Table.Heading>
            <Table.Heading></Table.Heading>
            <Table.Heading></Table.Heading>
          </tr>
        </Table.Head>
        <tbody>
          {locations.map((location) => (
            <tr key={location.id}>
              <Table.Cell>{location.global && <GlobeIcon />}</Table.Cell>
              <Table.Cell>{location.name}</Table.Cell>
              <Table.Cell>{location.address}</Table.Cell>
              <Table.Cell>{location.zipCode}</Table.Cell>
              <Table.Cell>{location.city}</Table.Cell>
              <Table.Cell>{location.countryCode}</Table.Cell>
              <Table.Cell numeric>{location.groupLocation.length}</Table.Cell>
              <Table.Cell numeric>
                {location.groupLocation.reduce((tot, cur) => tot + cur.lunches.length, 0)}
              </Table.Cell>
              <Table.Cell>
                <LinkButton to={`/admin/locations/${location.id}`}>
                  <MixerHorizontalIcon />
                </LinkButton>
              </Table.Cell>
              <Table.Cell>
                <ExternalLinkButton
                  href={`https://www.google.com/maps/search/${location.name}+${location.address}`}
                >
                  <MagnifyingGlassIcon />
                </ExternalLinkButton>
              </Table.Cell>
            </tr>
          ))}
        </tbody>
      </Table>
    </div>
  )
}
