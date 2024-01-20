
import { Suspense } from 'react'
import { ItemForm } from './components/Form'
import Link from 'next/link'

import { cn } from '@/utils'
import { buttonVariants } from '@/components/Button'
import { getSingleItem } from './actions'
import { ItemsTable } from './components/ItemsTable'
import { effects } from '~/itemEffects'

const buildEffects = effects.map(effect => {
  return (
    {key: effect.name, value: effect.name}
  )
})

export const AllItemsPage = async () => {
  return (
    <div className="xl:mx-auto xl:w-[960px]">
      <div className="py-6">

        <div className="flex flex-col gap-4 pb-6">
          <div className="flex justify-between">
            <h2 className="text-2xl font-bold">Items</h2>
            <Link className={cn(
              buttonVariants({ variant: "default" })
            )} href="/admin/items/new">New</Link>
          </div>
          <div className="flex w-full items-center justify-center">
            <div className="border-t flex-grow" />
          </div>
        </div>

        <Suspense>
          <ItemsTable />
        </Suspense>

      </div>
    </div>

  )
}

export const NewItemPage = async () => {

  return (
    <div className="xl:mx-auto xl:w-[960px]">
      <div className="py-6">

        <div className="flex flex-col gap-4 pb-6">
          <div className="flex justify-between">
            <h2 className="text-2xl font-bold">New Item</h2>
          </div>
          <div className="flex w-full items-center justify-center">
            <div className="border-t flex-grow" />
          </div>
        </div>

        <Suspense>
          <ItemForm effects={buildEffects}/>
        </Suspense>

      </div>
    </div>
  )
}

export const SingleItemPage = async ({ id }: { id: string }) => {
  const item = await getSingleItem({ id: id })
  if (!item) {
    throw new Error("Item not found")
  }
  return (
    <div className="xl:mx-auto xl:w-[960px]">
      <div className="py-6">

        <div className="flex flex-col gap-4 pb-6">
          <div className="flex justify-between">
            <h2 className="text-2xl font-bold">Edit {item.title}</h2>
          </div>
          <div className="flex w-full items-center justify-center">
            <div className="border-t flex-grow" />
          </div>
        </div>

        <Suspense>
          <ItemForm item={item} effects={buildEffects}/>
        </Suspense>

      </div>
    </div>
  )
}

