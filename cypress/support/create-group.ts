// Use this to create a new group
// Simply call this with:
// npx ts-node --require tsconfig-paths/register ./cypress/support/create-group.ts groupName userId
// and it will log out the group id value.

import { installGlobals } from "@remix-run/node";
import { createGroup } from "~/models/group.server";

installGlobals();

async function createGroupCommand(name: string, userId: string) {
  if (!name) {
    throw new Error("name required for login");
  }

  const group = await createGroup({ name, userId });

  // we log it like this so our cypress command can parse it
  console.log(
    `
<groupId>
  ${group.id}
</groupId>
  `.trim()
  );
}

createGroupCommand(process.argv[2], process.argv[3]);
