"use client";

import { Button, buttonVariants } from "@/components/Button";
import { cn } from "@/utils";
import { Item } from "packages/db";
import { buyItem } from "../actions";
import { toast } from "sonner";
import React, { useState, useEffect } from 'react'
import { useSearchParams, usePathname, useRouter } from "next/navigation";
import { getAllItems } from "~/features/items/actions";
import { ChevronLeft, ChevronRight, Check } from "lucide-react"
import { GoldCoinIcon } from "@/icons/GoldCoin";

export const ListItems = () => {

  const ITEMS_PER_PAGE = 20
  const searchParams = useSearchParams()
  const pathname = usePathname();
  const page = Number(searchParams.get('page')) || 0;
  const searchQuery = searchParams.get('search')
  const tablePage = Number(page)
  const skip = tablePage * ITEMS_PER_PAGE
  const router = useRouter()
  const startPage = tablePage * ITEMS_PER_PAGE + 1
  let endPage = startPage - 1 + ITEMS_PER_PAGE
  const [pageSize, setPageSize] = useState(ITEMS_PER_PAGE);
  const [data, setData] = useState<Item[]>([])
  const [count, setCount] = useState(0)
  const totalPages = Math.ceil(count / ITEMS_PER_PAGE);
  const pageNumbers = Array.from({ length: totalPages }, (_, i) => i + 1);

  if (endPage > count) {
    endPage = count
  }


  useEffect(() => {
    (async () => {


      const items = await getAllItems({ skip: (page) * pageSize, take: pageSize })


      setData(items.data);
      setCount(items.count)


    })()
    router.refresh()
  }, [pathname, page, searchQuery, router, pageSize])

  const [purchaseSuccess, setPurchaseSuccess] = useState<Record<string, boolean>>({});

  return (
    <div>
      <div className="grid grid-cols-3 gap-4">
        {data.map((item) => {
          return (
            <div key={item.id} className="flex bg-primary-700 border rounded flex-col">
              <img src={item.image as string} className="w-full aspect-auto object-cover rounded-tl rounded-tr h-48" />
              <div className="flex flex-col gap-4">
                <div className="px-4 border-t border-b bg-primary-800 py-2 flex gap-2 items-center">
                  <GoldCoinIcon />
                  <h2 className="antialiased font-bold"><span className="text-xl">{item.price}</span><span className="antialiased text-xs pl-1 font-light">p</span></h2>
                </div>
                <div className="flex flex-col px-4 py-2 gap-1">
                  <h3 className="text-lg antialiased">{item.title}</h3>
                  <p className="antialiased text-md">{item.description}</p>
                  <div className="py-4">
                    <button className={cn(buttonVariants({ variant: "default" }))} onClick={async (e) => {
                      e.preventDefault()
                      toast.promise(
                        new Promise(async (resolve, reject) => {
                          try {
                            await buyItem({ itemId: item.id })
                            setPurchaseSuccess(prevState => ({ ...prevState, [item.id]: true }));
                            setTimeout(() => setPurchaseSuccess(prevState => ({ ...prevState, [item.id]: false })), 2000);
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

                    }}>
                        <div className="flex justify-center items-center">
    <span 
      className={`transition-opacity duration-100 ${purchaseSuccess[item.id] ? 'opacity-0' : 'opacity-100'}`}
      aria-hidden={purchaseSuccess[item.id]}
    >
      Buy now
    </span>
    {purchaseSuccess && (
      <Check 
        className="absolute w-4 h-4 transition-opacity duration-300 opacity-100" 
        style={{ opacity: purchaseSuccess[item.id] ? 1 : 0 }}
      />
    )}
  </div>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )
        })}
      </div>
      <div className="py-8 flex gap-4 w-full justify-center">
        <Button disabled={!(tablePage !== 0)} onClick={() => router.push(`?page=${page - 1}`)}><ChevronLeft className="w-4 h-4" /></Button>
        <div className="flex">
          {pageNumbers.map((pageNumber, index) => (
            <button
              className={`py-2 px-4 bg-primary text-primary-foreground border-y shadow-emerald-900/40 shadow-inner saturate-150 hover:saturate-100 inline-flex items-center justify-center text-xs font-medium disabled:pointer-events-none disabled:opacity-50 
            ${index === 0 ? 'rounded-l border border-border-subtle' : ''} 
            ${index !== 0 && index !== pageNumbers.length - 1 ? 'border-r border-border-subtle' : ''} 
            ${index === pageNumbers.length - 1 ? 'rounded-r border-r border-border-subtle' : ''}`}
              key={pageNumber}
              disabled={pageNumber === page + 1}
              onClick={() => router.push(`?page=${pageNumber - 1}`)}
            >
              {pageNumber}
            </button>
          ))}
        </div>

        <Button disabled={!(skip + ITEMS_PER_PAGE < count)} onClick={() => router.push(`?page=${page + 1}`)}><ChevronRight className="w-4 h-4" /></Button>
      </div>

    </div>
  )
}
