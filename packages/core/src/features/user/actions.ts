"use server"
import {z} from 'zod'
import { createAction } from "~/lib/createAction"
import {InventoryItem, Item, prisma} from "@dir/db"
import { revalidatePath } from 'next/cache'
import { effects } from '~/itemEffects'
import { PasswordHandler, generateToken } from 'packages/auth'

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
  // await validate(['UPDATE', "user", userId])

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

export const equipAndUnequipItem = createAction(async({session, validate}, {itemId}) => {
  await validate(['UPDATE', "user", session?.data.userId])
  const findItem = await prisma.inventoryItem.findFirst({
    where: {
      id: itemId
    },
    include: {
      item: true
    }
  })

  if (!findItem) {
    throw new Error('Item not found');
  }

  const itemEffect = findItem.item?.effect;
  const effectModifier = effects.find(effect => effect.name === itemEffect)?.modifies;

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

    const effectNamesWithSameModifier = effects
    .filter(effect => effect.modifies === effectModifier)
    .map(effect => effect.name);

    const sameModifierEquipped = await prisma.inventoryItem.findMany({
      where: {
        equipped: true,
        item: {
          effect: {
            in: effectNamesWithSameModifier
          }
        }
      },
      include: {
        item: true
      }
    });


    for (const itemToUnequip of sameModifierEquipped) { // Corrected variable name
      await prisma.inventoryItem.update({
        where: {
          id: itemToUnequip.id // Corrected reference to the variable
        },
        data: {
          equipped: false
        }
      });
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

export const getUsersPosts = createAction(async ({ }, { username, skip, take }) => {
  const posts = await prisma.post.findMany({
    skip,
    take,
    where: {
      user: {
        username: username
      },
      tags: {
        none: {
          slug: 'feed'
        }
      }
    }
  })

  const count = await prisma.post.count({
    where: {
      user: {
        username: username
      },
      tags: {
        none: {
          slug: 'feed'
        }
      }
    }
  })

  return { data: posts, count }
}, z.object({
  username: z.string(),
  skip: z.number().optional(),
  take: z.number().optional(),
}), { authed: false })

export const getUserBadges = createAction(async ({ }, { userId }) => {
  const inventory = await prisma.inventory.findFirst({
    where: {
      userId,
    },
    include: {
      collection: {
        include: {
          badge: true,
        },
      },
    },
  })

  return inventory
}, z.object({
  userId: z.string()
}), { authed: false })

export const getAllUserCount = createAction(async ({}) => {
  const users = await prisma.user.count()
  return users
}, undefined, {authed: false})

export const createInvite = createAction(async({validate}, {userId}) => {
  await validate(['UPDATE', "user", userId])
  const token = generateToken(16);
  const hashedToken = await PasswordHandler.hash(token);
  await prisma.token.create({
    data: {
      type: "INVITE_TOKEN",
      userId: userId,
      hashedToken: hashedToken,
      expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24),
    },
  });

  revalidatePath('/settings/invites')

  return token

}, z.object({
  avatar: z.string().optional(),
  userId: z.string()
}), {authed: true})

