'use server'
import { z } from 'zod'
import { createAction } from "~/lib/createAction"
import { count, db, eq } from "@dir/db"
import { post } from 'packages/db/drizzle/schema'

export const getAllItems = createAction(async ({ }, params) => {
  if (!params) {
    throw new Error('Parameters are undefined');
  }
  const { skip, take } = params;

  // FIXME: Remove this block as needed
  // const items = await prisma.item.findMany({
  //   skip,
  //   take,
  //   orderBy: {
  //     createdAt: 'desc'
  //   }
  // })
  const items = await db.query.item.findMany({
    orderBy: (item, { desc }) => [desc(item.createdAt)],
    limit: take,
    offset: skip
  })

  // FIXME: Remove this block as needed
  // const count = await prisma.post.count({
  //   where: {
  //     title: undefined
  //   },
  // });
  const postCountResult = await db.select({ count: count() })
    .from(post)
    .where(eq(post.title, ''))

  const postCount: number = postCountResult.reduce((accumulator, currentValue) => accumulator + currentValue.count, 0);

  return { data: [...items], count: postCount }

}, z.object({
  skip: z.number().optional(),
  take: z.number().optional(),
}), { authed: true })

