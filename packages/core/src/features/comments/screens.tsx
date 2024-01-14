import { getComment } from "./actions"
import { CommentForm } from "./components/CommentForm"
import { redirect } from "next/navigation"
import Link from "next/link"
import { getCommentsForPost } from "./actions"
import { CommentList } from "./components/CommentList";
import {Suspense} from 'react'
import { checkGuard, getCurrentUser } from "../auth/actions"
import { Avatar, Divider, RichTextField } from "@dir/ui"
import {ChevronLeftSquare, PenSquare, SeparatorHorizontal} from 'lucide-react'
import { FullCommentForm } from "./components/FullCommentForm"



export const SingleCommentScreen = async({postSlug, commentId, loggedIn}: {postSlug:string, commentId: string, loggedIn: boolean}) => {
  const comment = await getComment({commentId: commentId})
  const currentUser = await getCurrentUser()
  const can = await checkGuard({ rule: ["UPDATE", "comment", commentId] });
  if(!comment) {
    redirect('/404')
  }

  return (
    <>
      {comment.parent ? 
        <div className="p-4">
          <div className="border rounded p-6 bg-primary-800 flex flex-col gap-3">
            <div className="flex flex-col w-full gap-4">
              <div className="flex gap-8">
                <div className="flex flex-col items-center gap-2">
                  <Avatar imageUrl={comment.parent.user.avatar} fallback={comment.parent.user.username} />
                  <Link href={`/profile/${comment.parent.user.username}`}><p className="text-link">{comment.parent.user.username}</p></Link>
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
                  <Avatar imageUrl={comment.post.user.avatar} fallback={comment.post.user.username} />
                  <Link href={`/profile/${comment.post.user.username}`}><p className="text-link">{comment.post.user.username}</p></Link>
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
                <Avatar imageUrl={comment.user.avatar} fallback={comment.user.username} />
                <Link href={`/profile/${comment.user.username}`}><p className="text-link">{comment.user.username}</p></Link>
              </div>
              <div className="w-full bg-primary-900 rounded p-6 border-border-subtle">
                <RichTextField value={comment.body} editable={false} onValueChange={undefined} />
                <div className="w-full flex justify-end">
                  {can && <Link href={`/posts/${comment.post.slug}/comments/${comment.id}/edit`}><PenSquare className='text-link w-4 cursor-pointer h-4' /></Link>}
                </div>
              </div>
            </div>


            <Divider text="Comments"/>

            <div className="w-full flex flex-col gap-8">
            {loggedIn && <CommentForm postSlug={comment.post.slug} parentId={comment.id}/>}
            <Suspense fallback={<div>Loading...</div>}>
              <CommentList comments={comment.replies} mainPostSlug={postSlug} currentUserId={currentUser.id} />
            </Suspense>
            </div>
          </div>
    </>
  )
}



export const Comments = async ({postSlug, loggedIn}: {loggedIn: boolean, postSlug: string}) => {
  const comments = await getCommentsForPost({postSlug: postSlug})
  const currentUser = await getCurrentUser()

  return (
    <div className="w-full flex flex-col gap-16">
      {loggedIn && <CommentForm postSlug={postSlug} parentId={null}/>}
        <Suspense fallback={<div>Loading...</div>}>
          <CommentList comments={comments} mainPostSlug={postSlug} currentUserId={currentUser.id} />
        </Suspense>
    </div>
  )
}



export const EditComment = async ({commentId}: {commentId: string}) => {
  const comment = await getComment({commentId: commentId})


  if(!comment) {
    throw new Error("Post not found")
  }
  
  return (
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
  )
}