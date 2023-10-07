import type { Email, Group, Password, Prisma, User } from "@prisma/client"
import bcrypt from "bcryptjs"
import isAfter from "date-fns/isAfter"
import sub from "date-fns/sub"
import { nanoid } from "nanoid"

import { prisma } from "~/db.server"
import type { Theme } from "~/styles/theme"
import { cleanEmail, getAverageNumber, getRandomAvatarId, hashStr } from "~/utils"

export type { User, Email } from "@prisma/client"

export type FullUser = NonNullable<Prisma.PromiseReturnType<typeof fetchUserDetails>>

export type UserPermissions = {
  view: boolean
  settings: boolean
  claim: boolean
}
export const getUserPermissions = async ({
  currentUserId,
  user,
}: {
  currentUserId?: User["id"]
  user: FullUser
}): Promise<UserPermissions> => {
  const isAdmin = currentUserId ? await checkIsAdmin(currentUserId) : false
  const isUser = currentUserId === user.id

  const sharesGroup = user.groups.some((x) => x.group.members.some((m) => m.userId === currentUserId))

  return {
    view: isUser || isAdmin || sharesGroup,
    settings: isUser || isAdmin,
    claim: user.role === "ANONYMOUS" && sharesGroup,
  }
}

const fetchUserDetails = async ({ id }: { id: User["id"] }) => {
  return await prisma.user.findUnique({
    where: { id },
    include: {
      email: {
        select: {
          verified: true,
          email: true,
        },
      },
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
              choosenBy: true,
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
      scoreRequests: {
        include: {
          requestedBy: {
            select: { name: true },
          },
          lunch: {
            select: {
              id: true,
              date: true,
              groupLocation: {
                select: {
                  group: {
                    select: {
                      id: true,
                      name: true,
                    },
                  },
                  location: {
                    select: {
                      name: true,
                    },
                  },
                },
              },
            },
          },
        },
      },
    },
  })
}

export async function getUserForAdmin({ id }: { id: User["id"] }) {
  return prisma.user.findUnique({
    where: { id },
    select: {
      id: true,
      name: true,
      passwordResetToken: true,
      email: {
        select: {
          verified: true,
          email: true,
        },
      },
    },
  })
}

export async function getFullUserById({ id, requestUserId }: { id: User["id"]; requestUserId?: User["id"] }) {
  const user = await fetchUserDetails({ id })

  if (!user) return null

  const filteredUser: typeof user = {
    ...user,
    scores: user.scores.filter((score) => {
      if (score.lunch.groupLocation.group.public) return true

      return score.lunch.groupLocation.group.members.some(
        (x) => x.userId === requestUserId || score.lunch.groupLocation.group.public
      )
    }),
  }

  const stats = generateUserStats(filteredUser)

  return {
    ...filteredUser,
    theme: filteredUser.theme as Theme,
    stats,
  }
}

export async function getAllUsers() {
  return prisma.user.findMany({
    where: {
      role: {
        not: "ANONYMOUS",
      },
    },
    include: {
      email: {
        select: {
          email: true,
          verified: true,
        },
      },
      groups: {
        include: {
          group: {
            select: {
              _count: true,
            },
          },
        },
      },
      scores: {
        select: {
          id: true,
        },
      },
    },
  })
}

export async function getAllAnonymousUsers() {
  return prisma.user.findMany({
    where: {
      role: "ANONYMOUS",
    },
    include: {
      scores: {
        select: {
          id: true,
        },
      },
    },
  })
}

export async function getUserById(id: User["id"]) {
  return prisma.user.findUnique({ where: { id } })
}

export async function getUserByEmail(email: Email["email"]) {
  return await prisma.user.findFirst({
    where: { email: { email: cleanEmail(email) } },
  })
}

export async function createUser(
  email: Email["email"],
  name: string,
  password: string,
  inviteToken?: string | null
) {
  const hashedPassword = await hashPassword(password)

  const avatarId = getRandomAvatarId(email)

  const user = await prisma.user.create({
    data: {
      email: {
        create: {
          email: cleanEmail(email),
          verificationRequestTime: new Date(),
          verificationToken: nanoid(),
        },
      },
      name,
      avatarId,
      password: {
        create: {
          hash: hashedPassword,
        },
      },
    },
    include: {
      email: {
        select: {
          verificationToken: true,
          email: true,
        },
      },
    },
  })

  const hash = hashStr(user.id)
  const randomAvatarId = (hash % 30) + 1
  await prisma.user.update({
    where: {
      id: user.id,
    },
    data: {
      avatarId: randomAvatarId,
    },
  })

  let group = undefined
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
    })
  }

  return { user, groupId: group?.id }
}

