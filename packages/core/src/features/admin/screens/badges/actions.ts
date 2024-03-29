"use server"

import { and, count, db, eq, or } from "@dir/db";
import { z } from 'zod'
import { prepareArrayField } from "@creatorsneverdie/prepare-array-for-prisma"

import { createAction } from '../../../../lib/createAction';
import { CreateBadgeSchema } from "./schema";
import { badge, condition } from "packages/db/drizzle/schema";

export const getAllBadges = createAction(
  async ({ }, params) => {
    if (!params) {
      throw new Error('Parameters are undefined');
    }
    const { skip, take, where } = params

    const whereIdCondition = where?.OR?.find((condition: any) => condition?.id !== undefined)?.id;

    // FIXME: Remove this block as needed
    // const badges = await prisma.badge.findMany({
    //   take,
    //   skip,
    //   where,
    // });
    const badges = await db.query.badge.findMany({
      where: (badge, { or, eq }) => or(whereIdCondition ? eq(badge.id, whereIdCondition) : undefined),
      limit: take,
      offset: skip
    })

    // FIXME: Remove this block as needed
    // const count = await prisma.badge.count({
    //   where,
    // });
    const badgeCountResult = await db.select({ count: count() })
      .from(badge)
      .where(or(whereIdCondition ? eq(badge.id, whereIdCondition) : undefined))

    const badgeCount: number = badgeCountResult.reduce((accumulator, currentValue) => accumulator + currentValue.count, 0);

    return { badges, count: badgeCount };
  },
  z.object({
    skip: z.number().optional(),
    take: z.number().optional(),
    where: z.any(),
  }),
  { authed: true }
);

export const createBadge = createAction(async ({ }, { title, description, image, conditions }) => {
  // FIXME: Remove this block as needed
  // const preparedConditions = prepareArrayField(
  //   conditions,
  //   [], // The initial array is empty for a new badge
  //   (item) => ({

  //     action: {
  //       connect: {
  //         id: item.action
  //       }
  //     },
  //     quantity: item.quantity

  //   })
  // );

  // FIXME: Remove this block as needed
  // const badge = await prisma.badge.create({
  //   data: {
  //     title,
  //     description,
  //     image,
  //     conditions: preparedConditions
  //   }
  // })
  const createdBadges = await db.insert(badge)
    .values({ title, description, image })
    .returning();
  const createdBadge = createdBadges[0];

  if (createdBadge) {
    const insertData = conditions.map((item) => ({ actionId: item.action, badgeId: createdBadge.id, quantity: item.quantity }))
    await db.insert(condition).values(insertData)
  }

  return createdBadge

}, CreateBadgeSchema)

export const getSingleBadge = createAction(async ({ }, { id }) => {
  // FIXME: Remove this block as needed
  // const badge = await prisma.badge.findFirst({
  //   where: {
  //     id
  //   },
  //   include: {
  //     conditions: {
  //       include: {
  //         action: true
  //       },
  //       orderBy: {
  //         id: 'asc'
  //       }
  //     }
  //   }
  // })
  const badgeResult = await db.query.badge.findFirst({
    where: (badge, { eq }) => eq(badge.id, id),
    with: {
      conditions: {
        with: {
          action: true
        },
        orderBy: (condition, { asc }) => [asc(condition.id)]
      }
    }
  })

  return badgeResult

}, z.object({
  id: z.string()
}), { authed: true })

export const updateBadge = createAction(async ({ }, params) => {
  if (!params) {
    throw new Error('Parameters are undefined');
  }

  // FIXME: Remove this block as needed
  // const findBadge = await prisma.badge.findFirst({
  //   where: {
  //     id: params.id
  //   },
  //   include: {
  //     conditions: {
  //       include: {
  //         action: true
  //       },
  //       orderBy: {
  //         id: 'asc'
  //       }
  //     }
  //   }
  // })
  const findBadge = await db.query.badge.findFirst({
    where: (badge, { eq }) => eq(badge.id, params.id),
    with: {
      conditions: {
        with: {
          action: true
        },
        orderBy: (condition, { asc }) => [asc(condition.id)]
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

  // FIXME: Remove this block as needed
  // const badge = await prisma.badge.update({
  //   where: { id: params.id },
  //   data: {
  //     ...params,
  //     conditions: preparedConditions
  //   }
  // });
  const updatedBadges = await db.update(badge)
    .set({
      title: params.title,
      description: params.description,
      image: params.image,
    })
    .returning();

  const updatedBadge = updatedBadges[0];

  if (preparedConditions.create && updatedBadge) {
    const insertData = preparedConditions.create.map((item) => ({ actionId: item.action, badgeId: updatedBadge.id, quantity: item.quantity }))
    await db.insert(condition).values(insertData)
  }
  if (preparedConditions.update && updatedBadge) {
    await Promise.all(preparedConditions.update.map(async (item) => {
      await db.update(condition)
        .set({ quantity: item.data.quantity })
        .where(and(
          eq(condition.badgeId, updatedBadge.id),
          eq(condition.id, item.where.id),
        ))
    }))
  }

  return updatedBadges;
}, CreateBadgeSchema.extend({
  id: z.string()
}), { authed: true });

export const deleteBadge = createAction(async ({ }, params) => {
  // Delete all conditions associated with the badge

  // FIXME: Remove this block as needed
  // await prisma.condition.deleteMany({
  //   where: {
  //     badgeId: params.id,
  //   }
  // });
  await db.delete(condition).where(eq(condition.badgeId, params.id))

  // Then delete the badge itself
  // const badge = await prisma.badge.delete({
  //   where: {
  //     id: params.id
  //   }
  // });
  const deletedBadges = await db.delete(badge)
    .where(eq(badge.id, params.id))
    .returning();

  const deletedBadge = deletedBadges[0];

  return deletedBadge;


}, z.object({
  id: z.string()
}), { authed: true })
