import { type NextRequest } from "next/server";
import { db, eq } from "packages/db";
import { user, userList } from "packages/db/drizzle/schema";

export async function Unsubscribe(request: NextRequest) {
  const email = request.nextUrl.searchParams.get('email') || ''

  // FIXME: Remove this block as needed
  // await prisma?.list.update({
  //   where: {
  //     slug: 'unsubscribed'
  //   },
  //   data: {
  //     users: {
  //       connect: {
  //         email
  //       }
  //     }
  //   }
  // })

  const list = await db.query.list.findFirst({
    where: (ls, { eq }) => eq(ls.slug, 'unsubscribed')
  })

  if (!list) {
    throw new Error('No unsubcribe list found !')
  }

  const user = await db.query.user.findFirst({
    where: (users, { eq }) => eq(users.email, email)
  })

  if (!user) {
    throw new Error('No user found with given email!')
  }

  const userUnsubcribeList = await db.query.userList.findFirst({
    where: (userList, { and, eq }) => and(
      eq(userList.userId, user.id),
      eq(userList.listId, list.id),
    )
  })

  if (userUnsubcribeList) {
    await db
      .update(userList)
      .set({ userId: user.id, listId: list.id })
      .where(eq(userList.id, userUnsubcribeList.id))
  } else {
    await db
      .insert(userList)
      .values({ userId: user.id, listId: list.id })
  }

  return Response.redirect(process.env.NEXT_PUBLIC_APP_URL as string)
}

