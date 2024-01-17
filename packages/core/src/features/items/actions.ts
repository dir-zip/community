'use server'
import { z } from 'zod'
import { createAction } from "~/lib/createAction"
import { prisma } from "@dir/db"
export const getAllItems = createAction(async ({ }, params) => {
  if (!params) {
    throw new Error('Parameters are undefined');
  }
  const { skip, take } = params;

  const items = await prisma.item.findMany({
    skip,
    take,
    orderBy: {
      createdAt: 'desc'
    }
  })


  const count = await prisma.post.count({
    where: {
      title: undefined
    },
  });

  return { data: [...items], count: count }

}, z.object({
  skip: z.number().optional(),
  take: z.number().optional(),
}), { authed: true })

