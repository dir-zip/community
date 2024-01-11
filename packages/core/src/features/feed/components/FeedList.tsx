"use client"
import React, { useRef } from 'react'
import { PostPreview, Avatar } from "@dir/ui"
import {  Post } from "@dir/db"
export const FeedList = ({ feed, user }: { feed: Post[], user: { username: string, avatar: string } }) => {
  const contentRef = useRef<HTMLDivElement>(null);

  return (
    <div className="w-full flex flex-col space-y-6">
      {feed.map((feed) => {
        return (
          <div className="flex flex-row space-x-4 w-full" key={feed.id} ref={contentRef}>
            <Avatar imageUrl={user.avatar} fallback={user.username} />
            <PostPreview content={feed.body} />
          </div>
        )
      })}
    </div>
  )
}
