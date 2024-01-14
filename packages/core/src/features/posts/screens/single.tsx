import { Comments } from "~/features/comments/screens"
import { getSinglePost } from "../actions"
import { redirect } from "next/navigation"

import { Suspense } from 'react'
import Link from "next/link"
import { checkGuard } from "~/features/auth/actions"
import { Avatar, Divider, RichTextField } from "@dir/ui"
import {PenSquare} from 'lucide-react'
export const SinglePost = async ({ slug, loggedIn }: { slug: string, loggedIn: boolean }) => {
  const post = await getSinglePost({ slug: slug })
  const can = await checkGuard({ rule: ["UPDATE", "post", slug] });
  if (!post) {
    redirect('/404')
  }

  return (
    <div className="flex items-center gap-8 justify-center p-6 flex-col">

  
      <div className="flex gap-8 w-full">
        <div className="flex flex-col items-center gap-2">
          <Avatar imageUrl={post.user.avatar} fallback={post.user.username} />
          <Link href={`/profile/${post.user.username}`}><p className="text-link">{post.user.username}</p></Link>
        </div>
        <div className="w-full bg-primary-900 rounded p-6 border-border-subtle">
          <RichTextField value={post.body} editable={false} onValueChange={undefined} />
          <div className="w-full flex justify-end">
            {can && <Link href={`/posts/${slug}/edit`}><PenSquare className='text-link w-4 cursor-pointer h-4' /></Link>}
          </div>
        </div>
      </div>


      <Divider text="Comments"/>


      <Suspense fallback={<div>Loading...</div>}>
        <Comments postSlug={post.slug} loggedIn={loggedIn} />
      </Suspense>
    </div>
  )
}
