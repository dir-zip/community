"use client"
import { User } from "packages/db/drizzle/types"
import { Badge, Table } from "@dir/ui"
import Link from 'next/link'
import { getAllUsers } from "../../../actions"
import { useSearchParams, usePathname, useRouter } from "next/navigation"
import { useEffect, useState } from "react"


const UsersTable = () => {
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

  const [data, setData] = useState<User[]>([])
  const [count, setCount] = useState(0)

  if (endPage > count) {
    endPage = count
  }

  useEffect(() => {
    (async () => {
      const data = await getAllUsers({
        skip, take: ITEMS_PER_PAGE, where: searchQuery && JSON.parse(searchQuery as string)
          ? {
            OR: [
              !isNaN(Number(JSON.parse(searchQuery as string))) &&
                Number(JSON.parse(searchQuery as string)) > 0
                ? {
                  id: Number(JSON.parse(searchQuery as string)),
                }
                : {
                  email: {
                    contains: JSON.parse(searchQuery as string),
                  },
                },
            ],
          }
          : {}
      })
      setData(data.users)
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
            href={`/admin/users/${info.getValue()}`}
            className="text-link"
          >
            {info.getValue()}
          </Link>
        )
      }
    },
    {
      accessorKey: 'username',
      id: 'username',
      cell: (info: any) => info.getValue()
    },
    {
      accessorKey: 'email',
      id: 'email',
      cell: (info: any) => info.getValue()
    },
    {
      accessorKey: 'points',
      id: 'points',
      cell: (info: any) => <Badge>{info.getValue()}</Badge>
    },
    {
      accessorKey: 'role',
      id: 'role',
      cell: (info: any) => info.getValue()
    },
    {
      accessorKey: 'verified',
      id: 'verified',
      cell: (info: any) => <Badge>{info.getValue().toString()}</Badge>
    },
    {
      accessorKey: 'createdAt',
      id: 'createdAt',
      cell: (info: any) => new Date(info.getValue()).toLocaleDateString()
    },
    {
      accessorKey: 'updatedAt',
      id: 'updatedAt',
      cell: (info: any) => new Date(info.getValue()).toLocaleDateString()
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
      routingContext={{
        pathname: '/admin/users',
        searchParams: JSON.parse(searchQuery as string)
      }}
      onNavigate={(url) => {  router.push(url) }}
    />
  )
}

export default UsersTable
