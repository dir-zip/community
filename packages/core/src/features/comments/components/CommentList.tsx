"use client"
import React from 'react'
import { User, Comment } from "packages/db"
import { Avatar } from "@dir/ui"
import Link from 'next/link'
import { CommentPreview } from "./CommentPreview"

export type CommentsListProps = {
  comments: (Comment & {user: User, replyCount: number})[],
  mainPostSlug: string,
  currentUserId: string
}
export const CommentList = ({comments, mainPostSlug, currentUserId}: CommentsListProps) => {
  return (
    <div className="flex flex-col gap-16">
    {comments.map((comment) => {
      return (
        <div key={comment.id} className="flex w-full gap-8">
          <div className="flex flex-col items-center gap-2">
            <Avatar imageUrl={comment.user.avatar} fallback={comment.user.username} />
            <Link href={`/profile/${comment.user.username}`}><p className="text-link">{comment.user.username}</p></Link>
          </div>
          <CommentPreview 
            content={comment.body} 
            replies={comment.replyCount} 
            mainPostSlug={mainPostSlug} 
            slug={comment.id} 
            userId={comment.userId} 
            currentUserId={currentUserId} 
          />
        </div>
      )
    })}
  </div>
  )
}