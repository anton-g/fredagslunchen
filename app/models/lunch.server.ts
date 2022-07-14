import type { Group, Location } from "@prisma/client";

import { prisma } from "~/db.server";

export type { Location } from "@prisma/client";

export async function getGroupLunch({
  id,
  groupId,
}: Pick<Location, "id"> & {
  groupId: Group["id"];
}) {
  const groupLocation = await prisma.groupLocation.findFirst({
    where: { groupId: groupId, lunches: { some: { id } } },
    include: {
      discoveredBy: true,
      lunches: {
        include: {
          scores: {
            include: {
              user: true,
            },
          },
          choosenBy: true,
          groupLocation: {
            include: {
              location: true,
            },
          },
        },
      },
      location: true,
    },
  });

  return groupLocation?.lunches.find((x) => x.id === id);
}
