"use server"
import "server-only"
import { prisma, type Item } from "@dir/db";
import {z} from 'zod'


import {createAction} from '../../../../lib/createAction';
import { CreateItemSchema } from "./schema";


export const getAllItems = createAction(
  async ({}, params) => {
    if (!params) {
      throw new Error('Parameters are undefined');
    }
    const { skip, take, where } = params
    const items = await prisma.item.findMany({
      take,
      skip,
      where,
    });

    const count = await prisma.item.count({
      where,
    });

    return { items, count };
  },
  z.object({
    skip: z.number().optional(),
    take: z.number().optional(),
    where: z.any(),
  }),
  {authed: true}
);


export const createItem = createAction(async({}, {title, description, price, image}) => {

  const item = await prisma.item.create({
    data: {
      title,
      description,
      price: Number(price),
      image
    }
  })

  return item

}, CreateItemSchema)

export const getSingleItem = createAction(async({}, {id}) => {

  const item = await prisma.item.findFirst({
    where: {
      id
    }
  })

  return item

}, z.object({
  id: z.string()
}))

export const updateItem = createAction(async ({}, params) => {
  if (!params) {
    throw new Error('Parameters are undefined');
  }

  const user = await prisma.item.update({
    where: { id: params.id },
    data: { ...params },
  });

  return user;
}, CreateItemSchema.extend({
  id: z.string()
}), {authed: true});
