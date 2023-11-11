import type { SessionModel } from "@dir/auth";
import { prisma } from "@dir/db";
import { BaseSessionData } from ".";

export const storeSession = async (session: SessionModel<BaseSessionData>) => {
  let user;

  if (
    session.data.userId &&
    typeof session.data.userId === "string"
  ) {
    user = { connect: { id: session.data.userId } };
  }

  return await prisma.session.create({
    data: {
      ...session,
      data: JSON.stringify(session.data),
      user,
    },
  });
};

export const updateSessionStorage = async (id: string, data: any) => {
  try {
    return await prisma.session.update({
      where: {
        id,
      },
      data,
    });
  } catch (error) {
    throw error;
  }
};

export const getSessionFromStorage = async (id: string) => {
  return await prisma.session.findUnique({
    where: {
      id,
    },
  });
};

export const deleteSessionFromStorage = async (id: string) => {
  return await prisma.session.delete({ where: { id } });
};

export default {
  store: storeSession,
  update: updateSessionStorage,
  get: getSessionFromStorage,
  delete: deleteSessionFromStorage
}