export async function createAnonymousUser(name: string, groupId: Group["id"], byUserId: User["id"]) {
  const group = await prisma.group.findFirst({
    where: {
      id: groupId,
      members: {
        some: {
          userId: byUserId,
        },
      },
    },
  })

  if (!group) return null

  const avatarId = getRandomAvatarId(name)

  const user = await prisma.user.create({
    data: {
      name,
      role: "ANONYMOUS",
      avatarId,
      groups: {
        create: {
          groupId,
        },
      },
    },
  })

  return user
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
  })

  if (!fromUser) {
    throw Error("No fromUser found")
  }

  // Anonymous users should only ever have one group
  if (fromUser.groups.length !== 1) {
    throw Error("Something went wrong. Tried to merge user with more than 1 group.")
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
  })

  if (!toUser) {
    throw Error("No toUser found")
  }

  // Make sure users share group
  const sharesGroup = fromUser.groups.some((group) => toUser.groups.find((g) => g.groupId === group.groupId))

  if (!sharesGroup) {
    throw Error("Can't merge users that don't share a group")
  }

  // Update group locations
  await prisma.groupLocation.updateMany({
    where: {
      discoveredById: fromUserId,
    },
    data: {
      discoveredById: toUserId,
    },
  })

  // Update scores
  await prisma.score.updateMany({
    where: {
      userId: fromUserId,
      NOT: {
        lunch: {
          scores: {
            some: {
              userId: toUserId,
            },
          },
        },
      },
    },
    data: {
      userId: toUserId,
    },
  })

  // Update choosen by
  await prisma.lunch.updateMany({
    where: {
      choosenByUserId: fromUserId,
    },
    data: {
      choosenByUserId: toUserId,
    },
  })

  // Delete anonymous user
  await prisma.groupMember.delete({
    where: {
      userId_groupId: {
        userId: fromUserId,
        groupId: fromUser.groups[0].groupId,
      },
    },
  })
  await prisma.user.delete({
    where: {
      id: fromUserId,
    },
  })
}

export async function verifyLogin(email: Email["email"], password: Password["hash"]) {
  const userWithPassword = await prisma.user.findFirst({
    where: { email: { email } },
    include: {
      password: true,
    },
  })

  if (!userWithPassword || !userWithPassword.password) {
    return null
  }

  const isValid = await bcrypt.compare(password, userWithPassword.password.hash)

  if (!isValid) {
    return null
  }

  const { password: _password, ...userWithoutPassword } = userWithPassword

  await prisma.user.update({
    where: {
      id: userWithoutPassword.id,
    },
    data: {
      lastLogin: new Date(),
    },
  })

  return userWithoutPassword
}

export async function forceCreateResetPasswordTokenForUserId(id: User["id"]) {
  const user = await prisma.user.update({
    where: { id },
    data: {
      passwordResetTime: null,
      passwordResetToken: null,
    },
    select: { email: { select: { email: true } } },
  })

  if (!user.email) return ""

  return createResetPasswordToken(user.email.email)
}

export async function createResetPasswordToken(email: Email["email"]) {
  // TODO investigate value in hashing the tokens
  const token = nanoid()

  const users = await prisma.user.updateMany({
    where: {
      email: {
        email,
      },
      OR: [
        {
          passwordResetTime: {
            lte: sub(new Date(), { minutes: 10 }),
          },
        },
        {
          passwordResetTime: null,
        },
      ],
    },
    data: {
      passwordResetTime: new Date(),
      passwordResetToken: token,
    },
  })

  if (users.count === 0) {
    return null
  }

  if (users.count > 1) {
    throw "something went really wrong"
  }

  return token
}

