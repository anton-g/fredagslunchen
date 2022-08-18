import type { Group, Location, Lunch, User } from "@prisma/client"

import { prisma } from "~/db.server"

export type { Location } from "@prisma/client"

export async function getGroupLunch({ id }: Pick<Location, "id">) {
  return await prisma.lunch.findUnique({
    where: { id },
    include: {
      choosenBy: true,
      scores: {
        include: {
          user: true,
        },
      },
      groupLocation: {
        include: {
          location: true,
          group: {
            include: {
              members: {
                include: {
                  user: true,
                },
              },
            },
          },
        },
      },
    },
  })
}

type CreateLunchInput = {
  date: string
  choosenByUserId: Lunch["choosenByUserId"]
  locationId: Location["id"]
  groupId: Group["id"]
}

export async function createLunch({
  date,
  choosenByUserId,
  locationId,
  groupId,
}: CreateLunchInput) {
  const groupLocation = await prisma.groupLocation.findFirst({
    where: {
      groupId,
      locationId,
    },
  })

  if (!groupLocation) throw "handle this"

  return await prisma.lunch.create({
    data: {
      date: new Date(date),
      choosenByUserId,
      groupLocationGroupId: groupId,
      groupLocationLocationId: locationId,
    },
  })
}

export async function deleteLunch({
  id,
  requestedByUserId,
}: {
  id: Lunch["id"]
  requestedByUserId: User["id"]
}) {
  await prisma.lunch.deleteMany({
    where: {
      id,
      groupLocation: {
        group: {
          members: {
            some: {
              userId: requestedByUserId,
              role: "ADMIN",
            },
          },
        },
      },
    },
  })
}
