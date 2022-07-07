const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcryptjs");

const prisma = new PrismaClient();

async function seed() {
  const email = "bassman@nosegrove.com";
  const name = "Bass Labb";

  // cleanup the existing database
  await prisma.user.delete({ where: { email } }).catch(() => {
    // no worries if it doesn't exist yet
  });

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

  const location = await prisma.location.create({
    data: {
      lat: "59.331582",
      lon: "18.0664337",
      name: "Wokhouse",
      discoveredById: user.id,
    },
  });

  const group = await prisma.group.create({
    data: {
      name: "OGs",
      users: {
        create: [{ userId: user.id, role: "ADMIN" }],
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
