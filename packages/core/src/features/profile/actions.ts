"use server"

import { createAction } from "~/lib/createAction"
import { db } from '@dir/db'
import { z } from 'zod'

export const getUser = createAction(async ({ }, { username }) => {
  const userResult = await db.query.user.findFirst({
    where: (user, { eq }) => eq(user.username, username),
    with: {
      posts: true
    }
  })

  return userResult
}, z.object({
  username: z.string()
}))




