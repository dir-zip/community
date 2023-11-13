import { Comments } from "@/features/comments/screens"
import { getSinglePost } from "../actions"
import { redirect } from "next/navigation"

import {Suspense} from 'react'

export const SinglePost = async ({slug}: {slug: string}) => {
  const post = await getSinglePost({slug: slug})
  if(!post) {
    redirect('/404')
  }

  return (
    <div>
      <h2>{post.title}</h2>
      <p>{post.createdAt.toDateString()}</p>
      <p>{post.user.username}</p>
      <div>
        {post.body}
      </div>
      <Suspense fallback={<div>Loading...</div>}>
        <Comments postSlug={post.slug} />
      </Suspense>
    </div>
  )
}