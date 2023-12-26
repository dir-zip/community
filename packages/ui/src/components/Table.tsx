import * as React from "react";
import {
  type PaginationState,
  useReactTable,
  getCoreRowModel,
  flexRender,
  type ColumnDef,
} from '@tanstack/react-table'
import { useMemo, useState } from "react";
import { Button } from "./Button";
import Debouncer from "../utils/debouncer";

function IndeterminateCheckbox({
  indeterminate,
  className = '',
  ...rest
}: { indeterminate?: boolean } & React.HTMLProps<HTMLInputElement>) {
  const ref = React.useRef<HTMLInputElement>(null!)

  React.useEffect(() => {
    if (typeof indeterminate === 'boolean') {
      ref.current.indeterminate = !rest.checked && indeterminate
    }
  }, [ref, indeterminate])

  return (
    <input
      type="checkbox"
      ref={ref}
      className={className + ' cursor-pointer'}
      {...rest}
    />
  )
}

export const Table = ({
  columns,
  data,
  pageCount: controlledPageCount,
  pageIndex: controlledPageIndex,
  pageSize: controlledPageSize,
  hasNext: controlledHasNext,
  hasPrevious: controlledHasPrevious,
  totalCount,
  startPage,
  endPage,
  routingContext,
  onNavigate,
  enableMultiSelect
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
  endPage: number,
  routingContext?: {
    pathname: string;
    searchParams: string | null
  },
  onNavigate?: (url: string) => void,
  enableMultiSelect?: boolean
}) => {



  const [{ pageIndex, pageSize }, setPagination] = useState<PaginationState>({
    pageIndex: controlledPageIndex,
    pageSize: controlledPageSize,
  })

  const [rowSelection, setRowSelection] = React.useState({})

  const pagination = useMemo(
    () => ({
      pageIndex,
      pageSize,
    }),
    [pageIndex, pageSize]
  )

  const createQueryString = (name: string, value: string) => {
    const params = new URLSearchParams()
    params.set(name, value)

    return params.toString()
  }


  const goToPreviousPage = () => {
    onNavigate?.(routingContext?.pathname + '?' + createQueryString('search', routingContext?.searchParams || '') + '&' + createQueryString('page', `${controlledPageIndex - 1}`))
  }

  const goToNextPage = () => {
    onNavigate?.(routingContext?.pathname + '?' + createQueryString('search', routingContext?.searchParams || '') + '&' + createQueryString('page', `${controlledPageIndex + 1}`))
  }

  const searchQuery = async (e: any) => {
    onNavigate?.(routingContext?.pathname + '?' + createQueryString('search', JSON.stringify(e.target.value) || '') + '&' + createQueryString('page', '0'))
  }

  const debouncer = new Debouncer((e) => searchQuery(e), 500)
  const execDebouncer = (e: any) => {
    e.persist()
    return debouncer.execute(e)
  }

  const table = useReactTable({
    data,
    columns: enableMultiSelect
    ? [
        {
          id: 'select',
          header: ({ table }) => (
            <IndeterminateCheckbox
              {...{
                checked: table.getIsAllRowsSelected(),
                indeterminate: table.getIsSomeRowsSelected(),
                onChange: table.getToggleAllRowsSelectedHandler(),
              }}
            />
          ),
          cell: ({ row }) => (
            <IndeterminateCheckbox
              {...{
                checked: row.getIsSelected(),
                disabled: !row.getCanSelect(),
                indeterminate: row.getIsSomeSelected(),
                onChange: row.getToggleSelectedHandler(),
              }}
            />
          ),
        },
        ...columns,
      ]
    : columns,
    pageCount: controlledPageCount,
    state: {
      pagination,
      rowSelection
    },
    onPaginationChange: setPagination,
    getCoreRowModel: getCoreRowModel(),
    manualPagination: true,
    enableRowSelection: enableMultiSelect,
    onRowSelectionChange: setRowSelection,
  })


  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <input
          placeholder="Search"
          type="text"
          className="border border-gray-300 mr-2 lg:w-1/4 px-2 py-2 w-full rounded"
          onChange={async (e) => {
            execDebouncer(e)
          }}
        />

      { enableMultiSelect ? <div>
          {Object.keys(rowSelection).length} of{' '}
          {table.getPreFilteredRowModel().rows.length} Total Rows Selected
        </div> : null }
      </div>

      <div className="flex flex-col bg-primary overflow-auto border rounded-tl rounded-tr border-b-0">
        <table className="table min-w-full">
          <thead className="bg-primary-900 border-b">
            {table.getHeaderGroups().map((headerGroup, i) => (
              <tr key={i}>
                {headerGroup.headers.map((column, i) => (
                  <th
                    className="px-6 py-3 text-left text-sm font-medium text-foreground capitalize"
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
              <tr className="bg-primary-300" key={row.id}>
                {row.getVisibleCells().map(cell => {
                  return (
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-foreground border-b border-primary-200" key={cell.id}>
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


      <nav className="flex items-center justify-between px-2 py-1 bg-primary-900 rounded-bl rounded-br border border-t-0" aria-label="Pagination">
        <div>
          <p className="text-sm text-primary-100">
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
