import { getComment } from "./actions"
import { CommentForm } from "./components/CommentForm"
import Link from "next/link"
import { getCommentsForPost } from "./actions"
import { CommentList } from "./components/CommentList";
import { Suspense } from 'react'
import { checkGuard, getCurrentUser } from "../auth/actions"
import { Divider } from "@dir/ui"
import { RichTextField } from "~/components/Editor/RichTextField"
import { ChevronLeftSquare, PenSquare, SeparatorHorizontal } from 'lucide-react'
import { FullCommentForm } from "./components/FullCommentForm"
import { applyEffects } from "~/itemEffects"
import { Post, User, Comment } from "packages/db"
import { UserWithInventory } from "~/lib/types";


type CommentWithParentAndUsersAndReplies = Comment & {
  parent: (Comment & { user: UserWithInventory }) | null,
  post: Post & { user: UserWithInventory },
  user: UserWithInventory,
  replyCount: number,
  replies: Array<Comment & {
    user: UserWithInventory,
    replyCount: number
  }>
};

export const SingleCommentScreen = async ({ comment, postSlug }: { comment: CommentWithParentAndUsersAndReplies, postSlug: string }) => {

  const currentUser = await getCurrentUser()

  let can = false
  if(currentUser) {
    can = await checkGuard({ rule: ["UPDATE", "comment", comment.id] });
  }



  return (
    <div className="xl:mx-auto xl:w-[960px]">
      {comment.parent ?
        <div className="p-4">
          <div className="border rounded p-6 bg-primary-800 flex flex-col gap-3">
            <div className="flex flex-col w-full gap-4">
              <div className="flex gap-8">
                <div className="flex flex-col items-center gap-2">
                  {applyEffects('avatar', {avatar: comment.parent.user.avatar || "", username: comment.parent.user.username}, comment.parent.user.inventory)}
                  <Link href={`/profile/${comment.parent.user.username}`}>{applyEffects('username', {username: comment.parent.user.username}, comment.parent.user.inventory)}</Link>
                </div>
                <div className="flex items-center gap-8 w-full bg-primary-900 rounded p-6 border-border-subtle">
                  <RichTextField value={comment.parent.body} editable={false} onValueChange={undefined} />
                </div>
              </div>
              <div className="w-fit"><Link href={`/posts/${postSlug}/comments/${comment.parentId}`}><ChevronLeftSquare className="w-4 h-4 text-link" /></Link></div>
            </div>
          </div>
        </div> : <div className="p-4">
          <div className="border rounded p-6 bg-primary-800 flex flex-col gap-3">
            <div className="flex flex-col gap-4 w-full">
              <div className="flex gap-8">
                <div className="flex flex-col items-center gap-2">
                  {applyEffects('avatar', {avatar: comment.post.user.avatar || "", username: comment.post.user.username}, comment.post.user.inventory)}
                  <Link href={`/profile/${comment.post.user.username}`}>{applyEffects('username', {username: comment.post.user.username}, comment.post.user.inventory)}</Link>
                </div>
                <div className="flex items-center gap-8 w-full bg-primary-900 rounded p-6 border-border-subtle">
                  <RichTextField value={comment.post.body} editable={false} onValueChange={undefined} />
                </div>
              </div>
              <div className="w-fit"><Link href={`/posts/${comment.post.slug}`}><ChevronLeftSquare className="w-4 h-4 text-link" /></Link></div>
            </div>
          </div>
        </div>
      }
      <div className="w-full flex items-center justify-center">
        <SeparatorHorizontal className="w-4 h-4 text-primary-400" />
      </div>

      <div className="flex items-center gap-8 justify-center p-6 flex-col">
        <div className="flex gap-8 w-full">
          <div className="flex flex-col items-center gap-2">
            {applyEffects('avatar', {avatar: comment.user.avatar || "", username: comment.user.username}, comment.user.inventory)}
            <Link href={`/profile/${comment.user.username}`}>{applyEffects('username', {username: comment.user.username}, comment.user.inventory)}</Link>
          </div>
          <div className="w-full bg-primary-900 rounded p-6 border-border-subtle">
            <RichTextField value={comment.body} editable={false} onValueChange={undefined} />
            <div className="w-full flex justify-end">
              {can && <Link href={`/posts/${comment.post.slug}/comments/${comment.id}/edit`}><PenSquare className='text-link w-4 cursor-pointer h-4' /></Link>}
            </div>
          </div>
        </div>


        <Divider text="Comments" />

        <div className="w-full flex flex-col gap-8">
          {currentUser && <CommentForm postSlug={comment.post.slug} parentId={comment.id} user={currentUser} />}
          <Suspense fallback={<div>Loading...</div>}>
            <CommentList comments={comment.replies} mainPostSlug={postSlug} currentUserId={currentUser?.id || null} />
          </Suspense>
        </div>
      </div>
    </div>
  )
}



export const Comments = async ({ postSlug }: {  postSlug: string }) => {
  const comments = await getCommentsForPost({ postSlug: postSlug })
  const currentUser = await getCurrentUser()

  return (

      <div className="w-full flex flex-col gap-16">
        {currentUser && <CommentForm postSlug={postSlug} parentId={null} user={currentUser} />}
        <Suspense fallback={<div>Loading...</div>}>
          <CommentList comments={comments} mainPostSlug={postSlug} currentUserId={currentUser?.id || null} />
        </Suspense>
      </div>

  )
}



export const EditComment = async ({ commentId }: { commentId: string }) => {
  const comment = await getComment({ commentId: commentId })


  if (!comment) {
    throw new Error("Post not found")
  }

  return (
    <div className="xl:mx-auto xl:w-[960px]">
      <div className="p-6">
        <div className="flex flex-col gap-4 pb-6">
          <h2 className="text-2xl font-bold">Edit Comment</h2>
          <div className="flex w-full items-center justify-center">
            <div className="border-t flex-grow" />
          </div>
        </div>

        <Suspense>
          <FullCommentForm comment={comment} postSlug={comment.post.slug} />
        </Suspense>
      </div>
    </div>
  )
}
