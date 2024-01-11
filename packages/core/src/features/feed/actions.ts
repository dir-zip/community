'use server'

import { createAction } from "~/lib/createAction"
import { prisma } from '@dir/db'

export const getFeed = createAction(async ({ }) => {
  const feed = await prisma.post.findMany({
    where: {
      title: undefined
    },
    orderBy: {
      createdAt: 'desc'
    }
  })

  return feed
}, undefined, { authed: true })

