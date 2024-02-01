
import { type NextRequest } from "next/server";




export async function Unsubscribe(request: NextRequest) {
  const email = request.nextUrl.searchParams.get('email') || ''

  await prisma?.list.update({
    where: {
      slug: 'unsubscribed'
    },
    data: {
      users: {
        connect: {
          email
        }
      }
    }
  })

  return Response.redirect(process.env.NEXT_PUBLIC_APP_URL as string)
}

