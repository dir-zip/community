"use client"
import { useEffect, useState } from "react"
import Link from 'next/link'
import { Table } from "@dir/ui"
import { useSearchParams, usePathname, useRouter } from "next/navigation"
import { getAllSessions } from "../../../actions"
import { Session } from "packages/db"


const SessionsTable = () => {
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

  const [data, setData] = useState<Session[]>([])
  const [count, setCount] = useState(0)

  if (endPage > count) {
    endPage = count
  }

  useEffect(() => {
    (async () => {

      const data = await getAllSessions({
        skip, take: ITEMS_PER_PAGE, where: searchQuery && JSON.parse(searchQuery as string)
          ? {
            OR: [
              !isNaN(Number(JSON.parse(searchQuery as string))) &&
                Number(JSON.parse(searchQuery as string)) > 0
                ? {
                  id: Number(JSON.parse(searchQuery as string)),
                }
                : {},
              !isNaN(Number(JSON.parse(searchQuery as string))) &&
                Number(JSON.parse(searchQuery as string)) > 0
                ? {
                  userId: Number(JSON.parse(searchQuery as string)),
                }
                : {},
            ],
          }
          : {}
      })
      setData(data.sessions)
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
            href={`/admin/sessions/${info.getValue()}`}
          >
            {info.getValue()}
          </Link>
        )
      }
    },
    {
      accessorKey: 'data',
      id: 'data',
      cell: (info: any) => info.getValue().toString()
    },
    {
      accessorKey: 'userId',
      id: 'userId',
      cell: (info: any) => {
        return (
          <Link
            href={`/admin/users/${info.getValue()}`}
          >
            {info.getValue()}
          </Link>
        )
      }
    },
    {
      accessorKey: 'createdAt',
      id: 'createdAt',
      cell: (info: any) => info.getValue().toISOString()
    },
    {
      accessorKey: 'expiresAt',
      id: 'expiresAt',
      cell: (info: any) => info.getValue().toISOString()
    },
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
    />
  )
}

export default SessionsTable
