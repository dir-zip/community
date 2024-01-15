"use client"


import { Avatar, Badge, Select, SelectTrigger, SelectValue, SelectContent, SelectItem, TagInputField, Button, buttonVariants } from '@dir/ui'
import Link from 'next/link';
import React, { useEffect, useState } from 'react'
import { MessageSquare, Pin, ChevronLeft, ChevronRight, PlusCircle } from 'lucide-react'
import { Category, Post, User, Comment } from 'packages/db';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { getAllPosts } from '../actions';

export interface PostListProps {
  posts: (Category & { posts: (Post & { comments: (Comment & { replies: Comment[] })[], replyCount: number, lastCommentOrReply?: (Comment & { user: User }), user: User })[] })[];
}

export const PostList = ({ posts }: PostListProps) => {
  const [selectedCategory, setSelectedCategory] = React.useState(posts[0]?.slug);

  const ITEMS_PER_PAGE = 10
  const searchParams = useSearchParams()
  const pathname = usePathname();
  const page = Number(searchParams.get('page')) || 0;
  const searchQuery = searchParams.get('search')
  const tablePage = Number(page)
  const skip = tablePage * ITEMS_PER_PAGE
  const router = useRouter()
  const startPage = tablePage * ITEMS_PER_PAGE + 1
  let endPage = startPage - 1 + ITEMS_PER_PAGE
  const [pageSize, setPageSize] = useState(ITEMS_PER_PAGE);

  const [data, setData] = useState<(Category & { posts: (Post & { comments: (Comment & { replies: Comment[] })[], replyCount: number, lastCommentOrReply?: (Comment & { user: User }), user: User })[] })[]>([])
  const [count, setCount] = useState(0)
  const totalPages = Math.ceil(count / ITEMS_PER_PAGE);
  const pageNumbers = Array.from({ length: totalPages }, (_, i) => i + 1);

  if (endPage > count) {
    endPage = count
  }


  useEffect(() => {
    (async () => {
      const result = await getAllPosts({ skip: (page) * pageSize, take: pageSize })

      setData(result);

      // Find the selected category and set the count
      const selectedCategoryData = result.find(category => category.slug === selectedCategory);
      if (selectedCategoryData) {
        setCount(selectedCategoryData.count);
      }
    })()
    router.refresh()
  }, [pathname, page, searchQuery, router, pageSize, selectedCategory])


  return (
    <div className="flex flex-col gap-12">
      <div className="flex justify-between items-center gap-8">
        <div className="w-4/12">
          <Select
            value={selectedCategory}
            onValueChange={(e) => {
              setSelectedCategory(e);
              router.push('?page=0');
            }}
          >
            <SelectTrigger className="bg-primary-900 w-full rounded">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className='bg-primary-900 rounded'>

              {posts.map((option) => (
                <SelectItem key={option.title} value={option.slug} className={`hover:bg-primary-700 rounded`}>
                  {option.title}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="w-4/12">

        </div>
        <div className="w-4/12 flex gap-4 justify-end">
          <Link href={`/posts/new`} className={`${buttonVariants({ variant: "default" })} flex items-center gap-2`}><PlusCircle className="h-4 w-4" />Post</Link>
        </div>
      </div>

      <div className="flex flex-col gap-4">
        {data
          .find((category) => category.slug === selectedCategory)?.posts.map((post) => {
            const category = data.find((category) => category.posts.includes(post));
            return (
              <div key={post.id} className={`pt-4 bg-transparent relative border-b rounded pb-4 flex items-center gap-4 w-full justify-between pl-8 pr-8`}>
                {/* 
                //TODO: Add a field to post to set as pinned by admin only
                <Pin className="transform rotate-45 w-4 h-4 absolute top-2 left-2" /> */}
                <div className="flex gap-4 mr-4 min-w-0">
                  <Avatar imageUrl={post.user.avatar} fallback={post.user.username} />
                  <div className="flex flex-col">
                    <Link href={`/posts/${post.slug}`}><span className="text-link font-semibold">{post.title}</span></Link>
                    <span className="text-xs"><Link href={`/profile/${post.user.username}`}><span className="text-link">{post.user.username}</span></Link> • <span className="text-xs">{post.createdAt.toDateString()}</span></span>
                  </div>
                </div>
                <div className="flex-1 min-w-0 flex items-center justify-center">
                  <Badge>
                    {category?.title}
                  </Badge>
                </div>
                <div className="flex-1 min-w-0 flex items-center justify-center">
                  <Link href={`/posts/${post.slug}`} className="text-link text-sm font-medium flex items-center space-x-2"><MessageSquare className='w-4 h-4' /> <span>{post.replyCount} replies</span></Link>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex flex-col items-end">
                    <span className="text-primary-100 text-xs self-end">Last reply</span>
                    {post.lastCommentOrReply ? <div className="flex gap-4 justify-end">
                      <Avatar imageUrl={post.lastCommentOrReply.user.avatar} fallback={post.lastCommentOrReply.user.username} />
                      <div className="flex flex-col items-end">
                        <Link href={`/profile/${post.lastCommentOrReply.user.username}`}><span className="text-link text-sm">{post.lastCommentOrReply.user.username}</span></Link>
                        <span className="text-xs self-end">{post.lastCommentOrReply.createdAt.toDateString()}</span>
                      </div>
                    </div> : <div><span className="text-xs">No comments</span></div>}

                  </div>
                </div>
              </div>
            )
          })}

      </div>

      <div className="flex gap-4 w-full justify-center">
        <Button disabled={!(tablePage !== 0)} onClick={() => router.push(`?page=${page - 1}`)}><ChevronLeft className="w-4 h-4"/></Button>
        <div className="flex">
          {pageNumbers.map((pageNumber, index) => (
            <button
            className={`py-2 px-4 bg-primary text-primary-foreground border-y shadow-emerald-900/40 shadow-inner saturate-150 hover:saturate-100 inline-flex items-center justify-center text-xs font-medium disabled:pointer-events-none disabled:opacity-50 
            ${index === 0 ? 'rounded-l border border-border-subtle' : ''} 
            ${index !== 0 && index !== pageNumbers.length - 1 ? 'border-r border-border-subtle' : ''} 
            ${index === pageNumbers.length - 1 ? 'rounded-r border-r border-border-subtle' : ''}`}
              key={pageNumber}
              disabled={pageNumber === page + 1}
              onClick={() => router.push(`?page=${pageNumber - 1}`)}
            >
              {pageNumber}
            </button>
          ))}
        </div>

        <Button disabled={!(skip + ITEMS_PER_PAGE < count)} onClick={() => router.push(`?page=${page + 1}`)}><ChevronRight className="w-4 h-4"/></Button>
      </div>

    </div>
  )
}
