import type { Group, Location, Lunch, User } from "@prisma/client"
import { Prisma } from "@prisma/client"

import { prisma } from "~/db.server"
import { checkIsAdmin } from "./user.server"

export type { Lunch, Location } from "@prisma/client"

const fullLunch = Prisma.validator<Prisma.LunchArgs>()({
  include: {
    groupLocation: {
      include: {
        location: true,
      },
    },
    choosenBy: true,
  },
})
export type FullLunch = Prisma.LunchGetPayload<typeof fullLunch>

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
      scoreRequests: {
        include: {
          user: {
            select: {
              name: true,
              id: true,
            },
          },
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
  requestedByUserId: User["id"]
  isTakeaway: boolean
}

export async function createLunch({
  date,
  choosenByUserId,
  locationId,
  groupId,
  requestedByUserId,
  isTakeaway,
}: CreateLunchInput) {
  const groupLocation = await prisma.groupLocation.findFirst({
    where: {
      groupId,
      locationId,
      group: {
        members: {
          some: {
            userId: requestedByUserId,
          },
        },
      },
    },
  })

  if (!groupLocation) throw new Error("Tried to create lunch for invalid location")

  return await prisma.lunch.create({
    data: {
      date: new Date(date),
      choosenByUserId,
      groupLocationGroupId: groupId,
      groupLocationLocationId: locationId,
      isTakeaway,
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
  const requestedByAdmin = await checkIsAdmin(requestedByUserId)

  // TODO should really be able to write this in a less messy way
  await prisma.lunch.deleteMany({
    where: {
      id,
      ...(!requestedByAdmin
        ? {
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
          }
        : {}),
    },
  })
}

export type LunchStat = FullLunch & { stats: { avg: number | null } }
export async function getGroupLunchStats({
  id,
  from,
  to,
}: Pick<Group, "id"> & {
  from?: Date
  to?: Date
}): Promise<LunchStat[]> {
  const lunches = await prisma.lunch.findMany({
    where: {
      groupLocationGroupId: id,
      date: {
        gte: from,
        lte: to,
      },
    },
    ...fullLunch,
  })

  const avgs = await prisma.score.groupBy({
    by: ["lunchId"],
    _avg: {
      score: true,
    },
    where: {
      lunch: {
        date: {
          gte: from,
          lte: to,
        },
        groupLocationGroupId: id,
      },
    },
  })

  const result = lunches.map((lunch) => {
    const avg = avgs.find((avg) => avg.lunchId === lunch.id)

    const stats = {
      avg: avg?._avg.score ?? null,
    }

    return { ...lunch, stats }
  })

  return result
}

export type GroupMembersWithScores = NonNullable<Prisma.PromiseReturnType<typeof getGroupLunchStatsPerMember>>
export async function getGroupLunchStatsPerMember({
  id,
  from,
  to,
}: Pick<Group, "id"> & { from?: Date; to?: Date }) {
  const users = await prisma.user.findMany({
    where: {
      groups: {
        some: {
          groupId: id,
        },
      },
    },
    include: {
      scores: {
        where: {
          lunch: {
            date: {
              gte: from,
              lte: to,
            },
            groupLocationGroupId: id,
          },
        },
        include: {
          lunch: {
            ...fullLunch,
          },
        },
      },
    },
  })

  return users
}
