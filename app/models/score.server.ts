import type { Group, Lunch, Score, ScoreRequest, User } from "@prisma/client"

import { prisma } from "~/db.server"

export type { Score, ScoreRequest } from "@prisma/client"

export async function createScore({
  score,
  comment,
  userId,
  lunchId,
}: Pick<Score, "score" | "comment"> & {
  userId: User["id"]
  lunchId: Lunch["id"]
}) {
  const result = await prisma.score.create({
    data: {
      score,
      comment,
      lunch: {
        connect: {
          id: lunchId,
        },
      },
      user: {
        connect: {
          id: userId,
        },
      },
    },
  })

  await prisma.scoreRequest.deleteMany({
    where: {
      lunchId,
      userId,
    },
  })

  return result
}

export async function createScoreWithNewAnonymousUser({
  score,
  comment,
  newUserName,
  lunchId,
  groupId,
}: Pick<Score, "score" | "comment"> & {
  newUserName: User["name"]
  lunchId: Lunch["id"]
  groupId: Group["id"]
}) {
  const member = await prisma.groupMember.create({
    data: {
      group: {
        connect: {
          id: groupId,
        },
      },
      user: {
        create: {
          name: newUserName,
          role: "ANONYMOUS",
        },
      },
    },
  })

  return createScore({ score, comment, lunchId, userId: member.userId })
}

export async function deleteScore({
  id,
  requestedByUserId,
}: {
  id: Score["id"]
  requestedByUserId: User["id"]
}) {
  await prisma.score.deleteMany({
    where: {
      id,
      OR: [
        {
          userId: requestedByUserId,
        },
        {
          lunch: {
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
        },
      ],
    },
  })
}

export async function createScoreRequest({
  id,
  requestedById,
  lunchId,
}: {
  id: User["id"]
  requestedById: User["id"]
  lunchId: Lunch["id"]
}) {
  const user = await prisma.user.findUnique({
    where: {
      id,
    },
  })
  if (user?.role === "ANONYMOUS") {
    return {
      error: "Can't request from anonymous user",
    }
  }

  return await prisma.scoreRequest.create({
    data: {
      lunchId,
      userId: id,
      requestedByUserId: requestedById,
    },
  })
}

export async function deleteScoreRequest({ id }: { id: ScoreRequest["id"] }) {
  await prisma.scoreRequest.delete({
    where: {
      id,
    },
  })
}
