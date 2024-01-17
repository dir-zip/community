"use server"
import {z} from 'zod'
import { createAction } from "~/lib/createAction"
import {InventoryItem, Item, prisma} from "@dir/db"
import { revalidatePath } from 'next/cache'

export const updateUser = createAction(async({validate}, {avatar, userId}) => {
  await validate(['UPDATE', "user", userId])

  const user = await prisma.user.update({
    where: {id: userId},
    data: {
      avatar
    }
  })

  revalidatePath('/')

  return user

}, z.object({
  avatar: z.string().optional(),
  userId: z.string()
}), {authed: true})


export const getUserInventory = createAction(async({validate}, { userId}) => {
  await validate(['UPDATE', "user", userId])

  const inventory = await prisma.inventory.findFirst({
    where: {
      userId: userId
    },
    include: {
      collection: {
        include: {
          badge: true,
          item: true,
        }
      }
    }
  })

  if (!inventory) {
    return null; 
  }

  // Create a map to count the quantity of each item
  const itemCounts = new Map();

  // Iterate over the items and count them
  inventory.collection.forEach((collectionItem) => {
    const itemId = collectionItem.item?.id;
    itemCounts.set(itemId, (itemCounts.get(itemId) || 0) + 1);
  });

  // Create a new collection array with unique items and their quantities
  const uniqueCollectionWithQuantity = inventory.collection.reduce<(InventoryItem & {item: Item | null, quantity: number})[]>((unique, collectionItem) => {
    const itemId = collectionItem.item?.id;
    if (itemId && !unique.some(item => item.item?.id === itemId)) {
      unique.push({
        ...collectionItem,
        quantity: itemCounts.get(itemId)
      });
    }
    return unique;
  }, []);

  // Return the modified inventory object
  return {
    ...inventory,
    collection: uniqueCollectionWithQuantity
  };

}, z.object({
  avatar: z.string().optional(),
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
  revalidatePath('/')
  revalidatePath('/settings/inventory')

}, z.object({
  itemId: z.string(),
}), {authed: true})