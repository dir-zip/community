"use server";

import { revalidatePath } from 'next/cache'
import { and, count, db, eq, like, or } from "@dir/db";
import { z } from "zod";


import { UpdateUserSchema } from "../auth/schemas";
import { createAction } from '../../lib/createAction';
import {
  featureToggle,
  globalSetting,
  user,
  post,
  session,
  comment,
  item,
  badge,
  action,
  tag,
  category,
  token,
} from 'packages/db/drizzle/schema';

export const getSiteSettings = createAction(
  async ({ }, params) => {
    // FIXME: Remove this block as needed
    // const site = await prisma.globalSetting.findFirst({
    //   where: {
    //     id: 1
    //   },
    //   include: {
    //     features: true
    //   }
    // })
    const site = await db.query.globalSetting.findFirst({
      where: (setting, { eq }) => eq(setting.id, 1),
      with: { features: true }
    });

    return site!
  },
  undefined,
  { authed: true }
)

export const updateSiteSettings = createAction(
  async ({ }, params) => {

    const featuresToUpdate = [
      {
        where: {
          feature: 'private'
        },
        data: {
          isActive: params.isPrivate
        }
      },
      {
        where: {
          feature: 'broadcastPin'
        },
        data: {
          isActive: true,
          value: params.broadcastPin.toString()
        }
      },
      {
        where: {
          feature: 'signupFlow'
        },
        data: {
          isActive: true,
          value: params.signupFlow
        }
      }
    ]

    // FIXME: Remove this block as needed
    // const site = await prisma.globalSetting.update({
    //   where: {
    //     id: 1
    //   },
    //   data: {
    //     siteTitle: params.siteTitle,
    //     siteDescription: params.siteDescription,
    //     features: {
    //       updateMany: [
    //         {
    //           where: {
    //             feature: 'private'
    //           },
    //           data: {
    //             isActive: params.isPrivate
    //           }
    //         },
    //         {
    //           where: {
    //             feature: 'broadcastPin'
    //           },
    //           data: {
    //             isActive: true,
    //             value: params.broadcastPin.toString()
    //           }
    //         },
    //         {
    //           where: {
    //             feature: 'signupFlow'
    //           },
    //           data: {
    //             isActive: true,
    //             value: params.signupFlow
    //           }
    //         }
    //       ]
    //     }
    //   }
    // })
    const updatedSites = await db.update(globalSetting)
      .set({
        siteTitle: params.siteTitle,
        siteDescription: params.siteDescription,
      })
      .where(eq(globalSetting.id, 1))
      .returning()

    await Promise.all(featuresToUpdate.map(async (feature) => {
      await db.update(featureToggle)
        .set(feature.data)
        .where(eq(featureToggle.feature, feature.where.feature))
    }))

    revalidatePath('/admin')

    const site = updatedSites[0];
    return site;
  },
  z.object({
    siteTitle: z.string(),
    siteDescription: z.string(),
    isPrivate: z.boolean(),
    broadcastPin: z.number(),
    signupFlow: z.string()
  }),
  { authed: true }
)

const getDbTable = (resource: string) => {
  const resources: any = {
    user,
    post,
    session,
    comment,
    item,
    badge,
    action,
    tag,
    category
    // TODO: add more resource table here ...
  }

  if (resources.hasOwnProperty(resource)) {
    return resources[resource];
  }

  return null
}

