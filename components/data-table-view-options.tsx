"use client"

import { Table } from "@tanstack/react-table"
import { Settings2 } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

interface DataTableViewOptionsProps<TData> {
  table: Table<TData>
}

const columnLabels: Record<string, string> = {
  name: "Model",
  intelligenceIndex: "Intelligence",
  codingIndex: "Coding",
  agenticIndex: "Agentic",
  lab: "Lab",
  providers: "Providers",
  context: "Context",
  output: "Output",
  inputModalities: "Input",
  reasoning: "Reasoning",
  toolCall: "Tools",
  structuredOutput: "Structured",
  openWeights: "Weights",
  price: "Price / 1M",
  releaseDate: "Release",
  lastUpdated: "Updated",
}

function formatColumnLabel(columnId: string) {
  return (
    columnLabels[columnId] ??
    columnId.replace(/([A-Z])/g, " $1").replace(/^./, (char) => char.toUpperCase())
  )
}

export function DataTableViewOptions<TData>({
  table,
}: DataTableViewOptionsProps<TData>) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="ml-auto hidden h-8 lg:flex"
        >
          <Settings2 className="mr-2 h-4 w-4" />
          View
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-64">
        <DropdownMenuLabel>Toggle columns</DropdownMenuLabel>
        <DropdownMenuSeparator />
        {table
          .getAllColumns()
          .filter(
            (column) =>
              typeof column.accessorFn !== "undefined" && column.getCanHide()
          )
          .map((column) => {
            const label = formatColumnLabel(column.id)
            const isVisible = column.getIsVisible()

            return (
              <DropdownMenuItem
                key={column.id}
                className="gap-2"
                onSelect={(event) => event.preventDefault()}
                onClick={() => column.toggleVisibility(!isVisible)}
              >
                <Checkbox
                  checked={isVisible}
                  tabIndex={-1}
                  aria-hidden
                  className="pointer-events-none"
                />
                <span>{label}</span>
              </DropdownMenuItem>
            )
          })}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
