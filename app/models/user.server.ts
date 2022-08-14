import type { Email, Group, Password, Prisma, User } from "@prisma/client";
import bcrypt from "bcryptjs";
import invariant from "tiny-invariant";

import { prisma } from "~/db.server";
import { getAverageNumber } from "~/utils";

export type { User } from "@prisma/client";

const fetchUserDetails = async ({ id }: { id: User["id"] }) => {
  return await prisma.user.findUnique({
    where: { id },
    include: {
      groups: {
        include: {
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

export async function getUserByEmail(email: Email["email"]) {
  return prisma.user.findFirst({ where: { email: { email } } });
}

export async function createUser(
  email: Email["email"],
  name: string,
  password: string,
  inviteToken?: string | null
) {
  const hashedPassword = await bcrypt.hash(password, 10);

  const user = await prisma.user.create({
    data: {
      email: {
        create: {
          email,
        },
      },
      name,
      password: {
        create: {
          hash: hashedPassword,
        },
      },
    },
  });

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

export async function createAnonymousUser(name: string, groupId: Group["id"]) {
  const user = await prisma.user.create({
    data: {
      name,
      role: "ANONYMOUS",
      groups: {
        create: {
          groupId,
        },
      },
    },
  });

  return user;
}

export async function deleteUserByEmail(email: Email["email"]) {
  return prisma.user.delete({ where: {} });
}

export async function mergeUsers(fromUserId: User["id"], toUserId: User["id"]) {
  const fromUser = await prisma.user.findUnique({
    where: {
      id: fromUserId,
    },
    include: {
      groups: {
        select: {
          groupId: true,
        },
      },
    },
  });

  if (!fromUser) {
    throw Error("No fromUser found");
  }

  // Anonymous users should only ever have one group
  if (fromUser.groups.length !== 1) {
    throw Error(
      "Something went wrong. Tried to merge user with more than 1 group."
    );
  }

  const toUser = await prisma.user.findUnique({
    where: {
      id: toUserId,
    },
    include: {
      groups: {
        select: {
          groupId: true,
        },
      },
    },
  });

  if (!toUser) {
    throw Error("No toUser found");
  }

  // Make sure users share group
  const sharesGroup = fromUser.groups.some((group) =>
    toUser.groups.find((g) => g.groupId === group.groupId)
  );

  if (!sharesGroup) {
    throw Error("Can't merge users that don't share a group");
  }

  // TODO handle all collisions. Right now PKs might conflict.

  // Update group locations
  await prisma.groupLocation.updateMany({
    where: {
      discoveredById: fromUserId,
    },
    data: {
      discoveredById: toUserId,
    },
  });

  // Update scores
  await prisma.score.updateMany({
    where: {
      userId: fromUserId,
    },
    data: {
      userId: toUserId,
    },
  });

  // Update choosen by
  await prisma.lunch.updateMany({
    where: {
      choosenByUserId: fromUserId,
    },
    data: {
      choosenByUserId: toUserId,
    },
  });

  // Delete anonymous user
  await prisma.groupMember.delete({
    where: {
      userId_groupId: {
        userId: fromUserId,
        groupId: fromUser.groups[0].groupId,
      },
    },
  });
  await prisma.user.delete({
    where: {
      id: fromUserId,
    },
  });
}

export async function verifyLogin(
  email: Email["email"],
  password: Password["hash"]
) {
  const userWithPassword = await prisma.user.findFirst({
    where: { email: { email } },
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
  const lowestScore = sortedScores[0]?.lunch.groupLocation.location.name || "-";
  const highestScore =
    sortedScores[sortedScores.length - 1]?.lunch.groupLocation.location.name ||
    "-";

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
