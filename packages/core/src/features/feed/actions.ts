'use server'

import { createAction } from "~/lib/createAction"
import { prisma } from '@dir/db'

export const getFeed = createAction(async ({ }) => {
  const feed = await prisma.post.findMany({
    where: {
      title: undefined
    }
  })

  return feed
}, undefined, { authed: true })

