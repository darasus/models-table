"use client"

import { ColumnDef } from "@tanstack/react-table"
import { ExternalLink, MoreHorizontal } from "lucide-react"

import { DataTableColumnHeader } from "@/components/data-table-column-header"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  formatDate,
  formatLab,
  formatPrice,
  formatScore,
  formatTokens,
} from "@/lib/format"
import type { LlmModel } from "@/lib/types/llm-model"

function IntelligenceBadge({ score }: { score: number | null }) {
  if (score === null) {
    return <span className="text-muted-foreground">—</span>
  }

  return (
    <span className="font-medium tabular-nums">{formatScore(score)}</span>
  )
}

function CapabilityBadge({ enabled, label }: { enabled: boolean; label: string }) {
  return (
    <Badge variant={enabled ? "secondary" : "outline"} className="font-normal">
      {enabled ? label : "—"}
    </Badge>
  )
}

export const modelsTableColumns: ColumnDef<LlmModel>[] = [
  {
    accessorKey: "name",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Model" />
    ),
    cell: ({ row }) => {
      const model = row.original
      return (
        <div className="flex min-w-[220px] flex-col gap-0.5">
          <span className="font-medium">{model.name}</span>
          <span className="font-mono text-xs text-muted-foreground">
            {model.id}
          </span>
        </div>
      )
    },
  },
  {
    accessorKey: "intelligenceIndex",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Intelligence" />
    ),
    cell: ({ row }) => (
      <div className="text-right">
        <IntelligenceBadge score={row.getValue("intelligenceIndex")} />
      </div>
    ),
  },
  {
    accessorKey: "codingIndex",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Coding" />
    ),
    cell: ({ row }) => (
      <div className="text-right tabular-nums">
        {formatScore(row.getValue("codingIndex"))}
      </div>
    ),
  },
  {
    accessorKey: "agenticIndex",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Agentic" />
    ),
    cell: ({ row }) => (
      <div className="text-right tabular-nums">
        {formatScore(row.getValue("agenticIndex"))}
      </div>
    ),
  },
  {
    accessorKey: "lab",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Lab" />
    ),
    cell: ({ row }) => (
      <Badge variant="outline">{formatLab(row.getValue("lab"))}</Badge>
    ),
    filterFn: (row, id, value) => {
      return value.includes(row.getValue(id))
    },
  },
  {
    accessorKey: "providers",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Providers" />
    ),
    cell: ({ row }) => (
      <div className="text-right tabular-nums">{row.getValue("providers")}</div>
    ),
  },
  {
    accessorKey: "context",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Context" />
    ),
    cell: ({ row }) => (
      <div className="text-right tabular-nums">
        {formatTokens(row.getValue("context"))}
      </div>
    ),
  },
  {
    accessorKey: "output",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Output" />
    ),
    cell: ({ row }) => (
      <div className="text-right tabular-nums">
        {formatTokens(row.getValue("output"))}
      </div>
    ),
  },
  {
    accessorKey: "inputModalities",
    header: "Input",
    cell: ({ row }) => {
      const modalities = row.getValue("inputModalities") as string[]
      if (modalities.length === 0) return "—"
      return (
        <div className="flex flex-nowrap items-center gap-1">
          {modalities.map((modality) => (
            <Badge
              key={modality}
              variant="outline"
              className="shrink-0 font-normal"
            >
              {modality}
            </Badge>
          ))}
        </div>
      )
    },
    enableSorting: false,
  },
  {
    accessorKey: "reasoning",
    header: "Reasoning",
    cell: ({ row }) => (
      <CapabilityBadge enabled={row.getValue("reasoning")} label="Yes" />
    ),
    enableSorting: false,
  },
  {
    accessorKey: "toolCall",
    header: "Tools",
    cell: ({ row }) => (
      <CapabilityBadge enabled={row.getValue("toolCall")} label="Yes" />
    ),
    enableSorting: false,
  },
  {
    accessorKey: "structuredOutput",
    header: "Structured",
    cell: ({ row }) => (
      <CapabilityBadge
        enabled={row.getValue("structuredOutput")}
        label="Yes"
      />
    ),
    enableSorting: false,
  },
  {
    accessorKey: "openWeights",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Weights" />
    ),
    cell: ({ row }) => (
      <Badge variant={row.getValue("openWeights") ? "secondary" : "outline"}>
        {row.getValue("openWeights") ? "Open" : "Closed"}
      </Badge>
    ),
  },
  {
    id: "price",
    accessorFn: (row) => row.inputPrice,
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Price / 1M" />
    ),
    cell: ({ row }) => {
      const model = row.original
      if (model.inputPrice === null && model.outputPrice === null) {
        return "—"
      }
      return (
        <div className="font-mono text-xs tabular-nums">
          <span>{formatPrice(model.inputPrice)}</span>
          <span className="text-muted-foreground"> / </span>
          <span>{formatPrice(model.outputPrice)}</span>
        </div>
      )
    },
  },
  {
    accessorKey: "releaseDate",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Release" />
    ),
    cell: ({ row }) => formatDate(row.getValue("releaseDate")),
  },
  {
    accessorKey: "lastUpdated",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Updated" />
    ),
    cell: ({ row }) => formatDate(row.getValue("lastUpdated")),
  },
  {
    id: "actions",
    cell: ({ row }) => {
      const model = row.original

      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <span className="sr-only">Open menu</span>
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Actions</DropdownMenuLabel>
            <DropdownMenuItem
              onClick={() => navigator.clipboard.writeText(model.id)}
            >
              Copy model ID
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            {model.aaSlug ? (
              <DropdownMenuItem asChild>
                <a
                  href={`https://artificialanalysis.ai/models/${model.aaSlug}`}
                  target="_blank"
                  rel="noreferrer"
                >
                  <ExternalLink className="mr-2 h-4 w-4" />
                  View on Artificial Analysis
                </a>
              </DropdownMenuItem>
            ) : null}
            <DropdownMenuItem asChild>
              <a
                href={`https://models.dev/model/${model.id}`}
                target="_blank"
                rel="noreferrer"
              >
                <ExternalLink className="mr-2 h-4 w-4" />
                View on models.dev
              </a>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      )
    },
  },
]
