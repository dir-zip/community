"use server"

import { and, count, db, eq, inArray, like, not, or } from "@dir/db";
import { z } from 'zod'

import { createAction } from '../../../../lib/createAction';
import { revalidatePath, revalidateTag } from "next/cache";
import { findFreeSlug } from "@/utils";
import { list, user, userList } from "packages/db/drizzle/schema";

export const getAllLists = createAction(
  async ({ }, params) => {
    if (!params) {
      throw new Error('Parameters are undefined');
    }
    const { skip, take, where } = params

    const whereOrSlugCondition = where?.OR?.find((condition: any) => condition?.slug !== undefined)?.slug;
    const whereOrTitleCondition = where?.OR?.find((condition: any) => condition?.title !== undefined)?.title;
    const whereSlugNotEqualCondition = where?.slug?.not.equals;

    // FIXME: Remove this block as needed
    // const lists = await prisma.list.findMany({
    //   take,
    //   skip,
    //   where,
    //   include: {
    //     users: true,
    //     broadcasts: true
    //   }
    // });
    const lists = await db.query.list.findMany({
      where: (list, { and, or, eq, not }) => and(
        (whereOrSlugCondition || whereOrTitleCondition)
          ? or(
            whereOrSlugCondition ? eq(list.slug, whereOrSlugCondition) : undefined,
            whereOrTitleCondition ? eq(list.title, whereOrTitleCondition) : undefined,
          )
          : undefined,
        whereSlugNotEqualCondition ? not(eq(list.slug, whereSlugNotEqualCondition)) : undefined
      ),
      limit: take,
      offset: skip,
      with: {
        users: {
          with: {
            user: true
          }
        },
        broadcasts: {
          with: {
            broadcast: true
          }
        }
      }
    })

    // FIXME: Remove this block as needed
    // const count = await prisma.list.count({
    //   where,
    // });
    const listCountResult = await db.select({ count: count() })
      .from(list)
      .where(
        and(
          (whereOrSlugCondition || whereOrTitleCondition)
            ? or(
              whereOrSlugCondition ? eq(list.slug, whereOrSlugCondition) : undefined,
              whereOrTitleCondition ? eq(list.title, whereOrTitleCondition) : undefined,
            )
            : undefined,
          whereSlugNotEqualCondition ? not(eq(list.slug, whereSlugNotEqualCondition)) : undefined
        )
      )

    const listCount: number = listCountResult.reduce((accumulator, currentValue) => accumulator + currentValue.count, 0);

    return { lists, count: listCount };
  },
  z.object({
    skip: z.number().optional(),
    take: z.number().optional(),
    where: z.any(),
  }),
  { authed: true }
);

export const getSingleList = createAction(async ({ }, { slug }) => {
  // FIXME: Remove this block as needed
  // const list = await prisma.list.findFirst({
  //   where: {
  //     slug
  //   },
  //   include: {
  //     users: true,
  //     broadcasts: true
  //   }
  // })
  const listResult = await db.query.list.findFirst({
    where: (list, { eq }) => eq(list.slug, slug),
    with: {
      users: true,
      broadcasts: true,
    }
  })

  return listResult
}, z.object({
  slug: z.string()
}))

export const createList = createAction(async ({ }, { title }) => {
  const createSlug = await findFreeSlug(
    title.toLowerCase().replace(/[^a-z0-9]/g, "-"),
    async (slug: string) =>
      // FIXME: Remove this block as needed
      // await prisma.list.findUnique({ where: { slug } }),
      await db.query.list.findFirst({ where: (list, { eq }) => eq(list.slug, slug) })
  );

  // FIXME: Remove this block as needed
  // const list = await prisma.list.create({
  //   data: {
  //     title,
  //     slug: createSlug
  //   }
  // })
  const createdLists = await db.insert(list)
    .values({ title, slug: createSlug })
    .returning();

  const createdList = createdLists[0];
  return createdList
}, z.object({
  title: z.string(),
}))

export const updateList = createAction(async ({ }, { slug, data }) => {
  // FIXME: Remove this block as needed
  // const currentList = await prisma.list.findUnique({ where: { slug } });
  const currentList = await db.query.list.findFirst({ where: (list, { eq }) => eq(list.slug, slug) })

  let newSlug;
  if (currentList?.title !== data.title) {
    newSlug = await findFreeSlug(
      data.title.toLowerCase().replace(/[^a-z0-9]/g, "-"),
      async (slug: string) =>
        // FIXME: Remove this block as needed
        // await prisma.list.findUnique({ where: { slug } }),
        await db.query.list.findFirst({ where: (list, { eq }) => eq(list.slug, slug) })
    );
  } else {
    newSlug = currentList.slug;
  }

  // FIXME: Remove this block as needed
  // const list = await prisma.list.update({
  //   where: {
  //     slug
  //   },
  //   data: {
  //     ...data,
  //     slug: newSlug
  //   }
  // })
  const updatedLists = await db.update(list)
    .set({ ...data, slug: newSlug })
    .where(eq(list.slug, slug))
    .returning();

  const updatedList = updatedLists[0];
  return updatedList;

}, z.object({
  slug: z.string(),
  data: z.object({
    title: z.string()
  })
}))

