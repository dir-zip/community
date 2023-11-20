"use client";

import { buttonVariants } from "@/components/ui/Button";
import { cn } from "@/lib/utils";
import { Item } from "packages/db";
import { buyItem } from "../actions";
import { toast } from "sonner";

export const ListItems = ({items}: {items: Item[]}) => {
  return (
    <div>
      {items.map((item, i) => {
        return (
          <div key={i}>
            <img src={item.image as string} className="w-20 h-20" />
            <p>{item.title}</p>
            <p>{item.description}</p>
            <p>{item.price}</p>
            <button className={cn(buttonVariants({variant: "default"}))} onClick={async (e) => {
              e.preventDefault()
              toast.promise(
                new Promise(async (resolve, reject) => {
                  try {
                    await buyItem({itemId: item.id})
                    resolve(null)
                  } catch (err) {
                    reject(err)
                  }
    
                }),
                {
                  loading: `Buying item...`,
                  success: `Item purchased!`,
                  error: (error) => `Error buying item ${error.message}`
                }
              )
       
            }}>Buy now</button>
          </div>
        )
      })}
    </div>
  )
}