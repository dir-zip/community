
import {Suspense} from 'react'
import CategoryForm from './components/Form'
import Link from 'next/link'
import { CategoryTable } from './components/CategoryTable'
import { getSingleCategory } from './actions'
import { cn } from '@/lib/utils'
import { buttonVariants } from '@/components/ui/Button'

export const AllCategoriesPage = async () => {
  return (
    <div>
      <div className="flex justify-between items-center pb-4">
        <h3 className="text-xl font-bold">Categories</h3>
        <Link className={cn(
          buttonVariants({ variant: "default", size: "sm" })
        )} href="/admin/categories/new">New</Link>
      </div>
      <Suspense>
        <CategoryTable />
      </Suspense>
    </div>
  )
}

export const NewCategoryPage = async () => {
  return (
    <div>
      <h3 className="text-xl font-bold pb-4">New Category</h3>
      <Suspense>
      <CategoryForm />
     </Suspense>
    </div>
  )
}

export const SingleCategoryPage = async ({id}: {id: string}) => {
  const category = await getSingleCategory({ id: id })
  if(!category) {
    throw new Error("Category not found")
  }
  return (
    <div>
      <CategoryForm category={category}/>
    </div>
  )
}

