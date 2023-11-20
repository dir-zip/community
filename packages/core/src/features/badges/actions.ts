import { createAction } from "@/lib/createAction";
import {prisma} from "@dir/db"

export const assignBadge = createAction(async({session}) => {

  const user = await prisma.user.findFirst({
    where: {
      id: session?.data.userId
    },
    include: {
      inventory: {
        include: {
          collection: {
            include: {
              item: true,
              badge: true
            }
          }
        }
      },
      events: {
        include: {
          action: true
        }
      }
    }
  })
  
  const conditions = await prisma.condition.findMany({
    where: {
      actions: {
        some: {
          OR: user?.events.map((e) => {
            return {
              id: e.action.id,
            }
          }),
        },
      },
    },
    include: {
      badge: true,
    },
  })
  

  conditions.forEach(async (item) => {
    // Check if the user already has the item in their inventory
    const existingItem = await prisma.inventoryItem.findFirst({
      where: {
        AND: [
          { badgeId: item?.badgeId },
          {type: "BADGE"},
          { inventoryId: user?.inventory?.id },
        ],
      },
    });

    if(!existingItem) {
      await prisma.inventoryItem.create({
        data: {
          type: "BADGE",
          badge: {
            connect: {
              id: item?.badgeId,
            },
          },
          equipped: true,
          inventory: {
            connectOrCreate: {
              where: {
                id: user?.inventory?.id,
              },
              create: {
                user: {
                  connect: {
                    id: user?.id
                  }
                }
              }
            },
          },
        },
      })
    }

  })

}, undefined, {authed: true})