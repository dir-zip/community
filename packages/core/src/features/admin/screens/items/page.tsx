
import {Suspense} from 'react'
import {ItemForm} from './components/Form'
import Link from 'next/link'

import { cn } from '@/lib/utils'
import { buttonVariants } from '@/components/ui/Button'
import { getSingleItem } from './actions'
import { ItemsTable } from './components/ItemsTable'

export const AllItemsPage = async () => {
  return (
    <div>
      <div className="flex justify-between items-center pb-4">
        <h3 className="text-xl font-bold">Items</h3>
        <Link className={cn(
          buttonVariants({ variant: "default", size: "sm" })
        )} href="/admin/items/new">New</Link>
      </div>
      <Suspense>
          <ItemsTable />
      </Suspense>
    </div>
  )
}

export const NewItemPage = async () => {
  return (
    <div>
      <h3 className="text-xl font-bold pb-4">New Item</h3>
      <Suspense>
      <ItemForm />
     </Suspense>
    </div>
  )
}

export const SingleItemPage = async ({id}: {id: string}) => {
  const item = await getSingleItem({ id: id })
  if(!item) {
    throw new Error("Item not found")
  }
  return (
    <div>
      <ItemForm item={item}/>
    </div>
  )
}

