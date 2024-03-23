"use server";

import { createAction } from "~/lib/createAction";
import { z } from 'zod'
import { db, eq } from '@dir/db'
import { revalidatePath } from "next/cache";
import { inventoryItem, user } from "packages/db/drizzle/schema";


export const buyItem = createAction(async ({ session }, { itemId }) => {
  // Fetch the user and item data

  // FIXME: Remove this block as needed
  // const user = await prisma.user.findUnique({
  //   where: { id: session?.data.userId },
  //   include: {
  //     inventory: true
  //   }
  // });
  const userResult = session?.data.userId
    ? await db.query.user.findFirst({
      where: (u, { eq }) => eq(u.id, session?.data.userId),
      with: { inventory: true }
    })
    : undefined


  // FIXME: Remove this block as needed
  // const item = await prisma.item.findUnique({
  //   where: { id: itemId }
  // });
  const item = await db.query.item.findFirst({
    where: (i, { eq }) => eq(i.id, itemId)
  })

  // Check if the user has enough points
  if (userResult?.points! < item?.price!) {
    throw new Error("Not enough points");
  }

  // Deduct the item's price from the user's points

  // FIXME: Remove this block as needed
  // await prisma.user.update({
  //   where: { id: user?.id },
  //   data: { points: user?.points! - item?.price! }
  // });
  
  if (userResult && item) {
    await db.update(user)
      .set({ points: (userResult.points - item.price) })
      .where(eq(user.id, userResult.id))
  }

  // Add the item to the user's inventory

  // FIXME: Remove this block as needed
  // await prisma.inventoryItem.create({
  //   data: {
  //     type: "ITEM",
  //     item: {
  //       connect: {
  //         id: item!.id,
  //       },
  //     },
  //     equipped: false,
  //     inventory: {
  //       connect: {
  //         id: user!.inventory!.id,
  //       },
  //     },
  //   },
  // });

  if (item && userResult?.inventoryId) {
    await db.insert(inventoryItem)
      .values({
        type: "ITEM",
        itemId: item.id,
        equipped: false,
        inventoryId: userResult.inventoryId,
      })
  }

  revalidatePath('/')

  return { message: "Item purchased successfully" };


}, z.object({ itemId: z.string() }), { authed: true })