export async function changeUserPassword({
  id,
  oldPassword,
  newPassword,
}: {
  id: User["id"]
  oldPassword: string
  newPassword: string
}) {
  const userWithPassword = await prisma.user.findUniqueOrThrow({
    where: { id },
    include: {
      password: true,
    },
  })

  const isValid = await bcrypt.compare(oldPassword, userWithPassword.password?.hash || "")

  if (!isValid) {
    return {
      error: "Invalid password",
    }
  }

  const hashedPassword = await hashPassword(newPassword)

  return await prisma.user.update({
    where: {
      id,
    },
    data: {
      passwordResetTime: null,
      passwordResetToken: null,
      password: {
        update: {
          hash: hashedPassword,
        },
      },
    },
  })
}

export async function changeUserPasswordWithToken({
  token,
  newPassword,
}: {
  token: string
  newPassword: string
}) {
  const userWithPasswordResetToken = await prisma.user.findFirst({
    where: {
      passwordResetToken: token,
      passwordResetTime: {
        gte: sub(new Date(), { minutes: 10 }),
      },
    },
  })

  if (!userWithPasswordResetToken || !userWithPasswordResetToken.passwordResetToken) {
    return null
  }

  const hashedPassword = await hashPassword(newPassword)

  return await prisma.user.update({
    where: {
      id: userWithPasswordResetToken.id,
    },
    data: {
      passwordResetTime: null,
      passwordResetToken: null,
      password: {
        update: {
          hash: hashedPassword,
        },
      },
    },
  })
}

export async function createEmailVerificationToken({ id }: { id: User["id"] }) {
  const user = await prisma.user.findUnique({
    where: {
      id,
    },
    include: {
      email: true,
    },
  })

  if (!user?.email || user.email.verified) return null

  if (
    user?.email?.verificationRequestTime &&
    isAfter(user.email.verificationRequestTime, sub(new Date(), { hours: 1 }))
  ) {
    return null
  }

  const token = nanoid()

  await prisma.email.update({
    where: {
      id: user?.email?.id,
    },
    data: {
      verificationRequestTime: new Date(),
      verificationToken: token,
    },
  })

  return { token, email: user.email.email }
}

export async function verifyUserEmail({ token }: { token: NonNullable<Email["verificationToken"]> }) {
  const email = await prisma.email.update({
    where: {
      verificationToken: token,
    },
    data: {
      verificationRequestTime: null,
      verificationToken: null,
      verified: true,
    },
    include: {
      user: {
        select: {
          id: true,
        },
      },
    },
  })

  return email.userId
}

export async function checkIsAdmin(userId: User["id"]) {
  const user = await prisma.user.findFirst({
    where: {
      role: "ADMIN",
      id: userId,
    },
  })

  return Boolean(user)
}

export async function updateUser(update: Partial<User>) {
  return prisma.user.update({
    where: {
      id: update.id,
    },
    data: {
      ...update,
    },
  })
}

export async function setAllUserAvatars() {
  const users = await prisma.user.findMany()

  for (const user of users) {
    const hash = hashStr(user.id)
    const randomAvatarId = (hash % 30) + 1
    await prisma.user.update({
      where: {
        id: user.id,
      },
      data: {
        avatarId: randomAvatarId,
      },
    })
  }
}

// TODO stats generation duplicated in group.server.ts
function generateUserStats(user: NonNullable<Prisma.PromiseReturnType<typeof fetchUserDetails>>) {
  const lunchCount = user.scores.length
  const averageScore = getAverageNumber(user.scores, "score")
  const sortedScores = user.scores.slice().sort((a, b) => a.score - b.score)
  const lowestScore = sortedScores.at(0)
  const highestScore = sortedScores.at(-1)

  const bestChoosenLunch = user.choosenLunches.reduce<(typeof user.choosenLunches)[0] | null>((acc, cur) => {
    if (!acc) return cur

    if (getAverageNumber(cur.scores, "score") > getAverageNumber(acc.scores, "score")) {
      return cur
    }

    return acc
  }, null)
  return {
    lunchCount,
    averageScore,
    lowestScore: lowestScore
      ? {
          groupId: lowestScore.lunch.groupLocationGroupId,
          name: lowestScore.lunch.groupLocation.location.name || "-",
          score: lowestScore.score,
          id: lowestScore.lunchId,
        }
      : null,
    highestScore: highestScore
      ? {
          groupId: highestScore.lunch.groupLocationGroupId,
          name: highestScore.lunch.groupLocation.location.name || "-",
          score: highestScore.score,
          id: highestScore.lunchId,
        }
      : null,
    bestChoosenLunch,
  }
}

const hashPassword = (password: string) => bcrypt.hash(password, 10)
