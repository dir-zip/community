"use server"

import { count, db, eq, or } from "@dir/db";
import { z } from 'zod'

import { createAction as _createAction } from '../../../../lib/createAction';
import { CreateActionSchema } from "./schema";
import { action } from "packages/db/drizzle/schema";


export const getAllActions = _createAction(
  async ({ }, params) => {
    if (!params) {
      throw new Error('Parameters are undefined');
    }
    const { skip, take, where } = params

    const whereIdCondition = where?.OR?.find((condition: any) => condition?.id !== undefined)?.id;


    const actions = await db.query.action.findMany({
      where: (action, { or, eq }) => or(whereIdCondition ? eq(action.id, whereIdCondition) : undefined),
      limit: take,
      offset: skip
    })


    const actionCountResult = await db.select({ count: count() })
      .from(action)
      .where(or(
        whereIdCondition ? eq(action.id, whereIdCondition) : undefined
      ))

    const actionCount: number = actionCountResult.reduce((accumulator, currentValue) => accumulator + currentValue.count, 0);

    return { actions, count: actionCount };
  },
  z.object({
    skip: z.number().optional(),
    take: z.number().optional(),
    where: z.any(),
  }),
  { authed: true }
);


export const createAction = _createAction(async ({ }, { title, value }) => {


  const createdItems = await db.insert(action)
    .values({
      title,
      value: Number(value)
    })
    .returning()

  const createdItem = createdItems[0];
  return createdItem

}, CreateActionSchema)

export const getSingleAction = _createAction(async ({ }, { id }) => {


  const actionResult = await db.query.action.findFirst({
    where: (action, { eq }) => eq(action.id, id)
  })

  return actionResult

}, z.object({
  id: z.string()
}))

export const updateAction = _createAction(async ({ }, params) => {
  if (!params) {
    throw new Error('Parameters are undefined');
  }


  const updatedActions = await db.update(action)
    .set(params)
    .where(eq(action.id, params.id))
    .returning();

  const updatedAction = updatedActions[0];
  return updatedAction;
}, CreateActionSchema.extend({
  id: z.string()
}), { authed: true });
