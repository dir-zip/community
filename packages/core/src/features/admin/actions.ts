"use server";

import { revalidatePath } from 'next/cache'
import { prisma } from "@dir/db";
import { z } from "zod";


import { UpdateUserSchema } from "../auth/schemas";
import {createAction} from '../../lib/createAction';

export const getSiteSettings = createAction(
  async({}, params) => {
    const site = await prisma.globalSetting.findFirst({
      where: {
        id: 1
      },
      include: {
        features: true
      }
    })

    return site!
  },
  undefined,
  {authed: true}
)

export const updateSiteSettings = createAction(
  async({}, params) => {
    const site = await prisma.globalSetting.update({
      where: {
        id: 1
      },
      data: {
        siteTitle: params.siteTitle,
        siteDescription: params.siteDescription,
        features: {
          updateMany: [
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
        }
      }
    })
    revalidatePath('/admin')

    return site
  },
  z.object({
    siteTitle: z.string(),
    siteDescription: z.string(),
    isPrivate: z.boolean(),
    broadcastPin: z.number(),
    signupFlow: z.string()
  }),
  {authed: true}
)

export const getAllResource = createAction(
  async({}, params) => {
    if (!params) {
      throw new Error('Parameters are undefined');
    }
    const { resource, skip, take, where } = params;

    const findResource = await (prisma as any)[resource.slice(0, -1)].findMany({
      take,
      skip,
      where,
      include: {
        workspace: true
      }
    })

    const count = await (prisma as any)[resource.slice(0, -1)].count({
      where
    })

    return {resource: findResource, count}
  },
  z.object({
    resource: z.string().min(1),
    skip: z.number().optional(),
    take: z.number().optional(),
    where: z.any()
  }),
  {authed: true}
)

export const getResource = createAction(
  async({}, params) => {
    if (!params) {
      throw new Error('Parameters are undefined');
    }
    const {id, resource} = params
    const findResource = await (prisma as any)[resource.slice(0, -1)].findUnique({
      where: { id }
    });

    return findResource;
  },
  z.object({
    id: z.string(),
    resource: z.string().min(1)
  }),
  {authed: true}
)

export const updateResource = createAction(
  async({}, {id, resource, data}) => {

    const findResource = await (prisma as any)[resource.slice(0, -1)].findUnique({
      where: { id },
    });

    if(!findResource) {
      throw new Error(`Can't find ${resource.slice(0, -1)}`)
    }
  
  
    const updatedResource = await (prisma as any)[resource.slice(0, -1)].update({
      where: { id },
      data,
    });
  
    return updatedResource;
  },
  undefined,
  {authed: true}
)



export const getAllUsers = createAction(
  async ({}, params) => {
    if (!params) {
      throw new Error('Parameters are undefined');
    }
    const { skip, take, where } = params
    const users = await prisma.user.findMany({
      take,
      skip,
      where,
    });

    const count = await prisma.user.count({
      where,
    });

    return { users, count };
  },
  z.object({
    skip: z.number().optional(),
    take: z.number().optional(),
    where: z.any(),
  }),
  {authed: true}
);

export const getSingleUser = createAction(
  async ({}, params) => {
    if (!params) {
      throw new Error('Parameters are undefined');
    }
    const { id } = params
    const user = await prisma.user.findUnique({
      where: { id },
    });

    return user;
  },
  z.object({
    id: z.string(),
  }),
  {authed: true}
);

export const updateUser = createAction(async ({}, params) => {
  if (!params) {
    throw new Error('Parameters are undefined');
  }
  const { id, email, role } = params
  const user = await prisma.user.update({
    where: { id },
    data: { email, role },
  });

  return user;
}, UpdateUserSchema, {authed: true});

export const getAllTokens = createAction(
  async ({}, params) => {
    if (!params) {
      throw new Error('Parameters are undefined');
    }
    const { skip, take, where } = params
    const tokens = await prisma.token.findMany({
      take,
      skip,
      where,
    });

    const count = await prisma.token.count({
      where,
    });

    return { tokens, count };
  },
  z.object({
    skip: z.number().optional(),
    take: z.number().optional(),
    where: z.any(),
  }),
  {authed: true}
);

export const getSingleToken = createAction(
  async ({}, params) => {
    if (!params) {
      throw new Error('Parameters are undefined');
    }
    const { id } = params
    const token = await prisma.token.findUnique({
      where: { id },
    });

    return token;
  },
  z.object({
    id: z.string(),
  }),
  {authed: true}
);

export const getAllSessions = createAction(
  async ({}, params) => {
    if (!params) {
      throw new Error('Parameters are undefined');
    }
    const { skip, take, where } = params
    const sessions = await prisma.session.findMany({
      take,
      skip,
      where,
    });

    const count = await prisma.session.count({
      where,
    });

    return { sessions, count };
  },
  z.object({
    skip: z.number().optional(),
    take: z.number().optional(),
    where: z.any(),
  }),
  {authed: true}
);

export const getSingleSession = createAction(
  async ({}, params) => {
    if (!params) {
      throw new Error('Parameters are undefined');
    }
    const { id } = params
    const session = await prisma.session.findUnique({
      where: { id },
    });

    return session;
  },
  z.object({
    id: z.string(),
  }),
  {authed: true}
);