export const getAllResource = createAction(
  async ({ }, params) => {
    if (!params) {
      throw new Error('Parameters are undefined');
    }
    const { resource, skip, take, where } = params;

    // FIXME: Remove this block as needed
    // const findResource = await (prisma as any)[resource.slice(0, -1)].findMany({
    //   take,
    //   skip,
    //   where,
    //   include: {
    //     workspace: true
    //   }
    // })

    const table = getDbTable(resource.slice(0, -1));

    const whereIdCondition = where?.OR?.find((condition: any) => condition?.id !== undefined)?.id;
    const whereUserIdCondition = where?.OR?.find((condition: any) => condition?.userId !== undefined)?.userId;

    const findResource = await db.select()
      .from(table)
      .where(or(
        (whereIdCondition) ? eq(table.id, whereIdCondition) : undefined,
        (whereUserIdCondition) ? eq(table.userId, whereUserIdCondition) : undefined,
      ))
      .limit(take || 1000)
      .offset(skip || 0)

    // FIXME: Remove this block as needed
    // const count = await (prisma as any)[resource.slice(0, -1)].count({
    //   where
    // })

    const resourceCountResult = await db.select({ count: count() })
      .from(table)
      .where(
        or(
          (whereIdCondition) ? eq(table.id, whereIdCondition) : undefined,
          (whereUserIdCondition) ? eq(table.userId, whereUserIdCondition) : undefined,
        )
      )

    const resourceCount: number = resourceCountResult.reduce((accumulator, currentValue) => accumulator + currentValue.count, 0);

    return { resource: findResource, count: resourceCount }
  },
  z.object({
    resource: z.string().min(1),
    skip: z.number().optional(),
    take: z.number().optional(),
    where: z.any()
  }),
  { authed: true }
)

export const getResource = createAction(
  async ({ }, params) => {
    if (!params) {
      throw new Error('Parameters are undefined');
    }
    const { id, resource } = params
    const findResource = await (db.query as any)[resource.slice(0, -1)].findUnique({
      where: { id }
    });

    return findResource;
  },
  z.object({
    id: z.string(),
    resource: z.string().min(1)
  }),
  { authed: true }
)

export const updateResource = createAction(
  async ({ }, { id, resource, data }) => {

    const findResource = await (db.query as any)[resource.slice(0, -1)].findUnique({
      where: { id },
    });

    if (!findResource) {
      throw new Error(`Can't find ${resource.slice(0, -1)}`)
    }

    // FIXME: Remove this block as needed
    // const updatedResource = await (prisma as any)[resource.slice(0, -1)].update({
    //   where: { id },
    //   data,
    // });
    const table = getDbTable(resource.slice(0, -1));
    const updatedResource = await db.update(table)
      .set(data)
      .where(eq(table.id, id))

    return updatedResource;
  },
  undefined,
  { authed: true }
)

export const getAllUsers = createAction(
  async ({ }, params) => {
    if (!params) {
      throw new Error('Parameters are undefined');
    }
    const { skip, take, where } = params

    const whereUsernameCondition = where?.username?.contains;
    const whereIdCondition = where?.OR?.find((condition: any) => condition?.id !== undefined)?.id;
    const whereEmailCondition = where?.OR?.find((condition: any) => condition?.email !== undefined)?.email?.contains;


    // FIXME: Remove this block as needed
    // const users = await prisma.user.findMany({
    //   take,
    //   skip,
    //   where,
    // });
    const users = await db.select()
      .from(user)
      .where(and(
        whereUsernameCondition ? like(user.username, whereUsernameCondition) : undefined,
        or(
          (whereIdCondition) ? eq(user.id, whereIdCondition) : undefined,
          (whereEmailCondition) ? like(user.email, whereEmailCondition) : undefined,
        )
      ))
      .limit(take || 1000)
      .offset(skip || 0)

    // FIXME: Remove this block as needed
    // const count = await prisma.user.count({
    //   where,
    // });
    const userCountResult = await db.select({ count: count() })
      .from(user)
      .where(and(
        whereUsernameCondition ? like(user.username, whereUsernameCondition.contains) : undefined,
        or(
          (whereIdCondition) ? eq(user.id, whereIdCondition) : undefined,
          (whereEmailCondition) ? like(user.email, whereEmailCondition.contains) : undefined,
        )
      ))

    const userCount: number = userCountResult.reduce((accumulator, currentValue) => accumulator + currentValue.count, 0);

    return { users, count: userCount };
  },
  z.object({
    skip: z.number().optional(),
    take: z.number().optional(),
    where: z.any(),
  }),
  { authed: true }
);

