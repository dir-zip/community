import { getComment } from "./actions"
import { CommentForm } from "./components/CommentForm"
import { redirect } from "next/navigation"
import Link from "next/link"
import type { Comment, User } from "packages/db";
import { getCommentsForPost } from "./actions"


const Comment = async ({ comment, postSlug }: {comment: Comment & {user?: User, replies?: Comment[] }, postSlug: string}) => {

  return (
    <div>
      <Link href={`/posts/${postSlug}/comments/${comment.id}`}><p>{comment.body}</p></Link>
      <p>{comment.createdAt.toDateString()}</p>
      <Link href={`/profile/${comment.user?.username}`}><p>{comment.user?.username}</p></Link>
      <div className="pl-6">
        {comment.replies?.map((reply) => (
          <Comment key={reply.id} comment={reply} postSlug={postSlug}  />
        ))}
      </div>
    </div>
  );
}

export const SingleCommentScreen = async({postSlug, commentId, loggedIn}: {postSlug:string, commentId: string, loggedIn: boolean}) => {
  const comment = await getComment({commentId: commentId})
  if(!comment) {
    redirect('/404')
  }

  return (
    <div>
      {comment.parent ? 
        <div className="p-4 border rounded">
          <Link href={`/posts/${postSlug}/comments/${comment.parentId}`}>
            <p>"{comment.parent?.body}"</p>
          </Link>
          <p>{comment.createdAt.toDateString()}</p>
          <Link href={`/profile/${comment.user.username}`}><p>{comment.user.username}</p></Link>
        </div> : null 
      }
      <p>{comment.body}</p>
      <p>{comment.createdAt.toDateString()}</p>
      <p>{comment.user.username}</p>
      {loggedIn && <CommentForm postSlug={postSlug} parentId={comment.id}/>}
      {comment.replies.map((reply, i) => {
        return (
          <div key={reply.id}>
            <Link href={`/posts/${postSlug}/comments/${reply.id}`}><p>{reply.body}</p></Link>
            <p>{reply.createdAt.toDateString()}</p>
            <Link href={`/profile/${comment.user.username}`}><p>{comment.user.username}</p></Link>
          </div>
        )
      })}
    </div>
  )
}



export const Comments = async ({postSlug, loggedIn}: {loggedIn: boolean, postSlug: string}) => {
  const comments = await getCommentsForPost({postSlug: postSlug})
  
  return (
    <div>
      <h3>Comments</h3>
      {loggedIn && <CommentForm postSlug={postSlug} parentId={null}/>}
      <div>
        {comments.map((comment) => {

          return (
            <div key={comment.id}>
              <Comment comment={comment} postSlug={postSlug} />
            </div>
          )
        })}
      </div>
    </div>
  )
}