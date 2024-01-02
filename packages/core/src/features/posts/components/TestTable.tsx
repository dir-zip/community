"use client";
import { useState, useEffect } from 'react'
import { Table } from '@dir/ui'
import { useSearchParams, usePathname, useRouter } from 'next/navigation';
import { Category } from 'packages/db';
import { getAllCategories } from '~/features/admin/screens/categories/actions';
import Link from 'next/link';
export const TestTable = () => {
  const ITEMS_PER_PAGE = 1
  const searchParams = useSearchParams()
  const pathname = usePathname()
  const page = searchParams.get('page')
  const searchQuery = searchParams.get('search')
  const tablePage = Number(page)
  const skip = tablePage * ITEMS_PER_PAGE
  const router = useRouter()
  const startPage = tablePage * ITEMS_PER_PAGE + 1
  let endPage = startPage - 1 + ITEMS_PER_PAGE

  const [data, setData] = useState<Category[]>([])
  const [count, setCount] = useState(0)

  if (endPage > count) {
    endPage = count
  }

  useEffect(() => {
    (async () => {

      const data = await getAllCategories({
        skip,
        take: ITEMS_PER_PAGE,
        where: searchQuery && JSON.parse(searchQuery as string)
          ? {
            OR: [
              {
                id: JSON.parse(searchQuery as string),
              },
              {
                title: {
                  contains: JSON.parse(searchQuery as string),
                }
              }
            ],
          }
          : {}
      })
      setData(data.categories)
      setCount(data.count)

    })()
    router.refresh()
  }, [pathname, page, searchQuery, router])

  const columns = [
    {
      accessorKey: 'id',
      id: 'id',
      cell: (info: any) => {
        return (
          <Link
            href={`/admin/categories/${info.getValue()}`}
          >
            {info.getValue()}
          </Link>
        )
      }
    },
    {
      accessorKey: 'title',
      id: 'title',
      cell: (info: any) => info.getValue()
    },
    {
      accessorKey: 'slug',
      id: 'slug',
      cell: (info: any) => info.getValue()
    }
  ]

  const handleNavigation = (url: string) => {
    router.push(url);
  };

  return (
    <div>
      <Table
        columns={columns}
        data={data}
        pageCount={Math.ceil(count / ITEMS_PER_PAGE)}
        pageIndex={tablePage}
        pageSize={ITEMS_PER_PAGE}
        hasNext={skip + ITEMS_PER_PAGE < count}
        hasPrevious={tablePage !== 0}
        totalCount={count}
        startPage={startPage}
        endPage={endPage}
        routingContext={
          {
            pathname: pathname,
            searchParams: searchQuery
          }
        }
        onNavigate={handleNavigation}
      />
    </div>
  )
}
