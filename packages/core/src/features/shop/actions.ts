"use server";

import { createAction } from "~/lib/createAction";
import {z} from 'zod'
import {prisma} from '@dir/db'
import { revalidatePath } from "next/cache";


export const buyItem = createAction(async({session}, {itemId}) => {
  // Fetch the user and item data
  const user = await prisma.user.findUnique({
    where: { id: session?.data.userId },
    include: {
      inventory: true
    }
  });
  const item = await prisma.item.findUnique({
    where: { id: itemId }
  });

  // Check if the user has enough points
  if (user?.points! < item?.price!) {
    throw new Error("Not enough points");
  }

    // Deduct the item's price from the user's points
    await prisma.user.update({
      where: { id: user?.id },
      data: { points: user?.points! - item?.price! }
    });

      // Add the item to the user's inventory
  await prisma.inventoryItem.create({
    data: {
      type: "ITEM",
      item: {
        connect: {
          id: item!.id,
        },
      },
      equipped: false,
      inventory: {
        connect: {
          id: user!.inventory!.id,
        },
      },
    },
  });

  revalidatePath('/')

  return { message: "Item purchased successfully" };


}, z.object({itemId: z.string()}), {authed: true})