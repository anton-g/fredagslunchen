import { nanoid } from "nanoid"
import { prisma } from "~/db.server"
import { faker } from "@faker-js/faker"
import sub from "date-fns/sub"
import type { Location } from "@prisma/client"
import { getRandomAvatarId } from "~/utils"

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

export async function recreateDemoGroup() {
  const user1 = await demoUser("male", "1")
  const user2 = await demoUser("female", "2")
  const user3 = await demoUser("female", "3")
  const user4 = await demoUser("male", "4")
  const user5 = await demoUser("female", "5")

  const mcdonalds = await demoLocation({
    lat: "59.3314725",
    lon: "18.0673135",
    name: "McDonalds",
    address: "Regeringsgatan 20",
    city: "Stockholm",
    zipCode: "111 53",
  })

  const tgis = await demoLocation({
    lat: "59.3321839",
    lon: "18.0691588",
    name: "T.G.I. Friday's",
    address: "Hamngatan 19",
    city: "Stockholm",
    zipCode: "111 47",
  })

  const laNeta = await demoLocation({
    lat: "59.3339136",
    lon: "18.0704647",
    name: "La Neta Bar",
    address: "Smålandsgatan 24",
    city: "Stockholm",
    zipCode: "111 46",
  })

  const bullAndBear = await demoLocation({
    lat: "59.3348662",
    lon: "18.0738218",
    name: "The Bull and Bear Inn",
    address: "Birger Jarlsgatan 16",
    city: "Stockholm",
    zipCode: "114 34",
  })

  const strandvagen1 = await demoLocation({
    lat: "59.3325024",
    lon: "18.0778606",
    name: "Strandvägen 1",
    address: "Strandvägen 1",
    city: "Stockholm",
    zipCode: "114 51",
  })

  const boqueria = await demoLocation({
    lat: "59.333648",
    lon: "18.0692267",
    name: "Boqueria",
    address: "Jakobsbergsgatan 17",
    city: "Stockholm",
    zipCode: "111 44",
  })

  await prisma.group.deleteMany({
    where: {
      id: "demo",
    },
  })

  await prisma.group.create({
    data: {
      id: "demo",
      name: "Demo club",
      lat: 59.33360321513776,
      lon: 18.072305318120737,
      public: true,
      members: {
        create: [
          { user: { connect: { id: user1.id } } },
          { user: { connect: { id: user2.id } } },
          { user: { connect: { id: user3.id } } },
          { user: { connect: { id: user4.id } } },
          { user: { connect: { id: user5.id } } },
        ],
      },
      groupLocations: {
        create: [
          {
            location: { connect: { id: mcdonalds.id } },
            discoveredBy: { connect: { id: user2.id } },
            lunches: {
              create: [
                {
                  date: sub(new Date(), { days: 7 }),
                  choosenBy: { connect: { id: user2.id } },
                  scores: {
                    create: [
                      {
                        user: { connect: { id: user1.id } },
                        score: 7,
                        comment: "Great salad to be fair",
                      },
                      {
                        user: { connect: { id: user2.id } },
                        score: 7.5,
                        comment: "Cheese burgers <3",
                      },
                      {
                        user: { connect: { id: user3.id } },
                        score: 2,
                        comment: "...",
                      },
                      {
                        user: { connect: { id: user5.id } },
                        score: 4,
                      },
                    ],
                  },
                },
                {
                  date: sub(new Date(), { days: 34 }),
                  choosenBy: { connect: { id: user2.id } },
                  scores: {
                    create: [
                      {
                        user: { connect: { id: user2.id } },
                        score: 7.25,
                        comment: "Never get tired of cheese burgers",
                      },
                      {
                        user: { connect: { id: user3.id } },
                        score: 3,
                        comment: "why",
                      },
                    ],
                  },
                },
              ],
            },
          },
          {
            location: { connect: { id: tgis.id } },
            discoveredBy: { connect: { id: user1.id } },
            lunches: {
              create: [
                {
                  date: sub(new Date(), { days: 1 }),
                  choosenBy: { connect: { id: user1.id } },
                  scores: {
                    create: [
                      {
                        user: { connect: { id: user1.id } },
                        score: 6,
                        comment: "Pretty good steak",
                      },
                      {
                        user: { connect: { id: user3.id } },
                        score: 8,
                        comment: "The lasagna was fantastic!",
                      },
                      {
                        user: { connect: { id: user4.id } },
                        score: 6.5,
                      },
                    ],
                  },
                  scoreRequests: {
                    create: [
                      {
                        requestedBy: { connect: { id: user1.id } },
                        user: { connect: { id: user2.id } },
                      },
                    ],
                  },
                },
                {
                  date: sub(new Date(), { days: 14 }),
                  choosenBy: { connect: { id: user3.id } },
                  scores: {
                    create: [
                      {
                        user: { connect: { id: user1.id } },
                        score: 5,
                      },
                      {
                        user: { connect: { id: user2.id } },
                        score: 6.6,
                      },
                      {
                        user: { connect: { id: user3.id } },
                        score: 7.5,
                      },
                      {
                        user: { connect: { id: user4.id } },
                        score: 7.5,
                      },
                      {
                        user: { connect: { id: user5.id } },
                        score: 6.5,
                      },
                    ],
                  },
                },
                {
                  date: sub(new Date(), { days: 45 }),
                  choosenBy: { connect: { id: user1.id } },
                  scores: {
                    create: [
                      {
                        user: { connect: { id: user1.id } },
                        score: 8,
                        comment: "Totally worth the price!!",
                      },
                      {
                        user: { connect: { id: user2.id } },
                        score: 4,
                        comment: "dry steak..",
                      },
                      {
                        user: { connect: { id: user5.id } },
                        score: 8.5,
                      },
                    ],
                  },
                },
              ],
            },
          },
          {
            location: { connect: { id: laNeta.id } },
            discoveredBy: { connect: { id: user5.id } },
            lunches: {
              create: [
                {
                  date: sub(new Date(), { days: 24 }),
                  choosenBy: { connect: { id: user5.id } },
                  scores: {
                    create: [
                      {
                        user: { connect: { id: user5.id } },
                        score: 9,
                        comment: "Wow!",
                      },
                      {
                        user: { connect: { id: user3.id } },
                        score: 7.5,
                        comment: "Cilantro <3",
                      },
                      {
                        user: { connect: { id: user2.id } },
                        score: 4.5,
                        comment: "Cilantro :(",
                      },
                    ],
                  },
                },
              ],
            },
          },
          {
            location: { connect: { id: bullAndBear.id } },
            discoveredBy: { connect: { id: user1.id } },
            lunches: {
              create: [
                {
                  date: sub(new Date(), { days: 19 }),
                  choosenBy: { connect: { id: user1.id } },
                  scores: {
                    create: [
                      {
                        user: { connect: { id: user1.id } },
                        score: 3,
                        comment: "Free salad at least..",
                      },
                      {
                        user: { connect: { id: user5.id } },
                        score: 4.5,
                      },
                      {
                        user: { connect: { id: user4.id } },
                        score: 4.5,
                      },
                      {
                        user: { connect: { id: user2.id } },
                        score: 7.5,
                      },
                      {
                        user: { connect: { id: user3.id } },
                        score: 4.5,
                      },
                    ],
                  },
                },
              ],
            },
          },
          {
            location: { connect: { id: strandvagen1.id } },
            discoveredBy: { connect: { id: user3.id } },
            lunches: {
              create: [
                {
                  date: sub(new Date(), { days: 39 }),
                  choosenBy: { connect: { id: user3.id } },
                  scores: {
                    create: [
                      {
                        user: { connect: { id: user3.id } },
                        score: 9,
                        comment: "New favorite",
                      },
                      {
                        user: { connect: { id: user5.id } },
                        score: 7,
                      },
                      {
                        user: { connect: { id: user1.id } },
                        score: 7.5,
                      },
                      {
                        user: { connect: { id: user2.id } },
                        score: 2,
                        comment: "Way to expensive",
                      },
                    ],
                  },
                },
              ],
            },
          },
          {
            location: { connect: { id: boqueria.id } },
            discoveredBy: { connect: { id: user4.id } },
            lunches: {
              create: [
                {
                  date: sub(new Date(), { days: 51 }),
                  choosenBy: { connect: { id: user5.id } },
                  scores: {
                    create: [
                      {
                        user: { connect: { id: user2.id } },
                        score: 6,
                      },
                      {
                        user: { connect: { id: user5.id } },
                        score: 7,
                      },
                      {
                        user: { connect: { id: user3.id } },
                        score: 7.5,
                      },
                      {
                        user: { connect: { id: user4.id } },
                        score: 7,
                      },
                    ],
                  },
                },
                {
                  date: sub(new Date(), { days: 83 }),
                  choosenBy: { connect: { id: user4.id } },
                  scores: {
                    create: [
                      {
                        user: { connect: { id: user2.id } },
                        score: 5.5,
                      },
                      {
                        user: { connect: { id: user5.id } },
                        score: 8,
                      },
                      {
                        user: { connect: { id: user1.id } },
                        score: 6,
                      },
                      {
                        user: { connect: { id: user4.id } },
                        score: 8.5,
                      },
                    ],
                  },
                },
              ],
            },
          },
        ],
      },
    },
  })
}

async function demoUser(gender: "male" | "female", key: string) {
  const id = `demo-${key}`
  return await prisma.user.upsert({
    where: {
      id,
    },
    update: {},
    create: {
      id,
      avatarId: getRandomAvatarId(id),
      email: {
        connectOrCreate: {
          where: {
            email: `demo-${nanoid(8)}@example.com`,
          },
          create: {
            email: `demo-${nanoid(8)}@example.com`,
          },
        },
      },
      name: faker.person.firstName(gender),
    },
  })
}

async function demoLocation({
  lat,
  lon,
  name,
  address,
  city,
  zipCode,
}: Pick<Location, "lat" | "lon" | "name" | "address" | "city" | "zipCode">) {
  const existing = await prisma.location.findFirst({
    where: {
      lat,
      lon,
      name,
      address,
      city,
      zipCode,
    },
  })

  if (existing) return existing

  return await prisma.location.create({
    data: {
      lat,
      lon,
      name,
      address,
      city,
      zipCode,
    },
  })
}
