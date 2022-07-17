import type { User, Group, Prisma, Location } from "@prisma/client";

import { prisma } from "~/db.server";
import { formatNumber, getAverageNumber } from "~/utils";

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

type GetGroupDetailsInput = Pick<Group, "id"> & {
  userId: User["id"];
};

async function fetchGroupDetails({ id }: GetGroupDetailsInput) {
  return await prisma.group.findUnique({
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
          user: {
            include: {
              scores: {
                include: {
                  lunch: true,
                },
              },
            },
          },
        },
      },
    },
  });
}

export async function getGroupDetails({ id, userId }: GetGroupDetailsInput) {
  const group = await fetchGroupDetails({ id, userId });

  if (!group) return null;

  const stats = generateGroupStats(group);

  return {
    group,
    stats: {
      averageScore: formatNumber(stats.averageScore),
      bestLocation: stats.bestLocation,
      worstLocation: stats.worstLocation,
      mostPositive: stats.mostPositive,
      mostNegative: stats.mostNegative,
      mostAvarage: stats.mostAverage,
    },
  };
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

export async function addUserToGroup({
  groupId,
  email,
}: {
  groupId: Group["id"];
  email: User["email"];
}) {
  try {
    const group = await prisma.group.update({
      where: {
        id: groupId,
      },
      data: {
        users: {
          create: {
            user: {
              connect: {
                email: email,
              },
            },
          },
        },
      },
    });
    return group;
  } catch (err) {
    return { error: "User does not exist" };
  }
}

type StatsType = {
  averageScore: number;
  bestLocation: {
    score: number;
    name: Location["name"];
    id: Location["id"];
  };
  worstLocation: {
    score: number;
    name: Location["name"];
    id: Location["id"];
  };
  mostPositive: {
    score: number;
    name: User["name"];
    id: User["id"];
  };
  mostNegative: {
    score: number;
    name: User["name"];
    id: User["id"];
  };
  mostAverage: {
    score: number;
    name: User["name"];
    id: User["id"];
  };
};

// holy reduce
const generateGroupStats = (
  group: NonNullable<Prisma.PromiseReturnType<typeof fetchGroupDetails>>
): StatsType => {
  const allLunches = group.groupLocations.flatMap((l) => l.lunches);
  const allScores = allLunches.flatMap((l) => l.scores);

  const averageScore = getAverageNumber(allScores, "score");

  const userStats = group.users
    .filter(
      (x) =>
        x.user.scores.filter((s) => s.lunch.groupLocationGroupId === group.id)
          .length > 0
    )
    .map((groupUser) => {
      const groupScores = groupUser.user.scores.filter(
        (x) => x.lunch.groupLocationGroupId === group.id
      );
      return {
        avg: getAverageNumber(groupScores, "score"),
        id: groupUser.userId,
        name: groupUser.user.name,
      };
    }, {})
    .sort((a, b) => b.avg - a.avg);

  const groupStats = group.groupLocations.reduce(
    (acc, cur) => {
      const averageLocationScores = cur.lunches.map((lunch) => ({
        avg: getAverageNumber(lunch.scores, "score"),
      }));

      const avg = getAverageNumber(averageLocationScores, "avg");

      if (acc.bestLocation.score < avg) {
        acc.bestLocation.score = avg;
        acc.bestLocation.name = cur.location.name;
        acc.bestLocation.id = cur.locationId;
      }

      if (acc.worstLocation.score > avg) {
        acc.worstLocation.score = avg;
        acc.worstLocation.name = cur.location.name;
        acc.worstLocation.id = cur.locationId;
      }

      return acc;
    },
    {
      bestLocation: { score: -1, name: "", id: 0 },
      worstLocation: { score: 11, name: "", id: 0 },
    }
  );

  const mostPositive = {
    score: userStats[0].avg,
    name: userStats[0].name,
    id: userStats[0].id,
  };

  const mostNegative = {
    score: userStats[userStats.length - 1]?.avg || 0,
    name: userStats[userStats.length - 1]?.name || "",
    id: userStats[userStats.length - 1]?.id || "",
  };

  const averages = userStats
    .slice()
    .sort(
      (a, b) => Math.abs(b.avg - averageScore) - Math.abs(a.avg - averageScore)
    );

  const mostAverage = {
    score: averages[0].avg,
    name: averages[0].name,
    id: averages[0].id,
  };

  return {
    ...groupStats,
    averageScore,
    mostNegative,
    mostPositive,
    mostAverage,
  };
};
