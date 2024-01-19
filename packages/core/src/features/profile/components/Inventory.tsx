"use client"
import { buttonVariants } from "@/components/Button";
import { cn } from "@/utils";
import { Badge, Inventory, Item, type InventoryItem } from "packages/db";
import { equipAndUnequipItem } from "../actions";
import { toast } from "sonner";

type InventoryItemWithDetails = InventoryItem & { badge: Badge | null, item: Item | null };

export const InventoryProfile = ({inventory}: {inventory: Inventory & {collection: InventoryItemWithDetails[] } | null}) => {
  return (
    <div>
      <div>
        <h3 className="font-bold text-lg">Badges</h3>
        {inventory?.collection.filter(t => t.type === "BADGE").map((item, i) => {
          return (
            <div key={i} className="border border-slate-400 w-fit p-4">
              <img src={item.badge?.image as string} className="w-20 h-20"/>
              <p>{item.badge?.title}</p>
            </div>
          )
        })}
      </div>

      <div>
        <h3 className="font-bold text-lg">Items</h3>
        {inventory?.collection.filter(t => t.type === "ITEM").map((item, i) => {
          return (
            <div key={i} className="border border-slate-400 w-fit p-4">
              <img src={item.item?.image as string} className="w-20 h-20"/>
              <p>{item.item?.title}</p>
              <button onClick={async (e) => {
                e.preventDefault()
                toast.promise(
                  new Promise(async (resolve, reject) => {
                    try {
                      await equipAndUnequipItem({itemId: item.id})
                      resolve(null)
                    } catch (err) {
                      reject(err)
                    }
      
                  }),
                  {
                    loading: `Equipping`,
                    success: `Item Equipped!`,
                    error: (error) => `Error equipping item ${error.message}`
                  }
                )
             
              }} className={cn(buttonVariants({variant: 'outline'}))}>{item.equipped ? "Unequip" : "Equip"}</button>
            </div>
          )
        })}
      </div>
    </div>
  )
}