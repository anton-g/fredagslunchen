import type { Lunch, Score, User } from "@prisma/client";

import { prisma } from "~/db.server";

export type { Score } from "@prisma/client";

export function createScore({
  score,
  comment,
  userId,
  lunchId,
}: Pick<Score, "score" | "comment"> & {
  userId: User["id"];
  lunchId: Lunch["id"];
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
  });
}
