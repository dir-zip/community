"use client"
import React, { useEffect, useRef, useState } from 'react'
import {  Button } from "@dir/ui"
import { PostPreview } from '~/features/posts/components/PostPreview'
import { Post, User, Comment, Category, Tag, Broadcast } from "@dir/db"
import { updatePost } from '~/features/posts/actions'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import { getFeed } from '../actions'
import { ChevronRight, ChevronLeft } from 'lucide-react'
import { getAllCategories } from '~/features/admin/screens/categories/actions'
import { applyEffects } from '~/itemEffects'
import {  UserWithInventory } from '~/lib/types'


export const FeedList = ({ currentUser }: { currentUser: User | null }) => {
  const contentRef = useRef<HTMLDivElement>(null);

  const ITEMS_PER_PAGE = 10
  const searchParams = useSearchParams()
  const page = Number(searchParams.get('page')) || 0;
  const tablePage = Number(page)
  const skip = tablePage * ITEMS_PER_PAGE
  const router = useRouter()
  const startPage = tablePage * ITEMS_PER_PAGE + 1
  let endPage = startPage - 1 + ITEMS_PER_PAGE
  const [pageSize, setPageSize] = useState(ITEMS_PER_PAGE);
  const [categoriesSelect, setCategoriesSelect] = useState<Category[]>([])
  const [data, setData] = useState<(Post & { user: UserWithInventory, comments: Comment[], category: Category, tags: Tag[], broadcasts?: Broadcast[] | null})[]>([])
  const [count, setCount] = useState(0)
  const totalPages = Math.ceil(count / ITEMS_PER_PAGE);
  const pageNumbers = Array.from({ length: totalPages }, (_, i) => i + 1);

  if (endPage > count) {
    endPage = count
  }


  useEffect(() => {
    const getFeedData = async () => {
      const feed = await getFeed({ skip: (page) * pageSize, take: pageSize })


      setData(feed.data);
      setCount(feed.count)

      const categories = await getAllCategories({ skip: 0, take: 20 })
      setCategoriesSelect(categories.categories)
    }
    getFeedData()

  }, [page, pageSize, searchParams])


  return (
    <div className="w-full flex flex-col space-y-6">
      {data.map((feed) => {
        return (
          <div className="flex flex-row space-x-4 w-full" key={feed.id} ref={contentRef}>
            <div>
            {applyEffects('avatar', {username: feed.user.username, avatar: feed.user.avatar || ""}, feed.user.inventory)}
            </div>
            <PostPreview
              content={feed.body}
              slug={feed.slug}
              category={feed.category.slug}
              comments={feed.comments.length}
              currentUserId={currentUser?.id || null}
              userId={feed.user.id}
              categories={categoriesSelect.map((c) => { return { title: c.title, slug: c.slug } })}
              broadcast={feed.broadcasts && feed.broadcasts.length ? true : false}
              onCategorySelect={async (slug) => {
                const {broadcasts, ...feedData} = feed // Remove broadcast from the feed since you shouldn't edit once its created
                await updatePost({
                  data: {
                    ...feedData,
                    category: slug,
                    tags: feed.tags.map(tag => tag.slug),
                  },
                  slug: feed.slug,
                })
              }}
            />
          </div>
        )
      })}

      <div className="flex gap-4 w-full justify-center">
        <Button disabled={!(tablePage !== 0)} onClick={() => router.push(`?page=${page - 1}`)}><ChevronLeft className="w-4 h-4" /></Button>
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

        <Button disabled={!(skip + ITEMS_PER_PAGE < count)} onClick={() => router.push(`?page=${page + 1}`)}><ChevronRight className="w-4 h-4" /></Button>
      </div>
    </div>
  )
}
