import type { Group, Lunch, Score, User } from "@prisma/client"

import { prisma } from "~/db.server"

export type { Score } from "@prisma/client"

export function createScore({
  score,
  comment,
  userId,
  lunchId,
}: Pick<Score, "score" | "comment"> & {
  userId: User["id"]
  lunchId: Lunch["id"]
}) {
  return prisma.score.create({
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
  id: Lunch["id"]
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
