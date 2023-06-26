import type { Lunch, Score, ScoreRequest, User } from "@prisma/client"

import { prisma } from "~/db.server"

export type { Score, ScoreRequest } from "@prisma/client"

export async function createScore({
  score,
  comment,
  userId,
  lunchId,
  byUserId,
}: Pick<Score, "score" | "comment"> & {
  userId: User["id"]
  lunchId: Lunch["id"]
  byUserId: User["id"]
}) {
  const lunch = await prisma.lunch.findFirst({
    where: {
      id: lunchId,
      groupLocation: {
        group: {
          members: {
            some: {
              userId: byUserId,
            },
          },
        },
      },
    },
  })

  if (!lunch) {
    return null
  }

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
  const lunch = await prisma.lunch.findFirst({
    where: {
      id: lunchId,
      groupLocation: {
        group: {
          members: {
            some: {
              userId: requestedById,
            },
          },
        },
      },
    },
  })
  if (!lunch) {
    return {
      error: "Can't request for group you're not a member of",
    }
  }

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

export async function deleteScoreRequest({ id, byUserId }: { id: ScoreRequest["id"]; byUserId: User["id"] }) {
  await prisma.scoreRequest.deleteMany({
    where: {
      id,
      lunch: {
        groupLocation: {
          group: {
            members: {
              some: {
                userId: byUserId,
              },
            },
          },
        },
      },
    },
  })
}
