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
    const allLunches = loc.groupLocation.flatMap((gl) => gl.lunches);
    const allScores = allLunches
      .flatMap((l) => l.scores)
      .sort((a, b) => b.score - a.score);

    const averageScore = getAverageNumber(allScores, "score");

    const highestScore = allScores[0].score;
    const lowestScore = allScores[allScores.length - 1].score;

    return {
      address: loc.address,
      id: loc.id,
      lat: loc.lat,
      lon: loc.lon,
      name: loc.name,
      lunchCount: allLunches.length,
      averageScore,
      highestScore,
      lowestScore,
    };
  });

  return locationsWithStats;
}
