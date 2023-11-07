"use client"

import { usePathname, useRouter, useSearchParams } from "next/navigation"
import "regenerator-runtime/runtime"
import {useCallback, useMemo, useState} from "react"
import {
  type PaginationState,
  useReactTable,
  getCoreRowModel,
  flexRender,
  type ColumnDef,
} from '@tanstack/react-table'
import Debouncer from "../../lib/debouncer";
import { Button } from "../../components/ui/Button";



const Table = ({
  columns,
  data,
  pageCount: controlledPageCount,
  pageIndex: controlledPageIndex,
  pageSize: controlledPageSize,
  hasNext: controlledHasNext,
  hasPrevious: controlledHasPrevious,
  totalCount,
  startPage,
  endPage
}: {
  columns: ColumnDef<any, any>[],
  data: any[],
  pageCount: number,
  pageIndex: number,
  pageSize: number,
  hasNext: boolean,
  hasPrevious: boolean,
  totalCount: number,
  startPage: number,
  endPage: number
}) => {
  const router = useRouter()
  const pathname = usePathname();
  const searchParams = useSearchParams()
  
  const [{ pageIndex, pageSize }, setPagination] = useState<PaginationState>({
    pageIndex: controlledPageIndex,
    pageSize: controlledPageSize,
  })

  const pagination = useMemo(
    () => ({
      pageIndex,
      pageSize,
    }),
    [pageIndex, pageSize]
  )

  const table = useReactTable({
    data,
    columns,
    pageCount: controlledPageCount,
    state: {
      pagination,
    },
    onPaginationChange: setPagination,
    getCoreRowModel: getCoreRowModel(),
    manualPagination: true,
  })

  const createQueryString = useCallback(
    (name: string, value: string) => {
      const params = new URLSearchParams()
      params.set(name, value)
 
      return params.toString()
    },
    [searchParams]
  )

  const goToPreviousPage = () => {
    router.push(pathname + '?' + createQueryString('search', searchParams.get('search') || '') + '&' + createQueryString('page', `${controlledPageIndex - 1}`))
  }

  const goToNextPage = () => {
    router.push(pathname + '?' + createQueryString('search', searchParams.get('search') || '') + '&' + createQueryString('page', `${controlledPageIndex + 1}`))
  }


  

  const searchQuery = async (e: any) => {
    router.push(pathname + '?' + createQueryString('search', JSON.stringify(e.target.value) || '') + '&' + createQueryString('page', '0'))
  }

  const debouncer = new Debouncer((e) => searchQuery(e), 500)
  const execDebouncer = (e: any) => {
    e.persist()
    return debouncer.execute(e)
  }

  return (
    <div>
      <div className="flex mb-2">
        <input
          placeholder="Search"
          type="text"
          className="border border-gray-300 mr-2 lg:w-1/4 px-2 py-2 w-full rounded"
          onChange={async (e) => {
            execDebouncer(e)
          }}
        />
      </div>

      <div className="flex flex-col overflow-auto">
        <table className="table min-w-full border border-gray-200">
          <thead className="border-b border-gray-200">
            {table.getHeaderGroups().map((headerGroup, i) => (
              <tr key={i}>
                {headerGroup.headers.map((column, i) => (
                  <th
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase"
                    colSpan={column.colSpan}
                    key={i}
                  >
                    {flexRender(
                      column.column.columnDef.header,
                      column.getContext()
                    )}
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody>
          {table.getRowModel().rows.map(row => {
            return (
              <tr className="bg-white" key={row.id}>
                {row.getVisibleCells().map(cell => {
                  return (
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 border-b border-gray-200" key={cell.id}>
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </td>
                  )
                })}
              </tr>
            )
          })}
        </tbody>
        </table>
      </div>

      <nav className="flex items-center justify-between py-6" aria-label="Pagination">
        <div>
          <p className="text-sm text-gray-700">
            Showing <span className="font-medium">{startPage}</span> to{" "}
            <span className="font-medium">{endPage}</span> of{" "}
            <span className="font-medium">{totalCount}</span> results
          </p>
        </div>
        <div className="flex-1 flex justify-end">
          <Button
            disabled={!controlledHasPrevious}
            onClick={() => goToPreviousPage()}
          >
            Previous
          </Button>
          <Button
            className="ml-3"
            disabled={!controlledHasNext}
            onClick={() => goToNextPage()}
          >
            Next
          </Button>
        </div>
      </nav>
    </div>
  )
}

export default Table