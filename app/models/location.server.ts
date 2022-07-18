import type { Group, GroupLocation, Location } from "@prisma/client";

import { prisma } from "~/db.server";

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
