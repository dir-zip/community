import { buttonVariants } from "@/components/ui/Button"
import { cn } from "@/lib/utils"
import Link from "next/link"
import { getSinglePost } from "../actions"
import { redirect } from "next/navigation"
import { Comments } from "../components/comments"

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
      <div>
        {post.comments.map((comment, i) => {
          return (
          <div key={i}>
            <div>{comment.parent?.body}</div>
          </div>
          )
        })}
      </div>
      <Comments postId={post.id}/>
    </div>
  )
}