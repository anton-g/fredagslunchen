import type { Group, GroupLocation, Location } from "@prisma/client"

import { prisma } from "~/db.server"
import { getAverageNumber } from "~/utils"

export type { Location } from "@prisma/client"

export function getLocation({ id }: { id: Location["id"] }) {
  return prisma.location.findUnique({
    where: {
      id,
    },
  })
}

export async function findLocation({
  city,
  lat,
  lon,
  address,
  name,
  zipCode,
}: {
  name?: string
  address?: string
  city?: string
  lat?: string
  lon?: string
  zipCode?: string
}) {
  return prisma.location.findFirst({
    where: {
      city,
      lat,
      lon,
      address,
      name,
      zipCode,
    },
  })
}

export function getGroupLocation({
  id,
  groupId,
}: Pick<Location, "id"> & {
  groupId: Group["id"]
}) {
  return prisma.groupLocation.findUnique({
    where: { locationId_groupId: { groupId, locationId: id } },
    include: {
      discoveredBy: true,
      lunches: {
        include: { scores: true, choosenBy: true },
      },
      location: true,
      group: {
        include: {
          members: {
            include: {
              user: true,
            },
          },
        },
      },
    },
  })
}

type CreateGroupLocationInput = Omit<Location, "id"> & {
  groupId: Group["id"]
  discoveredById: NonNullable<GroupLocation["discoveredById"]>
  osmId?: Location["osmId"]
}

export async function createGroupLocation({
  address,
  lat,
  lon,
  name,
  groupId,
  city,
  zipCode,
  discoveredById,
  countryCode,
  osmId,
}: CreateGroupLocationInput) {
  const existingLocation = await prisma.location.findUnique({
    where: {
      osmId: osmId || "NOT_FOUND",
    },
  })

  return prisma.groupLocation.upsert({
    where: {
      locationId_groupId: {
        groupId,
        locationId: existingLocation?.id || -1,
      },
    },
    create: {
      discoveredBy: {
        connect: {
          id: discoveredById,
        },
      },
      group: {
        connect: {
          id: groupId,
        },
      },
      location: {
        connectOrCreate: {
          where: {
            osmId: osmId || "NOT_FOUND",
          },
          create: {
            address,
            lat,
            lon,
            name,
            city,
            zipCode,
            osmId,
            countryCode,
          },
        },
      },
    },
    update: {},
  })
}

export function getAllLocationsForGroup({ groupId }: { groupId: Group["id"] }) {
  return prisma.location.findMany({
    where: {
      AND: [
        {
          global: true,
        },
        {
          groupLocation: {
            none: {
              groupId: groupId,
            },
          },
        },
      ],
    },
  })
}

export function getAllLocations() {
  return prisma.location.findMany({
    include: {
      groupLocation: {
        include: {
          lunches: {
            include: {
              _count: true,
            },
          },
        },
      },
    },
  })
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
  })

  const locationsWithStats = locations.map((loc) => {
    const allLunches = loc.groupLocation.flatMap((gl) => gl.lunches)
    const allScores = allLunches.flatMap((l) => l.scores).sort((a, b) => b.score - a.score)

    const averageScore = getAverageNumber(allScores, "score")

    const highestScore = allScores[0]?.score || 0
    const lowestScore = allScores[allScores.length - 1]?.score || 0

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
    }
  })

  return locationsWithStats
}

export async function updateLocation(update: Partial<Location>) {
  return prisma.location.update({
    where: {
      id: update.id,
    },
    data: {
      ...update,
    },
  })
}

export async function mergeLocations({
  locationFromId,
  locationToId,
}: {
  locationFromId: Location["id"]
  locationToId: Location["id"]
}) {
  const lunchesToUpdate = await prisma.lunch.findMany({
    where: {
      groupLocationLocationId: locationFromId,
    },
    include: {
      groupLocation: true,
    },
  })

  for (const lunch of lunchesToUpdate) {
    await prisma.lunch.update({
      where: {
        id: lunch.id,
      },
      data: {
        groupLocation: {
          connectOrCreate: {
            where: {
              locationId_groupId: {
                groupId: lunch.groupLocationGroupId,
                locationId: locationToId,
              },
            },
            create: {
              discoveredById: lunch.groupLocation.discoveredById,
              groupId: lunch.groupLocationGroupId,
              locationId: locationToId,
            },
          },
        },
      },
    })
  }

  await prisma.groupLocation.deleteMany({
    where: {
      locationId: locationFromId,
    },
  })

  await prisma.location.delete({
    where: {
      id: locationFromId,
    },
  })
}
