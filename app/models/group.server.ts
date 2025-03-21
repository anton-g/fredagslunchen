import type { User, Group, Location, Email, GroupMember } from "@prisma/client"
import { Prisma } from "@prisma/client"
import { nanoid } from "nanoid"

import { prisma } from "~/db.server"
import { requireUserId } from "~/auth.server"
import { cleanEmail, formatNumber, getAverageNumber } from "~/utils"
import {
  checkIsAdmin,
  createAnonymousUser,
  deleteUserGroupScoreRequests,
  deleteUserGroupScores,
  transferUserGroupScores,
} from "./user.server"

export type { Group, GroupMember } from "@prisma/client"

const fullGroup = Prisma.validator<Prisma.GroupArgs>()({
  include: {
    members: {
      include: {
        user: true,
      },
    },
  },
})
export type FullGroup = Prisma.GroupGetPayload<typeof fullGroup>

export type GroupPermissions = {
  view: boolean
  invite: boolean
  leave: boolean
  recommendations: boolean
  settings: boolean
  addLocation: boolean
  addScore: boolean
  deleteAllScores: boolean
  addLunch: boolean
  deleteLunch: boolean
  deleteScoreRequest: boolean
}
// TODO maybe we should include this in every request for a group? Would force us to pass userId and make sure permissions are calculated.
export const getGroupPermissions = async ({
  currentUserId,
  group,
}: {
  currentUserId?: User["id"] | null
  group: FullGroup
}): Promise<GroupPermissions> => {
  const isAdmin = currentUserId ? await checkIsAdmin(currentUserId) : false
  const isOwner = group.members.some((m) => m.userId === currentUserId && m.role === "ADMIN")
  const isMember = group.members.some((x) => x.userId === currentUserId)

  return {
    view: isAdmin || isMember || group.public,
    settings: isOwner || isAdmin,
    invite: isMember,
    leave: !isOwner && isMember,
    recommendations: isMember || group.id === "demo",
    addLocation: isMember,
    addLunch: isMember,
    addScore: isMember,
    deleteAllScores: isOwner,
    deleteScoreRequest: isMember,
    deleteLunch: isOwner || isAdmin,
  }
}
export const getGroupPermissionsForRequest = async ({
  request,
  group,
}: {
  request: Request
  group: FullGroup
}) => {
  const isPublicGroup = group.public

  let currentUserId
  if (!isPublicGroup) {
    currentUserId = await requireUserId(request)
  }

  return getGroupPermissions({ currentUserId, group })
}