export const getUsersFromList = createAction(async ({ }, { slug, skip, take, where }) => {
  // FIXME: Remove this block as needed
  // const users = await prisma.list.findFirst({
  //   take,
  //   skip,
  //   where: {
  //     slug,
  //     ...where
  //   },
  //   include: {
  //     users: true
  //   }
  // })

  const whereOrUsernameCondition = where?.OR?.find((condition: any) => condition?.username !== undefined)?.username.contains;
  const whereOrEmailCondition = where?.OR?.find((condition: any) => condition?.email !== undefined)?.email.contains;

  const userSubquery = (whereOrUsernameCondition || whereOrEmailCondition)
    ? await db.select()
      .from(user)
      .where(or(
        whereOrUsernameCondition ? like(user.username, whereOrUsernameCondition) : undefined,
        whereOrEmailCondition ? like(user.email, whereOrEmailCondition) : undefined,
      ))
    : undefined

  const lists = await db.query.list.findMany({
    where: (list, { eq }) => eq(list.slug, slug),
    with: {
      users: {
        where: (user, { and }) => and(
          (userSubquery && userSubquery.length > 0)
            ? inArray(user.userId, userSubquery.map(item => item.id))
            : undefined
        ),
        with: {
          user: true
        }
      }
    }
  })

  const users = lists.flatMap(list => list.users.flatMap(users => users.user))

  // FIXME: Remove this block as needed
  // const usersCount = await prisma.user.count({
  //   where: {
  //     lists: {
  //       some: {
  //         slug: slug
  //       }
  //     }
  //   }
  // });

  const userCountResult = await db.select({ count: count() })
    .from(user)
    .innerJoin(userList, eq(userList.userId, user.id))
    .innerJoin(list, eq(userList.listId, list.id))
    .where(eq(list.slug, slug))

  const userCount: number = userCountResult.reduce((accumulator, currentValue) => accumulator + currentValue.count, 0);

  return { users, count: userCount }
}, z.object({
  slug: z.string(),
  skip: z.number().optional(),
  take: z.number().optional(),
  where: z.any()
}))

export const removeUserFromList = createAction(async ({ }, { slug, userId }) => {
  // FIXME: Remove this block as needed
  // const list = await prisma.list.findFirst({
  //   where: {
  //     slug
  //   }
  // })
  const listResult = await db.query.list.findFirst({
    where: (list, { eq }) => eq(list.slug, slug)
  })

  if (!listResult) {
    throw new Error('List not found')
  }

  // FIXME: Remove this block as needed
  // const user = await prisma.user.findFirst({
  //   where: {
  //     id: userId
  //   }
  // })
  const userResult = await db.query.user.findFirst({
    where: (user, { eq }) => eq(user.id, userId)
  })

  if (!userResult) {
    throw new Error('User not found')
  }

  // FIXME: Remove this block as needed
  // const updatedList = await prisma.list.update({
  //   where: {
  //     slug
  //   },
  //   data: {
  //     users: {
  //       disconnect: {
  //         id: userId
  //       }
  //     }
  //   }
  // })
  const deletedLists = await db.delete(userList)
    .where(and(
      eq(userList.listId, listResult.id),
      eq(userList.userId, userResult.id),
    ))
    .returning()

  revalidatePath(`/admin/lists/[slug]`)

  return deletedLists

}, z.object({
  slug: z.string(),
  userId: z.string()
}))

export const addUserToList = createAction(async ({ }, { slug, userId }) => {
  // FIXME: Remove this block as needed
  // const list = await prisma.list.findFirst({
  //   where: {
  //     slug
  //   }
  // })
  const listResult = await db.query.list.findFirst({
    where: (list, { eq }) => eq(list.slug, slug)
  })

  if (!listResult) {
    throw new Error('List not found')
  }

  // FIXME: Remove this block as needed
  // const user = await prisma.user.findFirst({
  //   where: {
  //     id: userId
  //   }
  // })
  const userResult = await db.query.user.findFirst({
    where: (user, { eq }) => eq(user.id, userId)
  })

  if (!userResult) {
    throw new Error('User not found')
  }

  // FIXME: Remove this block as needed
  // const updatedList = await prisma.list.update({
  //   where: {
  //     slug
  //   },
  //   data: {
  //     users: {
  //       connect: {
  //         id: userId
  //       }
  //     }
  //   }
  // })
  const updatedLists = await db.insert(userList)
    .values({
      userId,
      listId: listResult.id
    })
    .returning()

  revalidatePath(`/admin/lists/[slug]`)

  return updatedLists;

}, z.object({
  slug: z.string(),
  userId: z.string()
}))
