'use server'

import { createAction } from "~/lib/createAction"
import {prisma} from '@dir/db'
import {z} from 'zod'

export const getAllBroadcasts = createAction(
  async ({}, params) => {
    if (!params) {
      throw new Error('Parameters are undefined');
    }
    const { skip, take, where } = params
    const broadcasts = await prisma.broadcast.findMany({
      take,
      skip,
      where,
      include: {
        users: true,
        lists: true,
        post: {
          select: {
            slug: true,
            title: true
          }
        }
      },
    });

    const count = await prisma.broadcast.count({
      where,
    });

    return { broadcasts, count };
  },
  z.object({
    skip: z.number().optional(),
    take: z.number().optional(),
    where: z.any(),
  }),
  {authed: true}
);