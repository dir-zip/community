import { getCategories, getSinglePost } from "../actions"
import PostForm from "../components/Form"
import { Suspense } from 'react'

export const EditPost = async ({ slug }: { slug: string }) => {
  const post = await getSinglePost({ slug: slug })
  const categories = await getCategories()

  if (!post) {
    throw new Error("Post not found")
  }

  return (
    <div className="xl:mx-auto xl:w-[960px]">
      <div className="p-6">
        <div className="flex flex-col gap-4 pb-6">
          <h2 className="text-2xl font-bold">Edit Post</h2>
          <div className="flex w-full items-center justify-center">
            <div className="border-t flex-grow" />
          </div>
        </div>

        <Suspense>
          <PostForm post={post} categories={categories} />
        </Suspense>
      </div>
    </div>
  )
}
