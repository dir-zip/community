"use server"

import { prisma } from "@dir/db";
import {z} from 'zod'


import {createAction as _createAction} from '../../../../lib/createAction';
import { CreateActionSchema } from "./schema";


export const getAllActions = _createAction(
  async ({}, params) => {
    if (!params) {
      throw new Error('Parameters are undefined');
    }
    const { skip, take, where } = params
    const actions = await prisma.action.findMany({
      take,
      skip,
      where,
    });

    const count = await prisma.action.count({
      where,
    });

    return { actions, count };
  },
  z.object({
    skip: z.number().optional(),
    take: z.number().optional(),
    where: z.any(),
  }),
  {authed: true}
);


export const createAction = _createAction(async({}, {title, value}) => {

  const item = await prisma.action.create({
    data: {
      title,
      value: Number(value)
    }
  })

  return item

}, CreateActionSchema)

export const getSingleAction = _createAction(async({}, {id}) => {

  const action = await prisma.action.findFirst({
    where: {
      id
    }
  })

  return action

}, z.object({
  id: z.string()
}))

export const updateAction = _createAction(async ({}, params) => {
  if (!params) {
    throw new Error('Parameters are undefined');
  }

  const user = await prisma.action.update({
    where: { id: params.id },
    data: { ...params },
  });

  return user;
}, CreateActionSchema.extend({
  id: z.string()
}), {authed: true});
