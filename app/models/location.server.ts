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

type CreateLocationInput = Omit<Location, "id"> & {
  groupId: Group["id"];
  discoveredById: GroupLocation["discoveredById"];
};

export async function createLocation({
  address,
  lat,
  lon,
  name,
  groupId,
  discoveredById,
}: CreateLocationInput) {
  // const groupLocation = await prisma.groupLocation.findFirst({
  //   where: {
  //     groupId,
  //     locationId,
  //   },
  // });
  // if (!groupLocation) throw "handle this";
  // return await prisma.lunch.create({
  //   data: {
  //     date: new Date(date),
  //     choosenByUserId,
  //     groupLocationGroupId: groupId,
  //     groupLocationLocationId: locationId,
  //   },
  // });

  return { id: "" };
}
