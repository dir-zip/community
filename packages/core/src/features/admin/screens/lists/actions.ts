"use server"

import { prisma, type Item } from "@dir/db";
import {z} from 'zod'


import {createAction} from '../../../../lib/createAction';
import { revalidatePath, revalidateTag } from "next/cache";



export const getAllLists = createAction(
  async ({}, params) => {
    if (!params) {
      throw new Error('Parameters are undefined');
    }
    const { skip, take, where } = params

    const lists = await prisma.list.findMany({
      take,
      skip,
      where,
      include: {
        users: true,
        broadcasts: true
      }
    });


    const count = await prisma.list.count({
      where,
    });

    return { lists, count };
  },
  z.object({
    skip: z.number().optional(),
    take: z.number().optional(),
    where: z.any(),
  }),
  {authed: true}
);



export const getSingleList = createAction(async({}, {slug}) => {

  const list = await prisma.list.findFirst({
    where: {
      slug
    },
    include: {
      users: true,
      broadcasts: true
    }
  })

  return list

}, z.object({
  slug: z.string()
}))

export const getUsersFromList = createAction(async({}, {slug, skip, take, where}) => {
  const users = await prisma.list.findFirst({
    take,
    skip,
    where: {
      slug,
      ...where
    },
    include: {
      users: true
    }
  })

  const usersCount = await prisma.user.count({
    where: {
      lists: {
        some: {
          slug: slug
        }
      }
    }
  });

  return {users: users ? users.users : [], count: usersCount}
}, z.object({
  slug: z.string(),
  skip: z.number().optional(),
  take: z.number().optional(),
  where: z.any()
}))

export const removeUserFromList = createAction(async({}, {slug, userId}) => {
  const list = await prisma.list.findFirst({
    where: {
      slug
    }
  })

  if (!list) {
    throw new Error('List not found')
  }

  const user = await prisma.user.findFirst({
    where: {
      id: userId
    }
  })

  if (!user) {
    throw new Error('User not found')
  }

  const updatedList = await prisma.list.update({
    where: {
      slug
    },
    data: {
      users: {
        disconnect: {
          id: userId
        }
      }
    }
  })

  revalidatePath(`/admin/lists/${slug}`)

  return updatedList

}, z.object({
  slug: z.string(),
  userId: z.string()
}))

export const addUserToList = createAction(async({}, {slug, userId}) => {
  const list = await prisma.list.findFirst({
    where: {
      slug
    }
  })

  if (!list) {
    throw new Error('List not found')
  }

  const user = await prisma.user.findFirst({
    where: {
      id: userId
    }
  })

  if (!user) {
    throw new Error('User not found')
  }

  const updatedList = await prisma.list.update({
    where: {
      slug
    },
    data: {
      users: {
        connect: {
          id: userId
        }
      }
    }
  })

  revalidatePath(`/admin/lists/${slug}`)

  return updatedList

}, z.object({
  slug: z.string(),
  userId: z.string()
}))
