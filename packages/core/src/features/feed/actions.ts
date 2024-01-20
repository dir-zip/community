'use server'

import { createAction } from "~/lib/createAction"
import { prisma } from '@dir/db'
import {z} from 'zod'

export const getFeed = createAction(async ({ }, params) => {
  if (!params) {
    throw new Error('Parameters are undefined');
  }
  const { skip, take } = params;

  const feed = await prisma.post.findMany({
    skip,
    take,
    where: {
      title: undefined
    },
    include: {
      comments: true,
      category: true,
      tags: true
    },
    orderBy: {
      createdAt: 'desc'
    }
  })


  const count = await prisma.post.count({
    where: {
      title: undefined
    },
  }); 

  return {data: [...feed], count: count}

},  z.object({
  skip: z.number().optional(),
  take: z.number().optional(),
}), { authed: true })

