import type { User, Group } from "@prisma/client";

import { prisma } from "~/db.server";

export type { Group } from "@prisma/client";

export function getGroup({
  id,
}: Pick<Group, "id"> & {
  userId: User["id"];
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
      users: {
        include: {
          user: true,
        },
      },
    },
  });
}

export async function getGroupDetails({
  id,
}: Pick<Group, "id"> & {
  userId: User["id"];
}) {
  const group = await prisma.group.findUnique({
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
      users: {
        include: {
          user: true,
        },
      },
    },
  });

  if (!group) return null;

  const allLunches = group.groupLocations.flatMap((l) => l.lunches);
  const allScores = allLunches.flatMap((l) => l.scores);

  const stats = {
    averageScore: getAverageNumber(allScores, "score"),
  };

  return { group, stats };
}

export function getUserGroups({ userId }: { userId: User["id"] }) {
  return prisma.group.findMany({
    where: { users: { some: { userId } } },
    include: { users: { include: { user: { select: { name: true } } } } },
  });
}

export function createGroup({
  name,
  userId,
}: Pick<Group, "name"> & {
  userId: User["id"];
}) {
  return prisma.group.create({
    data: {
      name,
      users: {
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
  });
}

export function joinGroup({
  groupId,
  userId,
}: {
  groupId: Group["id"];
  userId: User["id"];
}) {
  return prisma.group.update({
    where: {
      id: groupId,
    },
    data: {
      users: {
        create: {
          user: {
            connect: {
              id: userId,
            },
          },
        },
      },
    },
  });
}

// TODO improve type
const getAverageNumber = <T, K extends keyof T>(array: T[], key: K) => {
  const avg =
    array.length > 0
      ? array.reduce((acc, cur) => acc + (cur[key] as unknown as number), 0) /
        array.length
      : 0;

  return avg.toLocaleString("en-US", {
    maximumFractionDigits: 2,
    minimumFractionDigits: 0,
  });
};
