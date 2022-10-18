import { PrismaClient } from "@prisma/client"
import bcrypt from "bcryptjs"
import { sub } from "date-fns"

const prisma = new PrismaClient()

async function seed() {
  // TODO cleanup the existing database
  // await prisma.score.deleteMany().catch(() => {});
  // await prisma.lunch.deleteMany().catch(() => {});
  // await prisma.groupLocation.deleteMany().catch(() => {});
  // await prisma.location.deleteMany().catch(() => {});
  // await prisma.user.deleteMany().catch(() => {});

  const hashedPassword = await bcrypt.hash("woopwoop", 10)

  const userBasse = await prisma.user.create({
    data: {
      email: {
        create: {
          email: "bassman@nosegrove.com",
        },
      },
      avatarId: 15,
      name: "Bass Labb",
      role: "ADMIN",
      password: {
        create: {
          hash: hashedPassword,
        },
      },
    },
  })

  const userTessan = await prisma.user.create({
    data: {
      email: { create: { email: "teko@cool.se" } },
      name: "Tessan",
      avatarId: 1,
      password: {
        create: {
          hash: hashedPassword,
        },
      },
    },
  })

  const userMartin = await prisma.user.create({
    data: {
      email: { create: { email: "martin@cool.se" } },
      name: "Marre",
      avatarId: 2,
      password: {
        create: {
          hash: hashedPassword,
        },
      },
    },
  })

  const userKatten = await prisma.user.create({
    data: {
      email: { create: { email: "katten@cool.se" } },
      name: "Katten",
      avatarId: 3,
      password: {
        create: {
          hash: hashedPassword,
        },
      },
    },
  })

  const locationWoken = await prisma.location.create({
    data: {
      lat: "59.331582",
      lon: "18.0664337",
      name: "WokHouse",
      address: "Regeringsgatan 1337",
      city: "Stockholm",
      zipCode: "11737",
    },
  })

  const locationFranzen = await prisma.location.create({
    data: {
      lat: "59.3339128",
      lon: "18.0564237",
      name: "Franzén",
      address: "Klara Norra 1337",
      city: "Stockholm",
      zipCode: "11439",
    },
  })

  const locationSandwich = await prisma.location.create({
    data: {
      lat: "59.3414987",
      lon: "18.0371404",
      name: "Sandhäxan",
      address: "Gästrikegatan 13",
      city: "Stockholm",
      zipCode: "11123",
      global: true,
    },
  })

  await prisma.group.create({
    data: {
      name: "OGs",
      members: {
        create: [
          { user: { connect: { id: userBasse.id } }, role: "ADMIN" },
          { user: { connect: { id: userTessan.id } } },
          { user: { connect: { id: userMartin.id } } },
          {
            user: {
              create: {
                name: "Anonymous user",
                role: "ANONYMOUS",
                avatarId: 12,
              },
            },
          },
          {
            user: {
              create: {
                name: "Anonymous user 2",
                role: "ANONYMOUS",
                avatarId: 17,
              },
            },
          },
        ],
      },
      groupLocations: {
        create: [
          {
            location: { connect: { id: locationWoken.id } },
            discoveredBy: { connect: { id: userBasse.id } },
            lunches: {
              create: [
                {
                  date: sub(new Date(), { days: 7 }),
                  choosenBy: { connect: { id: userBasse.id } },
                  scores: {
                    create: [
                      {
                        user: { connect: { id: userTessan.id } },
                        score: 4,
                      },
                      {
                        user: { connect: { id: userBasse.id } },
                        score: 7,
                        comment: "Seed comment",
                      },
                    ],
                  },
                },
              ],
            },
          },
          {
            location: { connect: { id: locationFranzen.id } },
            discoveredBy: { connect: { id: userBasse.id } },
            lunches: {
              create: [
                {
                  date: sub(new Date(), { days: 4 }),
                  choosenBy: { connect: { id: userTessan.id } },
                  scores: {
                    create: [
                      {
                        user: { connect: { id: userTessan.id } },
                        score: 10,
                      },
                      {
                        user: { connect: { id: userBasse.id } },
                        score: 2,
                        comment: "sämst",
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

  await prisma.group.create({
    data: {
      name: "Lunches @ AW",
      members: {
        create: [
          { user: { connect: { id: userKatten.id } }, role: "ADMIN" },
          { user: { connect: { id: userMartin.id } } },
        ],
      },
      groupLocations: {
        create: [
          {
            location: { connect: { id: locationWoken.id } },
            discoveredBy: { connect: { id: userKatten.id } },
            lunches: {
              create: [
                {
                  date: sub(new Date(), { days: 14 }),
                  choosenBy: { connect: { id: userKatten.id } },
                  scores: {
                    create: [
                      {
                        user: { connect: { id: userMartin.id } },
                        score: 4.5,
                      },
                      {
                        user: { connect: { id: userKatten.id } },
                        score: 7.25,
                      },
                    ],
                  },
                },
              ],
            },
          },
          {
            location: { connect: { id: locationSandwich.id } },
            discoveredBy: { connect: { id: userMartin.id } },
            lunches: {
              create: [
                {
                  date: sub(new Date(), { days: 64 }),
                  choosenBy: { connect: { id: userMartin.id } },
                  scores: {
                    create: [
                      {
                        user: { connect: { id: userMartin.id } },
                        score: 10,
                      },
                      {
                        user: { connect: { id: userKatten.id } },
                        score: 2,
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

  console.log(`Database has been seeded. 🌱`)
}

seed()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
