// Use this to create a new group with a single location and lunch
// Simply call this with:
// npx ts-node --require tsconfig-paths/register ./cypress/support/create-group.ts groupName userId
// and it will log out the group id value.

import faker from "@faker-js/faker"
import { installGlobals } from "@remix-run/node"
import { createGroup } from "~/models/group.server"
import { createGroupLocation } from "~/models/location.server"
import { createLunch } from "~/models/lunch.server"

installGlobals()

async function createGroupCommand(name: string, userId: string) {
  if (!name) {
    throw new Error("name required for login")
  }

  const group = await createGroup({ name, userId })
  const location = await createGroupLocation({
    discoveredById: userId,
    groupId: group.id,
    name: faker.company.companyName(),
    address: faker.address.streetAddress(),
    city: faker.address.city(),
    zipCode: faker.address.zipCode(),
    lat: faker.address.latitude(),
    lon: faker.address.longitude(),
    countryCode: faker.address.countryCode(),
    osmId: faker.datatype.uuid(),
    global: false,
  })
  await createLunch({
    date: faker.date.recent().toISOString(),
    choosenByUserId: userId,
    groupId: group.id,
    locationId: location.locationId,
  })

  // we log it like this so our cypress command can parse it
  console.log(
    `
<groupId>
  ${group.id}
</groupId>
  `.trim()
  )
}

createGroupCommand(process.argv[2], process.argv[3])
