"use client"
import React from 'react'
import { User, Comment } from "packages/db"
import { Avatar } from "@dir/ui"
import Link from 'next/link'
import { CommentPreview } from "./CommentPreview"
import { applyEffects } from '~/itemEffects'

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
            {applyEffects('avatar', {avatar: comment.user.avatar || "", username: comment.user.username}, comment.user.inventory)}
            <Link href={`/profile/${comment.user.username}`}>{applyEffects('username', {username: comment.user.username}, comment.user.inventory)}</Link>
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