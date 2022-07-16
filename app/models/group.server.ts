import type { User, Group, Prisma, Location } from "@prisma/client";

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
          user: true,
        },
      },
    },
  });
}

export async function getGroupDetails({ id, userId }: GetGroupDetailsInput) {
  const group = await fetchGroupDetails({ id, userId });

  if (!group) return null;

  const allLunches = group.groupLocations.flatMap((l) => l.lunches);
  const allScores = allLunches.flatMap((l) => l.scores);

  const stats2 = compileStats(group);

  const bestScore = stats2.bestLocation.name;
  const worstScore = stats2.worstLocation.name;
  const mostPositive = "N/A";
  const mostNegative = "N/A";
  const mostAvarage = "N/A";

  const stats = {
    averageScore: formatNumber(getAverageNumber(allScores, "score")),
    bestScore,
    worstScore,
    mostPositive,
    mostNegative,
    mostAvarage,
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
  return array.length > 0
    ? array.reduce((acc, cur) => acc + (cur[key] as unknown as number), 0) /
        array.length
    : 0;
};

const formatNumber = (num: number) => {
  return num.toLocaleString("en-US", {
    maximumFractionDigits: 2,
    minimumFractionDigits: 0,
  });
};

type StatsType = {
  bestLocation: {
    score: number;
    name: string;
    id: Location["id"];
  };
  worstLocation: {
    score: number;
    name: string;
    id: Location["id"];
  };
};

// holy reduce
const compileStats = (
  group: NonNullable<Prisma.PromiseReturnType<typeof fetchGroupDetails>>
): StatsType => {
  return group.groupLocations.reduce<StatsType>(
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
};
