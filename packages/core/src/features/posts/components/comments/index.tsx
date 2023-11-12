import { getCommentsForPost } from "../../actions"
import { CommentForm } from "./CommentForm"

export const Comments = async ({postId}: {postId: string}) => {
  const comments = await getCommentsForPost({postId: postId})
  return (
    <div>
      <h3>Comments</h3>
      <CommentForm postId={postId}/>
      <div>
        {comments.map((c, i) => {
          return (
            <div key={i}>
              <p>{c.body}</p>
              <p>{c.user.username}</p>
              <p>{c.createdAt.toDateString()}</p>
            </div>
          )
        })}
      </div>
    </div>
  )
}