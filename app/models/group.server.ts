import type { User, Group, Prisma, Location, Email } from "@prisma/client"
import { nanoid } from "nanoid"

import { prisma } from "~/db.server"
import { cleanEmail, formatNumber, getAverageNumber } from "~/utils"

export type { Group } from "@prisma/client"

export function getGroup({
  id,
}: Pick<Group, "id"> & {
  userId: User["id"]
}) {
  return prisma.group.findUnique({
    where: { id },
    include: {
      groupLocations: {
        include: {
          location: true,
          lunches: {
            include: {
              groupLocation: true,
              choosenBy: true,
              scores: true,
            },
          },
        },
      },
      members: {
        include: {
          user: true,
        },
      },
    },
  })
}

type GetGroupDetailsInput = Pick<Group, "id"> & {
  userId: User["id"]
}

async function fetchGroupDetails({ id }: GetGroupDetailsInput) {
  return await prisma.group.findUnique({
    where: { id },
    include: {
      groupLocations: {
        include: {
          location: true,
          lunches: {
            include: {
              choosenBy: true,
              scores: true,
            },
          },
        },
      },
      members: {
        include: {
          user: {
            include: {
              choosenLunches: {
                orderBy: {
                  date: "desc",
                },
                include: {
                  scores: true,
                },
              },
              scores: {
                where: {
                  lunch: {
                    groupLocationGroupId: id,
                  },
                },
                include: {
                  lunch: {
                    include: {
                      groupLocation: {
                        include: {
                          location: true,
                        },
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
    },
  })
}

export async function getGroupDetails({ id, userId }: GetGroupDetailsInput) {
  const group = await fetchGroupDetails({ id, userId })

  if (!group) return null

  const stats = generateGroupStats(group)

  const membersWithStats = group.members.map((member) => {
    const stats = generateUserStats(member)
    return { ...member, stats }
  })

  return {
    group: {
      ...group,
      members: membersWithStats,
    },
    stats: {
      averageScore: formatNumber(stats.averageScore),
      bestLocation: stats.bestLocation,
      worstLocation: stats.worstLocation,
      mostPositive: stats.mostPositive,
      mostNegative: stats.mostNegative,
      mostAvarage: stats.mostAverage,
    },
  }
}

export function getUserGroups({ userId }: { userId: User["id"] }) {
  return prisma.group.findMany({
    where: { members: { some: { userId } } },
    include: {
      groupLocations: {
        select: {
          _count: {
            select: {
              lunches: true,
            },
          },
        },
      },
      members: { include: { user: { select: { name: true } } } },
    },
  })
}

export function getAllGroups() {
  return prisma.group.findMany({
    include: {
      groupLocations: {
        include: {
          lunches: {
            select: {
              _count: {
                select: {
                  scores: true,
                },
              },
            },
          },
        },
      },
      members: true,
    },
  })
}

export function createGroup({
  name,
  userId,
}: Pick<Group, "name"> & {
  userId: User["id"]
}) {
  return prisma.group.create({
    data: {
      name,
      members: {
        create: [
          {
            role: "ADMIN",
            user: {
              connect: {
                id: userId,
              },
            },
          },
        ],
      },
    },
  })
}

export async function addUserToGroupWithInviteToken({
  inviteToken,
  userId,
}: {
  inviteToken: NonNullable<Group["inviteToken"]>
  userId: User["id"]
}) {
  return await prisma.group.update({
    where: {
      inviteToken: inviteToken,
    },
    data: {
      members: {
        create: {
          user: {
            connect: {
              id: userId,
            },
          },
        },
      },
    },
    select: {
      id: true,
    },
  })
}

export async function addUserEmailToGroup({
  groupId,
  email,
}: {
  groupId: Group["id"]
  email: Email["email"]
}) {
  try {
    const user = await prisma.user.findFirst({
      where: {
        email: { email: cleanEmail(email) },
      },
    })

    if (!user) return { error: "User does not exist" }

    const group = await prisma.group.update({
      where: {
        id: groupId,
      },
      data: {
        members: {
          create: {
            user: {
              connect: {
                id: user.id,
              },
            },
          },
        },
      },
    })
    return group
  } catch (err) {
    return { error: "User does not exist" }
  }
}

export async function getGroupInviteToken({
  groupId,
  userId,
}: {
  groupId: Group["id"]
  userId: User["id"]
}) {
  return prisma.group.findFirst({
    where: {
      id: groupId,
      members: {
        some: {
          userId,
        },
      },
    },
    select: {
      inviteToken: true,
    },
  })
}

export async function createGroupInviteToken({
  groupId,
  userId,
}: {
  groupId: Group["id"]
  userId: User["id"]
}) {
  return prisma.group.updateMany({
    where: {
      id: groupId,
      members: {
        some: {
          userId,
        },
      },
    },
    data: {
      inviteToken: nanoid(),
    },
  })
}

export async function deleteGroupInviteToken({
  groupId,
  userId,
}: {
  groupId: Group["id"]
  userId: User["id"]
}) {
  // TODO only allow this if user is in group?
  return prisma.group.update({
    where: {
      id: groupId,
    },
    data: {
      inviteToken: null,
    },
  })
}

export async function deleteGroup({
  id,
  requestedByUserId,
}: {
  id: Group["id"]
  requestedByUserId: User["id"]
}) {
  return prisma.group.deleteMany({
    where: {
      id,
      members: {
        some: {
          userId: requestedByUserId,
          role: "ADMIN",
        },
      },
    },
  })
}

type StatsType = {
  averageScore: number
  bestLocation: {
    score: number
    name: Location["name"]
    id: Location["id"]
  }
  worstLocation: {
    score: number
    name: Location["name"]
    id: Location["id"]
  }
  mostPositive: {
    score: number
    name: User["name"]
    id: User["id"]
  } | null
  mostNegative: {
    score: number
    name: User["name"]
    id: User["id"]
  } | null
  mostAverage: {
    score: number
    name: User["name"]
    id: User["id"]
  } | null
}

// holy reduce
const generateGroupStats = (
  group: NonNullable<Prisma.PromiseReturnType<typeof fetchGroupDetails>>
): StatsType => {
  const allLunches = group.groupLocations.flatMap((l) => l.lunches)
  const allScores = allLunches.flatMap((l) => l.scores)

  const averageScore = getAverageNumber(allScores, "score")

  const memberStats = group.members
    .filter((member) => member.user.scores.length > 0)
    .map((member) => {
      return {
        avg: getAverageNumber(member.user.scores, "score"),
        id: member.userId,
        name: member.user.name,
      }
    }, {})
    .sort((a, b) => b.avg - a.avg)

  const groupStats = group.groupLocations
    .filter((gl) => gl.lunches.length > 0)
    .reduce(
      (acc, cur) => {
        const averageLocationScores = cur.lunches.map((lunch) => ({
          avg: getAverageNumber(lunch.scores, "score"),
        }))

        const avg = getAverageNumber(averageLocationScores, "avg")

        if (acc.bestLocation.score < avg) {
          acc.bestLocation.score = avg
          acc.bestLocation.name = cur.location.name
          acc.bestLocation.id = cur.locationId
        }

        if (acc.worstLocation.score > avg) {
          acc.worstLocation.score = avg
          acc.worstLocation.name = cur.location.name
          acc.worstLocation.id = cur.locationId
        }

        return acc
      },
      {
        bestLocation: { score: -1, name: "", id: 0 },
        worstLocation: { score: 11, name: "", id: 0 },
      }
    )

  const mostPositive = memberStats[0]
    ? {
        score: memberStats[0].avg,
        name: memberStats[0].name,
        id: memberStats[0].id,
      }
    : null

  const mostNegative = memberStats[memberStats.length - 1]
    ? {
        score: memberStats[memberStats.length - 1].avg || 0,
        name: memberStats[memberStats.length - 1].name || "",
        id: memberStats[memberStats.length - 1].id || "",
      }
    : null

  const averages = memberStats
    .slice()
    .sort(
      (a, b) => Math.abs(a.avg - averageScore) - Math.abs(b.avg - averageScore)
    )

  const mostAverage = averages[0]
    ? {
        score: averages[0].avg,
        name: averages[0].name,
        id: averages[0].id,
      }
    : null

  return {
    ...groupStats,
    averageScore,
    mostNegative,
    mostPositive,
    mostAverage,
  }
}

const generateUserStats = (
  member: NonNullable<
    Prisma.PromiseReturnType<typeof fetchGroupDetails>
  >["members"][0]
) => {
  const lunchCount = member.user.scores.length
  const choiceCount = member.user.choosenLunches.length
  const averageScore = getAverageNumber(member.user.scores, "score")
  const sortedScores = member.user.scores
    .slice()
    .sort((a, b) => a.score - b.score)
  const lowestScore = sortedScores[0]?.lunch.groupLocation.location.name || "-"
  const highestScore =
    sortedScores[sortedScores.length - 1]?.lunch.groupLocation.location.name ||
    "-"

  const bestChoosenLunch = member.user.choosenLunches.reduce<
    typeof member.user.choosenLunches[0] | null
  >((acc, cur) => {
    if (!acc) return cur

    if (
      getAverageNumber(cur.scores, "score") >
      getAverageNumber(acc.scores, "score")
    ) {
      return cur
    }

    return acc
  }, null)

  return {
    lunchCount,
    choiceCount,
    averageScore,
    lowestScore,
    highestScore,
    bestChoosenLunch,
  }
}
