// Use this to delete a group by it's name
// Simply call this with:
// npx ts-node --require tsconfig-paths/register ./cypress/support/delete-group.ts name
// and that group will get deleted

import { installGlobals } from "@remix-run/node"
import { prisma } from "~/db.server"

installGlobals()

async function deleteGroup(name: string) {
  if (!name) {
    throw new Error("name required for deletion")
  }

  const group = await prisma.group.findFirstOrThrow({
    where: {
      name,
    },
  })

  if (!group) {
    throw new Error(`No group with name ${name}`)
  }

  await prisma.group.delete({ where: { id: group.id } })
}

deleteGroup(process.argv[2])
