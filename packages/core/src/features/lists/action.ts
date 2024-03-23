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
  
  const lists = await db.query.list.findMany({
    where: (ls, { eq }) => eq(ls.slug, 'unsubscribed')
  })

  const user = await db.query.user.findFirst({
    where: (users, { eq }) => eq(users.email, email)
  })

  await Promise.all(lists.map(async (list) => {
    await db
      .update(userList)
      .set({ userId: user?.id })
      .where(eq(userList.listId, list.id))
  }))

  return Response.redirect(process.env.NEXT_PUBLIC_APP_URL as string)
}

