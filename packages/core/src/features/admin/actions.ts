"use server";
import 'server-only'

import { prisma } from "@1upsaas/db";
import { z } from "zod";


import { UpdateUserSchema } from "../auth/schemas";
import {createAction} from '../../lib/createAction';

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
  })
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
  })
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
  }
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
}, UpdateUserSchema);

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
);



