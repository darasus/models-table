"use client"

import * as React from "react"
import {
  SortingState,
  VisibilityState,
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table"
import { parseAsString, useQueryState } from "nuqs"

import { modelsTableColumns } from "@/components/models/models-table-columns"
import { DataTableViewOptions } from "@/components/data-table-view-options"
import { Input } from "@/components/ui/input"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { filterModelsForSearch } from "@/lib/search-models"
import type { LlmModel } from "@/lib/types/llm-model"
import { useLocalStorageState } from "@/hooks/use-local-storage-state"

type ModelsDataTableProps = {
  data: LlmModel[]
}

const COLUMN_VISIBILITY_KEY = "models-table-column-visibility"

const searchParser = parseAsString.withDefault("").withOptions({
  throttleMs: 300,
})

export function ModelsDataTable({ data }: ModelsDataTableProps) {
  const [sorting, setSorting] = React.useState<SortingState>([
    { id: "intelligenceIndex", desc: true },
  ])
  const [globalFilter, setGlobalFilter] = useQueryState("q", searchParser)
  const [columnVisibility, setColumnVisibility] =
    useLocalStorageState<VisibilityState>(COLUMN_VISIBILITY_KEY, {})

  const tableData = React.useMemo(
    () => filterModelsForSearch(data, globalFilter),
    [data, globalFilter]
  )

  const table = useReactTable({
    data: tableData,
    columns: modelsTableColumns,
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    onColumnVisibilityChange: setColumnVisibility,
    state: {
      sorting,
      columnVisibility,
    },
  })

  const filteredCount = table.getRowModel().rows.length

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Input
          placeholder="Search models and labs..."
          value={globalFilter}
          onChange={(event) => {
            const value = event.target.value
            void setGlobalFilter(value === "" ? null : value)
          }}
          className="max-w-sm"
        />
        <p className="text-sm text-muted-foreground">
          {filteredCount === data.length
            ? `${data.length} models`
            : `${filteredCount} of ${data.length} models`}
        </p>
        <DataTableViewOptions table={table} />
      </div>
      <div className="overflow-hidden rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead key={header.id}>
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow key={row.id}>
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={modelsTableColumns.length}
                  className="h-24 text-center"
                >
                  No results.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
