"use server"

import { count, db, eq, or } from "@dir/db";
import { z } from 'zod'


import { createAction } from '../../../../lib/createAction';
import { CreateItemSchema } from "./schema";
import { item } from "packages/db/drizzle/schema";


export const getAllItems = createAction(
  async ({ }, params) => {
    if (!params) {
      throw new Error('Parameters are undefined');
    }
    const { skip, take, where } = params

    const whereIdCondition = where?.OR?.find((condition: any) => condition?.id !== undefined)?.id;

    const items = await db.query.item.findMany({
      where: (item, { or, eq }) => or(whereIdCondition ? eq(item.id, whereIdCondition) : undefined),
      limit: take,
      offset: skip
    })

    const itemCountResult = await db.select({ count: count() })
      .from(item)
      .where(or(
        whereIdCondition ? eq(item.id, whereIdCondition) : undefined
      ))

    const itemCount: number = itemCountResult.reduce((accumulator, currentValue) => accumulator + currentValue.count, 0);

    return { items, count: itemCount };
  },
  z.object({
    skip: z.number().optional(),
    take: z.number().optional(),
    where: z.any(),
  }),
  { authed: true }
);


export const createItem = createAction(async ({ }, { title, description, price, image, effect }) => {

  const createdItems = await db.insert(item)
    .values({
      title,
      description,
      price: Number(price),
      image,
      effect
    })
    .returning()

  const createdItem = createdItems[0];
  return createdItem

}, CreateItemSchema)

export const getSingleItem = createAction(async ({ }, { id }) => {

  const itemResult = await db.query.item.findFirst({
    where: (item, { eq }) => eq(item.id, id)
  })

  return itemResult

}, z.object({
  id: z.string()
}))

export const updateItem = createAction(async ({ }, params) => {
  if (!params) {
    throw new Error('Parameters are undefined');
  }

  const updatedItems = await db.update(item)
    .set(params)
    .where(eq(item.id, params.id))
    .returning();

  const updatedItem = updatedItems[0];
  return updatedItem;
}, CreateItemSchema.extend({
  id: z.string()
}), { authed: true });
