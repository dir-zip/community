import { createAction } from "~/lib/createAction";
import { prisma } from "@dir/db"

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

  const badges = await prisma.badge.findMany({
    include: {
      conditions: true,
    },
  });

  for (const badge of badges) {
    const allConditionsMet = badge.conditions.every(condition => {
      const actionCount = user?.events.filter(event => event.actionId === condition.actionId).length || 0;
      return actionCount >= condition.quantity;
    });
  
    if (allConditionsMet) {


      const existingItem = await prisma.inventoryItem.findFirst({
        where: {
          AND: [
            { badgeId: badge?.id },
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
                id: badge?.id,
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


    }
  }
 

  

}, undefined, {authed: true})