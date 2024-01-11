"use client"
import React, { useRef } from 'react'
import { PostPreview, Avatar } from "@dir/ui"
import { Post, User, Comment } from "@dir/db"
export const FeedList = ({ feed, user }: { feed: (Post & { user: User, comments: Comment[] })[], user: { username: string, avatar: string } }) => {
  const contentRef = useRef<HTMLDivElement>(null);

  return (
    <div className="w-full flex flex-col space-y-6">
      {feed.map((feed) => {
        return (
          <div className="flex flex-row space-x-4 w-full" key={feed.id} ref={contentRef}>
            <Avatar imageUrl={feed.user.avatar} fallback={feed.user.username} />
            <PostPreview content={feed.body} slug={feed.slug} comments={feed.comments.length} />
          </div>
        )
      })}
    </div>
  )
}
