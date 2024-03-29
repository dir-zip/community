'use server'

import { createAction } from "~/lib/createAction"
import { db, count, schema } from '@dir/db'
import { z } from 'zod'


export const getFeed = createAction(async ({ }, params) => {
  if (!params) {
    throw new Error('Parameters are undefined');
  }
  const { skip, take } = params;

  const broadcastPinFeature = await db.query.featureToggle.findFirst({
    where: (feature, { eq }) => eq(feature.feature, 'broadcastPin')
  });

  const PRIORITY_DAYS = Number(broadcastPinFeature?.value) || 0;
  const priorityDate = new Date();
  priorityDate.setDate(priorityDate.getDate() - PRIORITY_DAYS);

  let feed = await db.query.post.findMany({
    offset: skip,
    limit: take,
    with: {
      user: {
        with: {
          inventory: {
            with: {
              inventoryItems: {
                with: {
                  item: true
                }
              }
            }
          }
        }
      },
      broadcasts: true,
      comments: true,
      category: true,
      tags: {
        with: {
          tag: true
        }
      }
    },
    orderBy: (posts, { desc }) => [desc(posts.createdAt)],
  })

  feed = feed.sort((a, b) => {
    const aIsRecentBroadcast = a.broadcasts.length > 0 && new Date(a.createdAt) > priorityDate ? 1 : 0;
    const bIsRecentBroadcast = b.broadcasts.length > 0 && new Date(b.createdAt) > priorityDate ? 1 : 0;
    return bIsRecentBroadcast - aIsRecentBroadcast || new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  });

  const _count = await db.select({ count: count() }).from(schema.post)
  const feedCount: number = _count.reduce((accumulator, currentValue) => accumulator + currentValue.count, 0);

  return { data: feed, count: feedCount }

}, z.object({
  skip: z.number().optional(),
  take: z.number().optional(),
}), { authed: true })
