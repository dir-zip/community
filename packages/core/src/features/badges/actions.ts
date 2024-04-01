import { createAction } from "~/lib/createAction";
import { db } from "@dir/db"
import { inventory, inventoryItem } from "packages/db/drizzle/schema";

export const assignBadge = createAction(async ({ session }) => {


  const user = session?.data.userId
    ? await db.query.user.findFirst({
      where: (users, { eq }) => eq(users.id, session.data.userId),
      with: {
        inventory: true,
        events: true
      }
    })
    : undefined


  const badges = await db.query.badge.findMany({
    with: {
      conditions: true
    }
  })

  for (const badge of badges) {
    const allConditionsMet = badge.conditions.every(condition => {
      const actionCount = user?.events.filter(event => event.actionId === condition.actionId).length || 0;
      return actionCount >= condition.quantity;
    });

    if (allConditionsMet) {

      const inventoryId = user?.inventory?.id;

      const existingItem = (inventoryId !== undefined)
        ? await db.query.inventoryItem.findFirst({
          where: (items, { and, eq }) => and(
            eq(items.badgeId, badge.id),
            eq(items.type, "BADGE"),
            eq(items.inventoryId, inventoryId),
          )
        })
        : undefined

      if (!existingItem) {
        const existingInventory = (inventoryId !== undefined)
          ? await db.query.inventory.findFirst({
            where: (items, { eq }) => eq(items.id, inventoryId)
          })
          : undefined

        if (!existingInventory && user?.id) {
          const newInventories = await db.insert(inventory).values({ userId: user.id }).returning()
          const newInventory = newInventories[0];

          if (newInventory?.id) await db.insert(inventoryItem).values({ type: "BADGE", badgeId: badge.id, equipped: true, inventoryId: newInventory.id })
        } else if (existingInventory) {
          await db.insert(inventoryItem).values({ type: "BADGE", badgeId: badge.id, equipped: true, inventoryId: existingInventory.id })
        }
      }
    }
  }

}, undefined, { authed: true })