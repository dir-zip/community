import { getCategories, getSinglePost } from "../actions"
import PostForm from "../components/Form"
import {Suspense} from 'react'

export const EditPost = async ({slug}: {slug: string}) => {
  const post = await getSinglePost({slug: slug})
  const categories = await getCategories()

  if(!post) {
    throw new Error("Post not found")
  }
  
  return (
    <div>
      <div className="flex justify-between items-center pb-6">
        <h2 className="text-2xl font-bold">Edit Post</h2>
      </div>
      <Suspense>
        <PostForm post={post} categories={categories}/>
      </Suspense>
    </div>
  )
}