import { createAction } from "~/lib/createAction";
import { z } from 'zod'
import { db, eq } from '@dir/db'
import { assignBadge } from "../badges/actions";
import { event, user } from "packages/db/drizzle/schema";

export const triggerAction = createAction(async ({ session }, { title }) => {

  // FIXME: Remove this block as needed
  // const findAction = await prisma.action.findFirst({
  //   where: {
  //     title: title
  //   }
  // })
  const findAction = await db.query.action.findFirst({
    where: (actions, { eq }) => eq(actions.title, title)
  })

  // FIXME: Remove this block as needed
  // const findUser = await prisma.user.findFirst({
  //   where: {
  //     id: session?.data.userId
  //   }
  // })
  const findUser = session?.data.userId
    ? await db.query.user.findFirst({
      where: (user, { eq }) => eq(user.id, session.data.userId)
    })
    : undefined;

  // FIXME: Remove this block as needed
  // const event = await prisma.event.create({
  //   data: {
  //     user: {
  //       connect: {
  //         id: findUser?.id,
  //       },
  //     },
  //     action: {
  //       connect: {
  //         id: findAction?.id,
  //       },
  //     }
  //   },
  // })
  const createdEvents = (findUser && findAction)
    ? await db.insert(event)
      .values({ userId: findUser.id, actionId: findAction.id })
      .returning()
    : undefined

  // FIXME: Remove this block as needed
  // const updatedUser = await prisma.user.update({
  //   where: {
  //     id: findUser?.id,
  //   },
  //   data: {
  //     points: Number(findUser?.points) + Number(findAction?.value),
  //   },
  // })
  const updatedUsers = findUser?.id
    ? await db.update(user)
      .set({ points: Number(findUser.points) + Number(findAction?.value || 0) })
      .where(eq(user.id, findUser?.id))
      .returning({ id: user.id })
    : [];


  await Promise.all(updatedUsers.map(async (updatedUser) => {
    await assignBadge(updatedUser.id)
  }))

  const result = (createdEvents && createdEvents.length > 0) ? createdEvents[0] : undefined
  return result


}, z.object({ title: z.string() }), { authed: true })