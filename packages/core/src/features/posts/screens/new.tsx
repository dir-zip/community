import { getCategories } from "../actions"
import PostForm from "../components/Form"
import { Suspense } from 'react'

export const NewPost = async () => {
  const categories = await getCategories()
  return (
    <div className="xl:mx-auto xl:w-[960px]">
      <div className="p-6">
        <div className="flex flex-col gap-4 pb-6">
          <h2 className="text-2xl font-bold">New Post</h2>
          <div className="flex w-full items-center justify-center">
            <div className="border-t flex-grow" />
          </div>
        </div>
        <Suspense>
          <PostForm categories={categories} />
        </Suspense>
      </div>
    </div>
  )
}