export const getSingleUser = createAction(
  async ({ }, params) => {
    if (!params) {
      throw new Error('Parameters are undefined');
    }
    const { id } = params

    // FIXME: Remove this block as needed
    // const user = await prisma.user.findUnique({
    //   where: { id },
    // });
    const userResult = await db.query.user.findFirst({
      where: (user, { eq }) => eq(user.id, id)
    })

    return userResult;
  },
  z.object({
    id: z.string(),
  }),
  { authed: true }
);

export const updateUser = createAction(async ({ }, params) => {
  if (!params) {
    throw new Error('Parameters are undefined');
  }
  const { id, email, role } = params

  // FIXME: Remove this block as needed
  // const user = await prisma.user.update({
  //   where: { id },
  //   data: { email, role },
  // });

  const updatedUsers = await db.update(user)
    .set({ email, role })
    .where(eq(user.id, id))
    .returning()

  const updatedUser = updatedUsers[0];
  return updatedUser;
}, UpdateUserSchema, { authed: true });

export const getAllTokens = createAction(
  async ({ }, params) => {
    if (!params) {
      throw new Error('Parameters are undefined');
    }
    const { skip, take, where } = params;

    // FIXME: Remove this block as needed
    // const tokens = await prisma.token.findMany({
    //   take,
    //   skip,
    //   where,
    // });

    const tokens = await db.select()
      .from(token)
      .where(and())
      .limit(take || 1000)
      .offset(skip || 0)

    // FIXME: Remove this block as needed
    // const count = await prisma.token.count({
    //   where,
    // });

    const tokenCountResult = await db.select({ count: count() })
      .from(token)
      .where(and())

    const tokenCount: number = tokenCountResult.reduce((accumulator, currentValue) => accumulator + currentValue.count, 0);

    return { tokens, count: tokenCount };
  },
  z.object({
    skip: z.number().optional(),
    take: z.number().optional(),
    where: z.any(),
  }),
  { authed: true }
);

export const getSingleToken = createAction(
  async ({ }, params) => {
    if (!params) {
      throw new Error('Parameters are undefined');
    }
    const { id } = params

    // FIXME: Remove this block as needed
    // const token = await prisma.token.findUnique({
    //   where: { id },
    // });

    const tokenResult = await db.query.token.findFirst({
      where: (tok, { eq }) => eq(tok.id, id)
    })

    return tokenResult;
  },
  z.object({
    id: z.string(),
  }),
  { authed: true }
);

export const getAllSessions = createAction(
  async ({ }, params) => {
    if (!params) {
      throw new Error('Parameters are undefined');
    }
    const { skip, take, where } = params

    // FIXME: Remove this block as needed
    // const sessions = await prisma.session.findMany({
    //   take,
    //   skip,
    //   where,
    // });
    const sessions = await db.select()
      .from(session)
      .where(and())
      .limit(take || 1000)
      .offset(skip || 0)

    // FIXME: Remove this block as needed
    // const count = await prisma.session.count({
    //   where,
    // });
    const sessionCountResult = await db.select({ count: count() })
    .from(session)
    .where(and())

  const sessionCount: number = sessionCountResult.reduce((accumulator, currentValue) => accumulator + currentValue.count, 0);

    return { sessions, count: sessionCount };
  },
  z.object({
    skip: z.number().optional(),
    take: z.number().optional(),
    where: z.any(),
  }),
  { authed: true }
);

export const getSingleSession = createAction(
  async ({ }, params) => {
    if (!params) {
      throw new Error('Parameters are undefined');
    }
    const { id } = params

    // FIXME: Remove this block as needed
    // const session = await prisma.session.findUnique({
    //   where: { id },
    // });
    const sessionResult = await db.query.session.findFirst({
      where: (sess, { eq }) => eq(sess.id, id)
    })

    return sessionResult;
  },
  z.object({
    id: z.string(),
  }),
  { authed: true }
);



