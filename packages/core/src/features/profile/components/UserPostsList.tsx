"use client"


import { Button } from '@dir/ui'
import Link from 'next/link';
import React, { useEffect, useState } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { Post } from '@dir/db/drizzle/types';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { getUsersPosts } from '~/features/user/actions';



export const UserPostsList = ({ username }: { username: string }) => {

  const ITEMS_PER_PAGE = 8
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

  const [data, setData] = useState<Post[]>([])
  const [count, setCount] = useState(0)
  const totalPages = Math.ceil(count / ITEMS_PER_PAGE);
  const pageNumbers = Array.from({ length: totalPages }, (_, i) => i + 1);

  if (endPage > count) {
    endPage = count
  }


  useEffect(() => {
    (async () => {
      const result = await getUsersPosts({ skip: (page) * pageSize, take: pageSize, username: username })
      setData(result.data);
      setCount(result.count)
    })()
    router.refresh()
  }, [pathname, page, searchQuery, router, pageSize])


  return (
    <div className="flex flex-col gap-12">
      <div className="flex flex-col gap-4">
        {data.map((post) => {
          return (
            <div key={post.id} className={`pt-4 bg-transparent relative border-b rounded pb-4 flex items-center gap-4 w-full justify-between pl-8 pr-8`}>
              <div className="flex gap-4 mr-4 min-w-0">
                <div className="flex flex-col">
                  <Link href={`/posts/${post.slug}`}><span className="text-link font-semibold">{post.title}</span></Link>
                  <span className="text-xs">{post.createdAt.toDateString()}</span>

                </div>
              </div>
            </div>

          )
        })}

      </div>

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

    </div >
  )
}
