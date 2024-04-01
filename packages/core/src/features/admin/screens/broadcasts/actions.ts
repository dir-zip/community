'use server'

import { createAction } from "~/lib/createAction"
import { count, db, eq, or } from '@dir/db'
import { z } from 'zod'
import { broadcast } from "packages/db/drizzle/schema";

export const getAllBroadcasts = createAction(
  async ({ }, params) => {
    if (!params) {
      throw new Error('Parameters are undefined');
    }
    const { skip, take, where } = params;

    const whereIdCondition = where?.OR?.find((condition: any) => condition?.id !== undefined)?.id;

    const broadcasts = await db.query.broadcast.findMany({
      where: (broadcast, { or, eq }) => or(
        whereIdCondition ? eq(broadcast.id, whereIdCondition) : undefined
      ),
      with: {
        users: true,
        lists: true,
        post: {
          columns: {
            slug: true,
            title: true
          }
        }
      },
      limit: take,
      offset: skip
    })

    const tokenCountResult = await db.select({ count: count() })
      .from(broadcast)
      .where(or(
        whereIdCondition ? eq(broadcast.id, whereIdCondition) : undefined
      ))

    const tokenCount: number = tokenCountResult.reduce((accumulator, currentValue) => accumulator + currentValue.count, 0);

    return { broadcasts, count: tokenCount };
  },
  z.object({
    skip: z.number().optional(),
    take: z.number().optional(),
    where: z.any(),
  }),
  { authed: true }
);