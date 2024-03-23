import type { SessionModel } from "@dir/auth";
import { db, schema, eq } from "@dir/db";
import { BaseSessionData } from ".";

export const storeSession = async (session: SessionModel<BaseSessionData>) => {
  let user;

  if (
    session.data.userId &&
    typeof session.data.userId === "string"
  ) {
    user = { id: session.data.userId };
  }


  return await db.insert(schema.session).values({
    ...session,
    expiresAt: session.expiresAt?.toString(),
    data: JSON.stringify(session.data),
    userId: user?.id
  });
};

export const updateSessionStorage = async (id: string, data: any) => {
  try {
    return await db.update(schema.session).set({ ...data }).where(eq(schema.session.id, id))
  } catch (error) {
    throw error;
  }
};

export const getSessionFromStorage = async (id: string) => {
  return await db.query.session.findFirst({
    where: (session, { eq }) => eq(session.id, id)
  })
};

export const deleteSessionFromStorage = async (id: string) => {
  return await db.delete(schema.session).where(eq(schema.session.id, id))
};

export default {
  store: storeSession,
  update: updateSessionStorage,
  get: getSessionFromStorage,
  delete: deleteSessionFromStorage
}
