import { getCategories } from "../actions"
import PostForm from "../components/Form"
import {Suspense} from 'react'

export const NewPost = async () => {
  const categories = await getCategories()
  return (
    <div>
      <div className="flex justify-between items-center pb-6">
        <h2 className="text-2xl font-bold">New Post</h2>
      </div>
      <Suspense>
        <PostForm categories={categories}/>
      </Suspense>
    </div>
  )
}