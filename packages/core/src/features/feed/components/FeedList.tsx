"use client"
import React, { useRef } from 'react'
import { Avatar } from "@dir/ui"
import { PostPreview } from '~/features/posts/components/PostPreview'
import { Post, User, Comment, Category, Tag } from "@dir/db"
import { updatePost } from '~/features/posts/actions'
export const FeedList = ({ feed, currentUser, categories }: { feed: (Post & { user: User, comments: Comment[], category: Category, tags: Tag[] })[], currentUser: User, categories: Category[] }) => {
  const contentRef = useRef<HTMLDivElement>(null);

  return (
    <div className="w-full flex flex-col space-y-6">
      {feed.map((feed) => {
        return (
          <div className="flex flex-row space-x-4 w-full" key={feed.id} ref={contentRef}>
            <Avatar imageUrl={feed.user.avatar} fallback={feed.user.username} />
            <PostPreview 
              content={feed.body} 
              slug={feed.slug}
              category={feed.category.slug} 
              comments={feed.comments.length} 
              currentUserId={currentUser.id} 
              userId={feed.user.id}
              categories={categories.map((c) => { return {title: c.title, slug: c.slug}})}
              onCategorySelect={async (slug) => {
                await updatePost({
                  data: {
                    ...feed,
                    category: slug,
                    tags: feed.tags.map(tag => tag.slug)
                  },
                  slug: feed.slug
                })
              }} 
            />
          </div>
        )
      })}
    </div>
  )
}
