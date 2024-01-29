'use server'

import { createAction } from "~/lib/createAction"
import { prisma } from '@dir/db'
import {z} from 'zod'
import { userInventoryIncludes } from "~/lib/includes"

export const getFeed = createAction(async ({ }, params) => {
  if (!params) {
    throw new Error('Parameters are undefined');
  }
  const { skip, take } = params;

  const broadcastPinFeature = await prisma.featureToggle.findUnique({
    where: {
      feature: 'broadcastPin'
    },
  });

  const PRIORITY_DAYS = Number(broadcastPinFeature?.value) || 0;
  const priorityDate = new Date();
  priorityDate.setDate(priorityDate.getDate() - PRIORITY_DAYS);

  let feed = await prisma.post.findMany({
    skip,
    take,
    where: {
      title: undefined
    },
    include: {
      user: userInventoryIncludes.user,
      broadcasts: true,
      comments: true,
      category: true,
      tags: true
    },
    orderBy: {
      createdAt: 'desc'
    }
  })

  feed = feed.sort((a, b) => {
    const aIsRecentBroadcast = a.broadcasts.length > 0 && a.createdAt > priorityDate ? 1 : 0;
    const bIsRecentBroadcast = b.broadcasts.length > 0 && b.createdAt > priorityDate ? 1 : 0;
    return bIsRecentBroadcast - aIsRecentBroadcast || b.createdAt.getTime() - a.createdAt.getTime();
  });

  const count = await prisma.post.count({
    where: {
      title: undefined
    },
  }); 

  return {data: feed, count: count}

},  z.object({
  skip: z.number().optional(),
  take: z.number().optional(),
}), { authed: true })

