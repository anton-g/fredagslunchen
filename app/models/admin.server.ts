import { prisma } from "~/db.server"

export async function getAdminStats() {
  const users = await prisma.user.aggregate({
    _count: {
      _all: true,
    },
  })

  const groups = await prisma.group.aggregate({
    _count: {
      _all: true,
    },
  })

  const locations = await prisma.location.aggregate({
    _count: {
      _all: true,
    },
  })

  const lunches = await prisma.lunch.aggregate({
    _count: {
      _all: true,
    },
  })

  const scores = await prisma.score.aggregate({
    _count: {
      _all: true,
    },
  })

  const groupLocations = await prisma.groupLocation.aggregate({
    _count: {
      _all: true,
    },
  })

  return {
    userCount: users._count._all,
    locationCount: locations._count._all,
    groupLocationCount: groupLocations._count._all,
    groupCount: groups._count._all,
    lunchCount: lunches._count._all,
    scoreCount: scores._count._all,
  }
}
