"use server"

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


export const createBadge = createAction(async({}, {title, description, image, conditions}) => {
  const preparedConditions = prepareArrayField(
    conditions,
    [], // The initial array is empty for a new badge
    (item) => ({

        action: {
          connect: {
            id: item.action
          }
        },
        quantity: item.quantity
      
    })
  );


  const badge = await prisma.badge.create({
    data: {
      title,
      description,
      image,
      conditions: preparedConditions
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
      conditions: {
        include: {
          action: true
        },
        orderBy: {
          id: 'asc'
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
      conditions: {
        include: {
          action: true
        },
        orderBy: {
          id: 'asc'
        }
      }
    }
  })


  const preparedConditions = prepareArrayField(
    params.conditions,
    findBadge?.conditions,
    (item) => ({
      action: {
        connect: {
          id: item.action
        }
      },
      quantity: item.quantity
    }),
    { removedItemsMethod: 'delete' }
  );



  const badge = await prisma.badge.update({
    where: { id: params.id },
    data: { 
      ...params, 
      conditions: preparedConditions
    }
  });

  return badge;
}, CreateBadgeSchema.extend({
  id: z.string()
}), {authed: true});

export const deleteBadge = createAction(async({}, params) => {
  // Delete all conditions associated with the badge
  await prisma.condition.deleteMany({
    where: {
      badgeId: params.id,
    }
  });

  // Then delete the badge itself
  const badge = await prisma.badge.delete({
    where: {
      id: params.id
    }
  });

  return badge;


}, z.object({
  id: z.string()
}), {authed: true})
