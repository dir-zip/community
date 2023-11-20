import { Comments } from "@/features/comments/screens"
import { getSinglePost } from "../actions"
import { redirect } from "next/navigation"

import {Suspense} from 'react'
import Link from "next/link"
import { checkGuard } from "@/features/auth/actions"

export const SinglePost = async ({slug, loggedIn}: {slug: string, loggedIn: boolean}) => {
  const post = await getSinglePost({slug: slug})
  const can = await checkGuard({ rule: ["UPDATE", "post", slug] });
  if(!post) {
    redirect('/404')
  }

  return (
    <div>
      <h2>{post.title}</h2>
      {can && <Link href={`/posts/${slug}/edit`}><p>Edit</p></Link>}
      <p>{post.createdAt.toDateString()}</p>
      <Link href={`/profile/${post.user.username}`}><p>{post.user.username}</p></Link>
      <div>
        {post.body}
      </div>
      <Suspense fallback={<div>Loading...</div>}>
        <Comments postSlug={post.slug} loggedIn={loggedIn}/>
      </Suspense>
    </div>
  )
}