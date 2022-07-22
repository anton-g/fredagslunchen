import type { Password, Prisma, User } from "@prisma/client";
import bcrypt from "bcryptjs";

import { prisma } from "~/db.server";
import { getAverageNumber } from "~/utils";

export type { User } from "@prisma/client";

const fetchUserDetails = async ({ id }: { id: User["id"] }) => {
  return await prisma.user.findUnique({
    where: { id },
    include: {
      scores: {
        include: {
          lunch: {
            include: {
              groupLocation: {
                include: {
                  location: true,
                  group: {
                    include: {
                      members: {
                        select: {
                          userId: true,
                        },
                      },
                    },
                  },
                },
              },
              choosenBy: true,
            },
          },
        },
      },
      choosenLunches: {
        include: {
          groupLocation: {
            include: {
              location: true,
            },
          },
          scores: true,
        },
      },
    },
  });
};

export async function getFullUserById({
  id,
  requestUserId,
}: {
  id: User["id"];
  requestUserId: User["id"];
}) {
  const user = await fetchUserDetails({ id });

  if (!user) return null;

  const stats = generateUserStats(user);

  const filteredUser: typeof user = {
    ...user,
    scores: user.scores.filter((score) =>
      score.lunch.groupLocation.group.members.some(
        (x) => x.userId === requestUserId
      )
    ),
  };

  return {
    ...filteredUser,
    stats,
  };
}

export async function getUserById(id: User["id"]) {
  return prisma.user.findUnique({ where: { id } });
}

export async function getUserByEmail(email: User["email"]) {
  return prisma.user.findUnique({ where: { email } });
}

export async function createUser(
  email: User["email"],
  name: string,
  password: string,
  inviteToken?: string | null
) {
  const hashedPassword = await bcrypt.hash(password, 10);

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

  console.log("CREATE", { inviteToken });

  let group = undefined;
  if (inviteToken) {
    group = await prisma.group.update({
      where: {
        inviteToken: inviteToken,
      },
      data: {
        members: {
          create: {
            user: {
              connect: {
                id: user.id,
              },
            },
          },
        },
      },
      select: {
        id: true,
      },
    });
  }

  return { user, groupId: group?.id };
}

export async function deleteUserByEmail(email: User["email"]) {
  return prisma.user.delete({ where: { email } });
}

export async function verifyLogin(
  email: User["email"],
  password: Password["hash"]
) {
  const userWithPassword = await prisma.user.findUnique({
    where: { email },
    include: {
      password: true,
    },
  });

  if (!userWithPassword || !userWithPassword.password) {
    return null;
  }

  const isValid = await bcrypt.compare(
    password,
    userWithPassword.password.hash
  );

  if (!isValid) {
    return null;
  }

  const { password: _password, ...userWithoutPassword } = userWithPassword;

  return userWithoutPassword;
}

// TODO stats generation duplicated in group.server.ts
function generateUserStats(
  user: NonNullable<Prisma.PromiseReturnType<typeof fetchUserDetails>>
) {
  const lunchCount = user.scores.length;
  const averageScore = getAverageNumber(user.scores, "score");
  const sortedScores = user.scores.slice().sort((a, b) => a.score - b.score);
  const lowestScore =
    sortedScores[0]?.lunch.groupLocation.location.name || "N/A";
  const highestScore =
    sortedScores[sortedScores.length - 1]?.lunch.groupLocation.location.name ||
    "N/A";

  const bestChoosenLunch = user.choosenLunches.reduce<
    typeof user.choosenLunches[0] | null
  >((acc, cur) => {
    if (!acc) return cur;

    if (
      getAverageNumber(cur.scores, "score") >
      getAverageNumber(acc.scores, "score")
    ) {
      return cur;
    }

    return acc;
  }, null);
  return {
    lunchCount,
    averageScore,
    lowestScore,
    highestScore,
    bestChoosenLunch,
  };
}
