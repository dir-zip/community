
import {Suspense} from 'react'
import CategoryForm from './components/Form'
import Link from 'next/link'
import { CategoryTable } from './components/CategoryTable'
import { getSingleCategory } from './actions'

export const AllCategoriesPage = async () => {
  return (
    <div>
      <h3 className="text-xl font-bold pb-4">Categories</h3>
      <Link href="/admin/categories/new">New</Link>
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

