import type { User, Group } from "@prisma/client";

import { prisma } from "~/db.server";

export type { Group } from "@prisma/client";

export function getGroup({
  id,
}: Pick<Group, "id"> & {
  userId: User["id"];
}) {
  return prisma.group.findUnique({
    where: { id },
    include: {
      locations: {
        include: {
          location: true,
          lunches: {
            include: {
              location: true,
              choosenBy: true,
              scores: true,
            },
          },
        },
      },
      users: {
        include: {
          user: true,
        },
      },
    },
  });
}

export function getUserGroups({ userId }: { userId: User["id"] }) {
  return prisma.group.findMany({ where: { users: { some: { userId } } } });
}

export function createGroup({
  name,
  userId,
}: Pick<Group, "name"> & {
  userId: User["id"];
}) {
  return prisma.group.create({
    data: {
      name,
      users: {
        create: [
          {
            role: "ADMIN",
            user: {
              connect: {
                id: userId,
              },
            },
          },
        ],
      },
    },
  });
}

export function joinGroup({
  groupId,
  userId,
}: {
  groupId: Group["id"];
  userId: User["id"];
}) {
  return prisma.group.update({
    where: {
      id: groupId,
    },
    data: {
      users: {
        create: {
          user: {
            connect: {
              id: userId,
            },
          },
        },
      },
    },
  });
}
