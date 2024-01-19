import { createAction } from "~/lib/createAction";
import {z} from 'zod'
import {prisma} from '@dir/db'
import { assignBadge } from "../badges/actions";

export const triggerAction = createAction(async({session}, {title}) => {

  const findAction = await prisma.action.findFirst({
    where: {
      title: title
    }
  })

  const findUser = await prisma.user.findFirst({
    where: {
      id: session?.data.userId
    }
  })

  const event = await prisma.event.create({
    data: {
      user: {
        connect: {
          id: findUser?.id,
        },
      },
      action: {
        connect: {
          id: findAction?.id,
        },
      }
    },
  })

  const updatedUser = await prisma.user.update({
    where: {
      id: findUser?.id,
    },
    data: {
      points: Number(findUser?.points) + Number(findAction?.value),
    },
  })

  await assignBadge(updatedUser.id)

  return event


}, z.object({title: z.string()}), {authed: true})