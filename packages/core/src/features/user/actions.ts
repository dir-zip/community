"use server"
import { z } from 'zod'
import { createAction } from "~/lib/createAction"
import { schema, InferSelectModel, eq, db, and, inArray, notInArray, count } from "@dir/db"
import { revalidatePath } from 'next/cache'
import { effects } from '~/itemEffects'
import { PasswordHandler, generateToken } from 'packages/auth'
import { inventoryItem, item, post, postTags, tag, token, user } from 'packages/db/drizzle/schema'

export const updateUser = createAction(async ({ validate }, { avatar, userId, bannerImage }) => {
  await validate(['UPDATE', "user", userId])

  const updatedUsers = await db.update(schema.user)
    .set({
      avatar,
      bannerImage
    })
    .where(eq(schema.user.id, userId))
    .returning()

  revalidatePath('/')

  const updatedUser = updatedUsers[0]
  return updatedUser;

}, z.object({
  avatar: z.string().optional(),
  bannerImage: z.string().optional(),
  userId: z.string()
}), { authed: true })

export const getUserInventory = createAction(async ({ validate }, { userId }) => {
  // await validate(['UPDATE', "user", userId])

  const inventory = await db.query.inventory.findFirst({
    where: (i, { eq }) => eq(i.userId, userId),
    with: {
      inventoryItems: {
        with: {
          badge: true,
          item: true
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
  inventory.inventoryItems.forEach((collectionItem) => {
    const itemId = collectionItem.item?.id;
    itemCounts.set(itemId, (itemCounts.get(itemId) || 0) + 1);
  });

  // Create a new collection array with unique items and their quantities
  const uniqueCollectionWithQuantity = inventory.inventoryItems.reduce<(InferSelectModel<typeof schema.inventoryItem> & { item: InferSelectModel<typeof schema.item> | null, quantity: number })[]>((unique, collectionItem) => {
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
}), { authed: true })

export const equipAndUnequipItem = createAction(async ({ session, validate }, { itemId }) => {
  await validate(['UPDATE', "user", session?.data.userId])

  const findItem = await db.query.inventoryItem.findFirst({
    where: (item, { eq }) => eq(item.id, itemId),
    with: {
      item: true
    }
  })

  if (!findItem) {
    throw new Error('Item not found');
  }

  const itemEffect = findItem.item?.effect;
  const effectModifier = effects.find(effect => effect.name === itemEffect)?.modifies;

  if (findItem.equipped) {

    await db.update(inventoryItem)
      .set({ equipped: false })
      .where(eq(inventoryItem.id, itemId))

  } else {

    const findItemId = findItem.itemId
    const sameItemEquipped = findItemId
      ? await db.query.inventoryItem.findFirst({
        where: (item, { eq, and }) => and(
          eq(item.equipped, true),
          eq(item.itemId, findItemId)
        )
      })
      : undefined

    if (sameItemEquipped) {
      throw new Error('Another item with the same ID is already equipped');
    }

    const effectNamesWithSameModifier = effects
      .filter(effect => effect.modifies === effectModifier)
      .map(effect => effect.name);

    const sameModifierEquipped = await db
      .select({
        id: inventoryItem.id
      })
      .from(inventoryItem)
      .innerJoin(item, eq(inventoryItem.itemId, item.id))
      .where(
        and(
          eq(inventoryItem.equipped, true),
          inArray(item.effect, effectNamesWithSameModifier)
        )
      )

    for (const itemToUnequip of sameModifierEquipped) { // Corrected variable name

      await db.update(inventoryItem)
        .set({ equipped: false })
        .where(eq(inventoryItem.id, itemToUnequip.id))
    }


    await db.update(inventoryItem)
      .set({ equipped: true })
      .where(eq(inventoryItem.id, itemId))
  }
  revalidatePath('/')
  revalidatePath('/settings/inventory')

}, z.object({
  itemId: z.string(),
}), { authed: true })

export const getUsersPosts = createAction(async ({ }, { username, skip, take }) => {

  const subQueryUsers = await db.select({ id: user.id }).from(user).where(eq(user.username, username));
  const subQueryTags = await db.select({ id: tag.id }).from(tag).where(eq(tag.slug, 'feed'));
  const subQueryPostTags = (subQueryTags.length > 0)
    ? await db.select({ postId: postTags.postId }).from(postTags).where(inArray(postTags.tagId, subQueryTags.map(item => item.id)))
    : undefined

  const posts = await db
    .select()
    .from(post)
    .where(
      and(
        inArray(post.userId, subQueryUsers.map(item => item.id)),
        (subQueryPostTags && subQueryPostTags.length > 0) ? notInArray(post.id, subQueryPostTags.map(item => item.postId)) : undefined
      )
    )
    .limit(take || 1000)
    .offset(skip || 0)


  const postCountResult = await db.select({ count: count() })
    .from(post)
    .where(
      and(
        inArray(post.userId, subQueryUsers.map(item => item.id)),
        (subQueryPostTags && subQueryPostTags.length > 0) ? notInArray(post.id, subQueryPostTags.map(item => item.postId)) : undefined
      )
    )

  const postCount: number = postCountResult.reduce((accumulator, currentValue) => accumulator + currentValue.count, 0);

  return { data: posts, count: postCount }
}, z.object({
  username: z.string(),
  skip: z.number().optional(),
  take: z.number().optional(),
}), { authed: false })

export const getUserBadges = createAction(async ({ }, { userId }) => {

  const inventoryResult = await db.query.inventory.findFirst({
    where: (inventory, { eq }) => eq(inventory.userId, userId),
    with: {
      inventoryItems: {
        with: {
          badge: true
        }
      }
    }
  })

  return inventoryResult
}, z.object({
  userId: z.string()
}), { authed: false })

export const getAllUserCount = createAction(async ({ }) => {

  const userCountResult = await db.select({ count: count() }).from(user)
  const userCount: number = userCountResult.reduce((accumulator, currentValue) => accumulator + currentValue.count, 0);

  return userCount
}, undefined, { authed: false })

export const createInvite = createAction(async ({ validate }, { userId }) => {
  await validate(['UPDATE', "user", userId])
  const newToken = generateToken(16);
  const hashedToken = await PasswordHandler.hash(newToken);


  await db.insert(token).values({
    type: "INVITE_TOKEN",
    userId: userId,
    hashedToken: hashedToken,
    expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24)
  })

  revalidatePath('/settings/invites')

  return newToken

}, z.object({
  avatar: z.string().optional(),
  userId: z.string()
}), { authed: true })