export function getGroup({ id }: Pick<Group, "id">) {
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
  from?: Date
  to?: Date
}
async function fetchGroupDetails({ id, from, to }: GetGroupDetailsInput) {
  return await prisma.group.findUnique({
    where: { id },
    include: {
      groupLocations: {
        include: {
          location: true,
          lunches: {
            where: {
              date: {
                gte: from,
                lte: to,
              },
            },
            include: {
              groupLocation: true,
              choosenBy: true,
              scores: true,
            },
          },
        },
      },
      members: {
        where: {
          inactive: false,
        },
        include: {
          user: {
            include: {
              choosenLunches: {
                where: {
                  groupLocationGroupId: id,
                  date: {
                    gte: from,
                    lte: to,
                  },
                },
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
                    date: {
                      gte: from,
                      lte: to,
                    },
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

export async function getGroupDetailedStats({ id, from, to }: { id: Group["id"]; from?: Date; to?: Date }) {
  const group = await fetchGroupDetails({ id, from, to })
  if (!group) return null

  const stats = generateGroupStats(group)

  // const membersWithStats = group.members.map((member) => {
  //   const stats = generateUserStats(member)
  //   return { ...member, stats }
  // })

  return {
    stats: {
      averageScore: formatNumber(stats.averageScore),
      bestLocation: stats.bestLocation,
      worstLocation: stats.worstLocation,
      bestLunch: stats.bestLunch,
      worstLunch: stats.worstLunch,
      mostPositive: stats.mostPositive,
      mostNegative: stats.mostNegative,
      mostAvarage: stats.mostAverage,
    },
  }
}

export async function getGroupDetails({ id }: GetGroupDetailsInput) {
  const group = await fetchGroupDetails({ id })
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
      bestLunch: stats.bestLunch,
      worstLunch: stats.worstLunch,
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
      members: {
        where: { inactive: false },
        include: { user: { select: { name: true, id: true, avatarId: true } } },
      },
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
      members: {
        include: {
          user: {
            select: {
              name: true,
            },
          },
        },
      },
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
  const group = await prisma.group.findFirst({
    where: {
      inviteToken: inviteToken,
      members: {
        some: {
          userId,
        },
      },
    },
    select: {
      id: true,
    },
  })

  if (group) {
    // User is already in the group
    return group
  }

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

export async function createGroupInviteToken({
  groupId,
  requestedByUserId,
}: {
  groupId: Group["id"]
  requestedByUserId: User["id"]
}) {
  return prisma.group.updateMany({
    where: {
      id: groupId,
      members: {
        some: {
          userId: requestedByUserId,
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
  requestedByUserId,
}: {
  groupId: Group["id"]
  requestedByUserId: User["id"]
}) {
  return prisma.group.updateMany({
    where: {
      id: groupId,
      members: {
        some: {
          userId: requestedByUserId,
        },
      },
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

export async function updateGroup({
  requestedByUserId,
  ...update
}: Partial<Group> & { requestedByUserId: User["id"] }) {
  const result = await prisma.group.updateMany({
    where: {
      id: update.id,
      members: {
        some: {
          userId: requestedByUserId,
        },
      },
    },
    data: {
      ...update,
    },
  })

  if (result.count !== 1) {
    throw new Error("Update group failed, more than 1 hit")
  }
}

export async function deleteGroupMember({
  groupId,
  userId,
  deleteScores,
  requestedByUserId,
}: {
  groupId: Group["id"]
  userId: User["id"]
  deleteScores: boolean
  requestedByUserId: User["id"]
}) {
  const group = await prisma.group.findUnique({
    where: {
      id: groupId,
    },
    include: {
      members: true,
    },
  })

  if (!group) {
    return { error: "Something went wrong" }
  }

  const requestedByAdmin = group.members.some((x) => x.userId === requestedByUserId && x.role === "ADMIN")
  const requestedBySameUser = userId === requestedByUserId

  if (!requestedByAdmin && !requestedBySameUser) {
    return { error: "Something went wrong" }
  }

  let createdAnonymousUserId: string | null = null
  if (!deleteScores) {
    const createdAnonymousUser = await createAnonymousUser(`Anonymous user`, groupId, requestedByUserId)
    if (!createdAnonymousUser) {
      return { error: "Something went wrong" }
    }
    createdAnonymousUserId = createdAnonymousUser.id
  }

  // TODO transaction
  const groupMember = await prisma.groupMember.delete({
    where: {
      userId_groupId: {
        groupId,
        userId,
      },
    },
    include: {
      user: {
        select: {
          role: true,
        },
      },
    },
  })

  if (createdAnonymousUserId) {
    await transferUserGroupScores({ fromUserId: userId, toUserId: createdAnonymousUserId, groupId })
  } else {
    await deleteUserGroupScores({ userId, groupId })
  }
  await deleteUserGroupScoreRequests({ userId, groupId })

  await prisma.groupLocation.updateMany({
    where: {
      discoveredById: userId,
    },
    data: {
      discoveredById: createdAnonymousUserId ? createdAnonymousUserId : null,
    },
  })

  await prisma.lunch.updateMany({
    where: {
      choosenByUserId: userId,
    },
    data: {
      choosenByUserId: createdAnonymousUserId ? createdAnonymousUserId : null,
    },
  })

  if (groupMember.user.role === "ANONYMOUS") {
    await prisma.user.delete({
      where: {
        id: userId,
      },
    })
  }

  return groupMember
}

export async function updateGroupMembership({
  groupId,
  userId,
  requestedByUserId,
  update,
}: {
  groupId: Group["id"]
  userId: User["id"]
  requestedByUserId: User["id"]
  update: Partial<GroupMember>
}) {
  const group = await prisma.group.findUnique({
    where: {
      id: groupId,
    },
    include: {
      members: true,
    },
  })

  if (!group) {
    return { error: "Something went wrong" }
  }

  const requestedByAdmin = group.members.some((x) => x.userId === requestedByUserId && x.role === "ADMIN")
  if (!requestedByAdmin) {
    return { error: "Something went wrong" }
  }

  return await prisma.groupMember.update({
    where: {
      userId_groupId: {
        groupId,
        userId,
      },
    },
    data: {
      ...update,
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
  bestLunch: {
    score: number
    name: Location["name"]
    id: Location["id"]
  }
  worstLunch: {
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
  group: NonNullable<Prisma.PromiseReturnType<typeof fetchGroupDetails>>,
): StatsType => {
  const allLunches = group.groupLocations.flatMap((l) => l.lunches.map((x) => ({ ...x, groupLocation: l })))
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
      },
    )

  const lunchStats = allLunches
    .filter((x) => x.scores.length > 0)
    .reduce(
      (acc, cur) => {
        const avg = getAverageNumber(cur.scores, "score")

        if (acc.bestLunch.score < avg) {
          acc.bestLunch.score = avg
          acc.bestLunch.name = cur.groupLocation.location.name
          acc.bestLunch.id = cur.id
        }

        if (acc.worstLunch.score > avg) {
          acc.worstLunch.score = avg
          acc.worstLunch.name = cur.groupLocation.location.name
          acc.worstLunch.id = cur.id
        }

        return acc
      },
      {
        bestLunch: { score: -1, name: "", id: 0 },
        worstLunch: { score: 11, name: "", id: 0 },
      },
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
    .sort((a, b) => Math.abs(a.avg - averageScore) - Math.abs(b.avg - averageScore))

  const mostAverage = averages[0]
    ? {
        score: averages[0].avg,
        name: averages[0].name,
        id: averages[0].id,
      }
    : null

  return {
    ...groupStats,
    ...lunchStats,
    averageScore,
    mostNegative,
    mostPositive,
    mostAverage,
  }
}

const generateUserStats = (
  member: NonNullable<Prisma.PromiseReturnType<typeof fetchGroupDetails>>["members"][0],
) => {
  const lunchCount = member.user.scores.length
  const choiceCount = member.user.choosenLunches.length
  const averageScore = getAverageNumber(member.user.scores, "score")
  const sortedScores = member.user.scores.slice().sort((a, b) => a.score - b.score)
  const lowestScore = sortedScores.at(0)
  const highestScore = sortedScores.at(-1)

  const bestChoosenLunch = member.user.choosenLunches.reduce<(typeof member.user.choosenLunches)[0] | null>(
    (acc, cur) => {
      if (!acc) return cur

      if (getAverageNumber(cur.scores, "score") > getAverageNumber(acc.scores, "score")) {
        return cur
      }

      return acc
    },
    null,
  )

  return {
    lunchCount,
    choiceCount,
    averageScore,
    lowestScore: lowestScore
      ? {
          id: lowestScore.lunchId,
          name: lowestScore.lunch.groupLocation.location.name || "-",
          score: lowestScore.score,
        }
      : null,
    highestScore: highestScore
      ? {
          id: highestScore.lunchId,
          name: highestScore.lunch.groupLocation.location.name || "-",
          score: highestScore.score,
        }
      : null,
    bestChoosenLunch,
  }
}
