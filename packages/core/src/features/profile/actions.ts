"use server"

import { createAction } from "~/lib/createAction"
import { prisma } from '@dir/db'
import { z } from 'zod'

export const getUser = createAction(async ({ }, { username }) => {
  const user = await prisma.user.findFirst({
    where: {
      username
    },
    include: {
      posts: true
    }
  })

  return user
}, z.object({
  username: z.string()
}))

export const getInventory = createAction(async ({ }, { userId }) => {
  const inventory = await prisma.inventory.findFirst({
    where: {
      userId,
    },
    include: {
      collection: {
        include: {
          item: true,
          badge: true,
        },
      },
    },
  })

  return inventory
}, z.object({
  userId: z.string()
}), { authed: true })



