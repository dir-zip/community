"use client"
import { useCallback, useEffect, useState } from "react"
import { Table } from '@dir/ui'
import Link from 'next/link'
import { useSearchParams, usePathname, useRouter } from "next/navigation"
import { getAllResource } from "../../../../admin/actions"
import { ResourceSchema } from "../../../../../index"


const ResourceTable = ({ resource, schema }: { resource: string, schema: ResourceSchema }) => {
  const ITEMS_PER_PAGE = 10
  const searchParams = useSearchParams()
  const pathname = usePathname();




  const [data, setData] = useState([])
  const [count, setCount] = useState(0)

  const page = searchParams.get('page')
  const searchQuery = searchParams.get('search')
  const tablePage = Number(page)
  const skip = tablePage * ITEMS_PER_PAGE
  const router = useRouter()
  const startPage = tablePage * ITEMS_PER_PAGE + 1
  let endPage = startPage - 1 + ITEMS_PER_PAGE

  if (endPage > count) {
    endPage = count
  }

  const searchData = useCallback(async () => {


    const data = await getAllResource({
      resource,
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

    setData(data.resource)
    setCount(data.count)

  }, [pathname, router, searchParams])


  useEffect(() => {
    searchData()
  }, [searchData, router, searchParams])

  const schemaColumns = schema.map((s, i) => {
    return {
      accessorKey: s.accessorKey,
      id: s.id,
      cell: (info: any) => {
        return (
          <p>{info.getValue()}</p>
        )
      }
    }
  })

  let columns = [
    {
      accessorKey: 'id',
      id: 'id',
      cell: (info: any) => {
        return (
          <Link
            href={`/admin/${resource}/${info.getValue()}`}
            className="text-link"
          >
            {info.getValue()}
          </Link>
        )
      }
    },
    {
      accessorKey: 'userId',
      id: 'User',
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
    ...schemaColumns
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
        pathname: `/admin/${resource}`,
        searchParams: JSON.parse(searchQuery as string)
      }}
      onNavigate={(url) => {  router.push(url) }}
    />
  )
}

export default ResourceTable
