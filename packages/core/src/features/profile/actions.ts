"use server"

import { createAction } from "~/lib/createAction"
import {prisma} from '@dir/db'
import {z} from 'zod'
import { revalidatePath } from "next/cache"

export const getUser = createAction(async ({}, {username}) => {
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

export const getInventory = createAction(async({}, {userId}) => {
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
}), {authed: true})

export const equipAndUnequipItem = createAction(async({session}, {itemId}) => {
  const findItem = await prisma.inventoryItem.findFirst({
    where: {
      id: itemId
    }
  })

  if (!findItem) {
    throw new Error('Item not found');
  }

  if (findItem.equipped) {
    await prisma.inventoryItem.update({
      where: {
        id: itemId
      },
      data: {
        equipped: false
      }
    });
  } else {

    const sameItemEquipped = await prisma.inventoryItem.findFirst({
      where: {
        itemId: findItem.itemId,
        equipped: true
      }
    });

    if (sameItemEquipped) {
      throw new Error('Another item with the same ID is already equipped');
    }


    await prisma.inventoryItem.update({
      where: {
        id: itemId
      },
      data: {
        equipped: true
      }
    });
  }

  revalidatePath('/profile/*')

}, z.object({
  itemId: z.string(),
}), {authed: true})
