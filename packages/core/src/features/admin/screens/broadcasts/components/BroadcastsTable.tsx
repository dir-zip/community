"use client"
import { useEffect, useState } from "react"
import Link from "next/link"
import { Badge, Table } from "@dir/ui"
import { useSearchParams, usePathname, useRouter } from "next/navigation"
import { getAllBroadcasts } from "../actions"
import { Broadcast } from "@dir/db/drizzle/types"
import { cn } from "@/utils"


export const BroadcastsTable = () => {
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

  const [data, setData] = useState<Broadcast[]>([])
  const [count, setCount] = useState(0)

  if (endPage > count) {
    endPage = count
  }

  useEffect(() => {
    (async () => {

      const data = await getAllBroadcasts({
        skip, take: ITEMS_PER_PAGE, where: searchQuery && JSON.parse(searchQuery as string)
          ? {
            OR: [
              !isNaN(Number(JSON.parse(searchQuery as string))) &&
                Number(JSON.parse(searchQuery as string)) > 0
                ? {
                  id: Number(JSON.parse(searchQuery as string)),
                }
                : {}
            ],
          }
          : {}
      })
      setData(data.broadcasts)
      setCount(data.count)
    })()
    router.refresh()
  }, [pathname, page, searchQuery, router])

  const columns = [
    {
      accessorKey: 'post',
      id: 'post',
      cell: (info: any) => {
        return <Link href={`/posts/${info.getValue().slug}`} className="text-link">{info.getValue().title}</Link>
      }
    },
    {
      accessorKey: 'createdAt',
      id: 'createdAt',
      header: 'Sent At',
      cell: (info: any) => {
        return new Date(info.getValue()).toLocaleDateString()
      }
    },
    {
      accessorKey: 'status',
      id: 'status',
      cell: (info: any) => <Badge className={cn("bg-primary-700", info.getValue() === "SENT" ? "text-green-400" : "")} variant={'default'}>{info.getValue()}</Badge>
    },
    {
      accessorKey: 'users',
      id: 'users',
      header: 'Sent To',
      cell: (info: any) => {
        return <Link href={`/admin/users/${info.getValue()[0].id}`} className="text-link">{info.getValue()[0].email}</Link>
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
        pathname: '/admin/broadcasts',
        searchParams: searchQuery ? JSON.parse(searchQuery) : ''
      }}
      onNavigate={(url) => {  router.push(url) }}
    />
  )
}
