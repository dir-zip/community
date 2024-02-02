"use client"
import { useEffect, useState } from "react"
import { Badge, Button, Table } from '@dir/ui'
import Link from 'next/link'
import { useSearchParams, usePathname, useRouter } from "next/navigation"
import { getAllLists } from "../actions"
import { List, User, Broadcast } from "packages/db"


export const ListTable = () => {
  const ITEMS_PER_PAGE = 10
  const searchParams = useSearchParams()
  const pathname = usePathname();
  const page = searchParams.get('page')
  const searchQuery = searchParams.get('search')
  const tablePage = Number(page)
  const skip = tablePage * ITEMS_PER_PAGE
  const router = useRouter()
  const startPage = tablePage * ITEMS_PER_PAGE + 1
  let endPage = startPage - 1 + ITEMS_PER_PAGE

  const [data, setData] = useState<(List & {users: User[], broadcasts: Broadcast[]})[]>([])
  const [count, setCount] = useState(0)

  if (endPage > count) {
    endPage = count
  }

  useEffect(() => {
    (async () => {

      const data = await getAllLists({
        skip, take: ITEMS_PER_PAGE, where: searchQuery && JSON.parse(searchQuery as string)
          ? {
            OR: [
              {
                slug: {
                  contains: JSON.parse(searchQuery as string)
                }
              },
              {
                title: {
                  contains: JSON.parse(searchQuery as string)
                }
              }
            ]
          }
          : {}
      })
      setData(data.lists)
      setCount(data.count)
    })()
    router.refresh()
  }, [pathname, page, searchQuery, router])

  const columns = [
    {
      accessorKey: 'slug',
      id: 'slug',
      header: 'Title',
      cell: (info: any) => {
        return (
          <Link
          href={`/admin/lists/${info.getValue()}`}
          className="text-link"
        >
          {info.row.original.title}
        </Link>
        )
      }
    },
    {
      accessorKey: 'users',
      id: 'users',
      header: 'Total Users',
      cell: (info: any) => <Badge>{info.getValue().length}</Badge>
    },
    {
      accessorKey: 'edit',
      id: 'edit',
      header: '',
      cell: (info: any) => {
        return (
          info.row.original.slug !== 'unsubscribed' ? <Button onClick={() => router.push(`/admin/lists/${info.row.original.slug}/edit`)}>Edit</Button> : null
        )
      }
    }
  ]

  return (
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
      routingContext={{
        pathname: '/admin/lists',
        searchParams: JSON.parse(searchQuery as string)
      }}
      onNavigate={(url) => {  router.push(url) }}
    />
  )
}
