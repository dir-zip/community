"use client"
import { Button } from "@dir/ui";
import { Badge, Inventory, InventoryItem, Item, User } from "@dir/db"
import { useEffect, useState } from "react"
import { toast } from "sonner";
import { equipAndUnequipItem, getUserInventory } from "~/features/user/actions"

type InventoryItemWithDetails = InventoryItem & { badge?: Badge | null, item: Item | null, quantity: number };

export const InventoryList = ({ currentUser }: { currentUser: User }) => {
  const [data, setData] = useState<Inventory & {collection: InventoryItemWithDetails[] } | null>(null);

  useEffect(() => {
    (async () => {
      const result = await getUserInventory({ userId: currentUser.id })
      setData(result)
    })()
  }, [])

  return (
    <div className="flex flex-col">
      <h3 className="text-lg font-bold">Inventory</h3>
      <p className="antialiased text-sm">Manage your inventory</p>
      <div>

      <div className="grid grid-cols-3 py-4">
        {data?.collection.filter(t => t.type === "ITEM").map((item, i) => {
          return (
            <div key={i} className="flex flex-col gap-4 border rounded p-4">
              <img src={item.item?.image as string} className="object-cover rounded"/>
              <div className="flex justify-between items-center">
                <p>{item.item?.title}</p>
                <p className="text-xs text-primary-300 bg-primary-900 border rounded px-2">x{item.quantity}</p>
              </div>

              <Button onClick={async (e) => {
                e.preventDefault()
                const action = item.equipped ? "Unequipping" : "Equipping";
                toast.promise(
                  new Promise(async (resolve, reject) => {
                    try {
                      await equipAndUnequipItem({itemId: item.id})
                      const result = await getUserInventory({ userId: currentUser.id });
                      setData(result);
                      resolve(null)
                    } catch (err) {
                      reject(err)
                    }
      
                  }),
                  {
                    loading: `${action}`,
                    success: `Item ${item.equipped ? "Unequipped" : "Equipped"}!`,
                    error: (error) => `Error ${action.toLowerCase()} item: ${error.message}`
                  }
                )
             
              }}>{item.equipped ? "Unequip" : "Equip"}</Button>
            </div>
          )
        })}
      </div>
    </div>
    </div>
  )
}