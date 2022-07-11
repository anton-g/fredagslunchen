// @ts-check
const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcryptjs");

const prisma = new PrismaClient();

async function seed() {
  const email = "bassman@nosegrove.com";
  const name = "Bass Labb";

  // cleanup the existing database
  await prisma.score.delete({ where: {} }).catch(() => {});
  await prisma.lunch.delete({ where: {} }).catch(() => {});
  await prisma.groupLocation.delete({ where: {} }).catch(() => {});
  await prisma.location.delete({ where: {} }).catch(() => {});
  // await prisma.user.delete({ where: {} }).catch(() => {});
  // await prisma.user.delete({ where: {} }).catch(() => {});

  const hashedPassword = await bcrypt.hash("woopwoop", 10);

  const user = await prisma.user.create({
    data: {
      email,
      name,
      password: {
        create: {
          hash: hashedPassword,
        },
      },
    },
  });

  const user2 = await prisma.user.create({
    data: {
      email: "teko@cool.se",
      name: "Tessan",
      password: {
        create: {
          hash: hashedPassword,
        },
      },
    },
  });

  const location = await prisma.location.create({
    data: {
      lat: "59.331582",
      lon: "18.0664337",
      name: "WokHouse",
      address: "Regeringsgatan 1337",
    },
  });

  const location2 = await prisma.location.create({
    data: {
      lat: "59.3339128",
      lon: "18.0564237",
      name: "Franzén",
      address: "Klara Norra 1337",
    },
  });

  await prisma.group.create({
    data: {
      name: "OGs",
      users: {
        create: [
          { user: { connect: { id: user.id } }, role: "ADMIN" },
          { user: { connect: { id: user2.id } } },
        ],
      },
      locations: {
        create: [
          {
            location: { connect: { id: location.id } },
            discoveredBy: { connect: { id: user.id } },
            lunches: {
              create: [
                {
                  date: new Date(),
                  choosenBy: { connect: { id: user.id } },
                  scores: {
                    create: [
                      {
                        user: { connect: { id: user2.id } },
                        score: 4,
                      },
                      {
                        user: { connect: { id: user.id } },
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
            location: { connect: { id: location2.id } },
            discoveredBy: { connect: { id: user.id } },
            lunches: {
              create: [
                {
                  date: new Date(),
                  choosenBy: { connect: { id: user2.id } },
                  scores: {
                    create: [
                      {
                        user: { connect: { id: user2.id } },
                        score: 10,
                      },
                      {
                        user: { connect: { id: user.id } },
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
  });

  console.log(`Database has been seeded. 🌱`);
}

seed()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
