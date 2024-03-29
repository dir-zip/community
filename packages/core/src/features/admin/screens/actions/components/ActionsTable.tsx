"use client"
import { useEffect, useState } from "react"
import { Table, Badge} from "@dir/ui"
import Link from 'next/link'
import { useSearchParams, usePathname, useRouter } from "next/navigation"
import { getAllActions } from "../actions"
import { Action } from "packages/db/drizzle/types"



export const ActionsTable = () => {
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

  const [data, setData] = useState<Action[]>([])
  const [count, setCount] = useState(0)

  if (endPage > count) {
    endPage = count
  }

  useEffect(() => {
    (async () => {

      const data = await getAllActions({
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
      setData(data.actions)
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
            href={`/admin/actions/${info.getValue()}`}
            className="text-link"
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
      accessorKey: 'value',
      id: 'value',
      cell: (info: any) => <Badge>{info.getValue().toString()}</Badge>
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
        pathname: '/admin/actions',
        searchParams: JSON.parse(searchQuery as string)
      }}
      onNavigate={(url) => {  router.push(url) }}
    />
  )
}
