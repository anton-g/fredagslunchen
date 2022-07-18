import type { Group, GroupLocation, Location } from "@prisma/client";

import { prisma } from "~/db.server";
import { getAverageNumber } from "~/utils";

export type { Location } from "@prisma/client";

export function getGroupLocation({
  id,
  groupId,
}: Pick<Location, "id"> & {
  groupId: Group["id"];
}) {
  return prisma.groupLocation.findUnique({
    where: { locationId_groupId: { groupId, locationId: id } },
    include: {
      discoveredBy: true,
      lunches: {
        include: { scores: true, choosenBy: true },
      },
      location: true,
    },
  });
}

type CreateGroupLocationInput = Omit<Location, "id"> & {
  groupId: Group["id"];
  discoveredById: GroupLocation["discoveredById"];
  locationId?: Location["id"];
};

export async function createGroupLocation({
  address,
  lat,
  lon,
  name,
  groupId,
  discoveredById,
  locationId,
}: CreateGroupLocationInput) {
  return await prisma.groupLocation.create({
    data: {
      group: {
        connect: {
          id: groupId,
        },
      },
      discoveredBy: {
        connect: {
          id: discoveredById,
        },
      },
      location: {
        connectOrCreate: {
          where: {
            id: locationId || -1,
          },
          create: {
            address,
            lat,
            lon,
            name,
          },
        },
      },
    },
  });
}

export function getAllLocations() {
  return prisma.location.findMany({});
}

export async function getAllLocationsStats() {
  const locations = await prisma.location.findMany({
    include: {
      groupLocation: {
        include: {
          lunches: {
            include: {
              scores: true,
            },
          },
        },
      },
    },
  });

  const locationsWithStats = locations.map((loc) => {
    const allScores = loc.groupLocation.flatMap((gl) =>
      gl.lunches.flatMap((l) => l.scores)
    );

    const averageScore = getAverageNumber(allScores, "score");

    return {
      ...loc,
      averageScore,
    };
  });

  return locationsWithStats;
}
