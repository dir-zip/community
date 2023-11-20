"use server"
import "server-only"
import { prisma } from "@dir/db";
import {z} from 'zod'
import { prepareArrayField } from "@creatorsneverdie/prepare-array-for-prisma"

import {createAction} from '../../../../lib/createAction';
import { CreateBadgeSchema } from "./schema";


export const getAllBadges = createAction(
  async ({}, params) => {
    if (!params) {
      throw new Error('Parameters are undefined');
    }
    const { skip, take, where } = params
    const badges = await prisma.badge.findMany({
      take,
      skip,
      where,
    });

    const count = await prisma.badge.count({
      where,
    });

    return { badges, count };
  },
  z.object({
    skip: z.number().optional(),
    take: z.number().optional(),
    where: z.any(),
  }),
  {authed: true}
);


export const createBadge = createAction(async({}, {title, description, image, condition}) => {

  const badge = await prisma.badge.create({
    data: {
      title,
      description,
      image,
      condition: {
        create: {
          actions: prepareArrayField(
            condition.map((c) => {
              return { id: c }
            })
          ),
        }
      }
    }
  })

  return badge

}, CreateBadgeSchema)

export const getSingleBadge = createAction(async({}, {id}) => {

  const badge = await prisma.badge.findFirst({
    where: {
      id
    },
    include: {
      condition: {
        include: {
          actions: true
        }
      }
    }
  })

  return badge

}, z.object({
  id: z.string()
}), {authed: true})

export const updateBadge = createAction(async ({}, params) => {
  if (!params) {
    throw new Error('Parameters are undefined');
  }

  const findBadge = await prisma.badge.findFirst({
    where: {
      id: params.id
    },
    include: {
      condition: {
        include: {
          actions: true
        }
      }
    }
  })

  const mappedActions = prepareArrayField(
    params.condition.map((c) => {
      return { id: c }
    }) || [],
    findBadge?.condition?.actions,
    (item) => ({
      ...item,
    }),
    { removedItemsMethod: "disconnect" }
  )

  const badge = await prisma.badge.update({
    where: { id: params.id },
    data: { 
      ...params, 
      condition: {
        update: {
          actions: mappedActions,
        },
      }
    }
  });

  return badge;
}, CreateBadgeSchema.extend({
  id: z.string()
}), {authed: true});

export const deleteBadge = createAction(async({}, params) => {
  const condition = await prisma.condition.findFirst({
    where: {
      badgeId: params.id,
    }
  })

  await prisma.condition.delete({
    where: {
      id: condition?.id,
    }
  })

  const badge = await prisma.badge.delete({
    where: {
      id: params.id
    }
  })

  return badge


}, z.object({
  id: z.string()
}), {authed: true})
