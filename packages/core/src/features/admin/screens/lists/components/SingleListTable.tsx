"use client"
import { useEffect, useState } from "react"
import { Badge, Button, Table } from '@dir/ui'
import Link from 'next/link'
import { useSearchParams, usePathname, useRouter } from "next/navigation"
import { getUsersFromList, removeUserFromList } from "../actions"
import { User } from "packages/db"
import { AddUserModal } from "./AddUserModal"


export const SingleListTable = ({slug}: {slug: string}) => {
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
    const getData = async () => {
      const data = await getUsersFromList({
        skip, slug,  take: ITEMS_PER_PAGE, where: searchQuery && JSON.parse(searchQuery as string)
          ? {
            OR: [
              {
                username: {
                  contains: JSON.parse(searchQuery as string)
                }
              },
              {
                email: {
                  contains: JSON.parse(searchQuery as string)
                }
              }
            ]
          }
          : {}
      })
      setData(data.users)
      setCount(data.count)

    }

    getData()

  }, [pathname, page, searchQuery, router, searchParams])

  const columns = [
    {
      accessorKey: 'username',
      id: 'username',
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
      accessorKey: 'email',
      id: 'email',
      cell: (info: any) => {
        return (
          <span>{info.getValue()}</span>
        )
      }
    },
    {
      accessorKey: 'points',
      id: 'points',
      cell: (info: any) => {
        return (
          <Badge className="bg-primary-900">{info.getValue()}</Badge>
        )
      }
    },
    {
      accessorKey: 'verified',
      id: 'verified',
      cell: (info: any) => {
        return (
          <Badge className="bg-primary-900">{info.getValue().toString()}</Badge>
        )
      }
    },
    {
      accessorKey: 'removeUser',
      id: 'removeUser',
      header: "Remove User",
      cell: (info: any) => {
        return (
          <Button variant={"destructive"} onClick={async () => {
            await removeUserFromList({slug, userId: info.row.original.id})
            // A hack to revalidate the list by changing the searchParams
            router.push(`/admin/lists/${slug}?updated=true`)
          }}>Remove</Button>
        )
      }
    }
  ]
  
  return (
    <>
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
        pathname: `/admin/lists/${slug}`,
        searchParams: JSON.parse(searchQuery as string)
      }}
      onNavigate={(url) => {  router.push(url) }}
    />
    <AddUserModal listSlug={slug}/>
    {}
    </>
  )
}
