"use client"

import * as React from "react"
import { Check, ListFilter, X } from "lucide-react"

import { DataTableFacetedFilter } from "@/components/data-table-faceted-filter"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command"
import { Input } from "@/components/ui/input"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { Separator } from "@/components/ui/separator"
import {
  CAPABILITY_FILTERS,
  CAPABILITY_LABELS,
  getUniqueLabs,
  getUniqueModalities,
  getUniqueProviders,
  WEIGHT_FILTERS,
  WEIGHT_LABELS,
  type ModelFilters,
} from "@/lib/filter-models"
import { formatLab } from "@/lib/format"
import type { LlmModel } from "@/lib/types/llm-model"
import { cn } from "@/lib/utils"

type ModelsTableFiltersProps = {
  data: LlmModel[]
  filters: ModelFilters
  onFiltersChange: (filters: Partial<ModelFilters>) => void
  onReset: () => void
  activeCount: number
}

type RangeFilterProps = {
  label: string
  min: number | null
  max: number | null
  onMinChange: (value: number | null) => void
  onMaxChange: (value: number | null) => void
  step?: string
}

function RangeFilter({
  label,
  min,
  max,
  onMinChange,
  onMaxChange,
  step = "any",
}: RangeFilterProps) {
  return (
    <div className="space-y-2">
      <p className="text-sm font-medium">{label}</p>
      <div className="grid grid-cols-2 gap-2">
        <Input
          type="number"
          inputMode="decimal"
          step={step}
          placeholder="Min"
          value={min ?? ""}
          onChange={(event) => {
            const value = event.target.value
            onMinChange(value === "" ? null : Number(value))
          }}
        />
        <Input
          type="number"
          inputMode="decimal"
          step={step}
          placeholder="Max"
          value={max ?? ""}
          onChange={(event) => {
            const value = event.target.value
            onMaxChange(value === "" ? null : Number(value))
          }}
        />
      </div>
    </div>
  )
}

type DateRangeFilterProps = {
  label: string
  min: string | null
  max: string | null
  onMinChange: (value: string | null) => void
  onMaxChange: (value: string | null) => void
}

function DateRangeFilter({
  label,
  min,
  max,
  onMinChange,
  onMaxChange,
}: DateRangeFilterProps) {
  return (
    <div className="space-y-2">
      <p className="text-sm font-medium">{label}</p>
      <div className="grid grid-cols-2 gap-2">
        <Input
          type="date"
          value={min ?? ""}
          onChange={(event) => {
            const value = event.target.value
            onMinChange(value === "" ? null : value)
          }}
        />
        <Input
          type="date"
          value={max ?? ""}
          onChange={(event) => {
            const value = event.target.value
            onMaxChange(value === "" ? null : value)
          }}
        />
      </div>
    </div>
  )
}

function countByValue<T>(
  items: T[],
  getValue: (item: T) => string | string[] | boolean
) {
  const counts = new Map<string, number>()

  for (const item of items) {
    const value = getValue(item)
    if (Array.isArray(value)) {
      for (const entry of value) {
        counts.set(entry, (counts.get(entry) ?? 0) + 1)
      }
    } else if (typeof value === "boolean") {
      const key = value ? "true" : "false"
      counts.set(key, (counts.get(key) ?? 0) + 1)
    } else {
      counts.set(value, (counts.get(value) ?? 0) + 1)
    }
  }

  return counts
}

export function ModelsTableFilters({
  data,
  filters,
  onFiltersChange,
  onReset,
  activeCount,
}: ModelsTableFiltersProps) {
  const labs = getUniqueLabs(data)
  const modalities = getUniqueModalities(data)
  const providers = getUniqueProviders(data)

  const labCounts = countByValue(data, (model) => model.lab)
  const modalityCounts = countByValue(data, (model) => model.inputModalities)
  const providerCounts = countByValue(data, (model) => model.providerNames)

  const capabilityCounts = React.useMemo(() => {
    const counts = new Map<string, number>()
    for (const capability of CAPABILITY_FILTERS) {
      counts.set(
        capability,
        data.filter((model) => model[capability]).length
      )
    }
    return counts
  }, [data])

  const weightCounts = React.useMemo(() => {
    return {
      open: data.filter((model) => model.openWeights).length,
      closed: data.filter((model) => !model.openWeights).length,
    }
  }, [data])

  const advancedActiveCount =
    activeCount -
    (filters.labs.length > 0 ? 1 : 0) -
    (filters.modalities.length > 0 ? 1 : 0) -
    (filters.capabilities.length > 0 ? 1 : 0) -
    (filters.weights.length > 0 ? 1 : 0)

  return (
    <div className="flex flex-wrap items-center gap-2">
      <DataTableFacetedFilter
        title="Lab"
        value={filters.labs}
        onChange={(labs) => onFiltersChange({ labs })}
        options={labs.map((lab) => ({
          label: formatLab(lab),
          value: lab,
          count: labCounts.get(lab),
        }))}
      />
      <DataTableFacetedFilter
        title="Modalities"
        value={filters.modalities}
        onChange={(modalities) => onFiltersChange({ modalities })}
        options={modalities.map((modality) => ({
          label: modality,
          value: modality,
          count: modalityCounts.get(modality),
        }))}
      />
      <DataTableFacetedFilter
        title="Capabilities"
        value={filters.capabilities}
        onChange={(capabilities) =>
          onFiltersChange({
            capabilities: capabilities as ModelFilters["capabilities"],
          })
        }
        options={CAPABILITY_FILTERS.map((capability) => ({
          label: CAPABILITY_LABELS[capability],
          value: capability,
          count: capabilityCounts.get(capability),
        }))}
      />
      <DataTableFacetedFilter
        title="Weights"
        value={filters.weights}
        onChange={(weights) =>
          onFiltersChange({ weights: weights as ModelFilters["weights"] })
        }
        options={WEIGHT_FILTERS.map((weight) => ({
          label: WEIGHT_LABELS[weight],
          value: weight,
          count: weightCounts[weight],
        }))}
      />

      <Popover>
        <PopoverTrigger asChild>
          <Button variant="outline" size="sm" className="h-8 border-dashed">
            <ListFilter className="mr-2 h-4 w-4" />
            All filters
            {advancedActiveCount > 0 ? (
              <>
                <Separator orientation="vertical" className="mx-2 h-4" />
                <Badge
                  variant="secondary"
                  className="rounded-sm px-1 font-normal"
                >
                  {advancedActiveCount}
                </Badge>
              </>
            ) : null}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[360px] p-0" align="start">
          <div className="max-h-[min(70vh,560px)] overflow-y-auto p-4">
            <div className="space-y-4">
              <div className="space-y-2">
                <p className="text-sm font-medium">Providers</p>
                <Command className="rounded-md border">
                  <CommandInput placeholder="Search providers..." />
                  <CommandList className="max-h-40">
                    <CommandEmpty>No providers found.</CommandEmpty>
                    <CommandGroup>
                      {providers.map((provider) => {
                        const isSelected = filters.providers.includes(provider)

                        return (
                          <CommandItem
                            key={provider}
                            onSelect={() => {
                              const next = new Set(filters.providers)
                              if (isSelected) {
                                next.delete(provider)
                              } else {
                                next.add(provider)
                              }
                              onFiltersChange({ providers: [...next] })
                            }}
                          >
                            <div
                              className={cn(
                                "mr-2 flex h-4 w-4 items-center justify-center rounded-sm border border-primary",
                                isSelected
                                  ? "bg-primary text-primary-foreground"
                                  : "opacity-50 [&_svg]:invisible"
                              )}
                            >
                              <Check className="h-3 w-3" />
                            </div>
                            <span className="truncate">{provider}</span>
                            <span className="ml-auto font-mono text-xs">
                              {providerCounts.get(provider)}
                            </span>
                          </CommandItem>
                        )
                      })}
                    </CommandGroup>
                  </CommandList>
                </Command>
              </div>

              <RangeFilter
                label="Provider count"
                min={filters.providersMin}
                max={filters.providersMax}
                onMinChange={(providersMin) =>
                  onFiltersChange({ providersMin })
                }
                onMaxChange={(providersMax) =>
                  onFiltersChange({ providersMax })
                }
                step="1"
              />

              <RangeFilter
                label="Intelligence index"
                min={filters.intelligenceMin}
                max={filters.intelligenceMax}
                onMinChange={(intelligenceMin) =>
                  onFiltersChange({ intelligenceMin })
                }
                onMaxChange={(intelligenceMax) =>
                  onFiltersChange({ intelligenceMax })
                }
              />
              <RangeFilter
                label="Coding index"
                min={filters.codingMin}
                max={filters.codingMax}
                onMinChange={(codingMin) => onFiltersChange({ codingMin })}
                onMaxChange={(codingMax) => onFiltersChange({ codingMax })}
              />
              <RangeFilter
                label="Agentic index"
                min={filters.agenticMin}
                max={filters.agenticMax}
                onMinChange={(agenticMin) => onFiltersChange({ agenticMin })}
                onMaxChange={(agenticMax) => onFiltersChange({ agenticMax })}
              />

              <RangeFilter
                label="Context tokens"
                min={filters.contextMin}
                max={filters.contextMax}
                onMinChange={(contextMin) => onFiltersChange({ contextMin })}
                onMaxChange={(contextMax) => onFiltersChange({ contextMax })}
                step="1"
              />
              <RangeFilter
                label="Output tokens"
                min={filters.outputMin}
                max={filters.outputMax}
                onMinChange={(outputMin) => onFiltersChange({ outputMin })}
                onMaxChange={(outputMax) => onFiltersChange({ outputMax })}
                step="1"
              />

              <RangeFilter
                label="Input price / 1M"
                min={filters.inputPriceMin}
                max={filters.inputPriceMax}
                onMinChange={(inputPriceMin) =>
                  onFiltersChange({ inputPriceMin })
                }
                onMaxChange={(inputPriceMax) =>
                  onFiltersChange({ inputPriceMax })
                }
              />
              <RangeFilter
                label="Output price / 1M"
                min={filters.outputPriceMin}
                max={filters.outputPriceMax}
                onMinChange={(outputPriceMin) =>
                  onFiltersChange({ outputPriceMin })
                }
                onMaxChange={(outputPriceMax) =>
                  onFiltersChange({ outputPriceMax })
                }
              />

              <DateRangeFilter
                label="Release date"
                min={filters.releaseDateMin}
                max={filters.releaseDateMax}
                onMinChange={(releaseDateMin) =>
                  onFiltersChange({ releaseDateMin })
                }
                onMaxChange={(releaseDateMax) =>
                  onFiltersChange({ releaseDateMax })
                }
              />
              <DateRangeFilter
                label="Last updated"
                min={filters.lastUpdatedMin}
                max={filters.lastUpdatedMax}
                onMinChange={(lastUpdatedMin) =>
                  onFiltersChange({ lastUpdatedMin })
                }
                onMaxChange={(lastUpdatedMax) =>
                  onFiltersChange({ lastUpdatedMax })
                }
              />
            </div>
          </div>
        </PopoverContent>
      </Popover>

      {activeCount > 0 ? (
        <Button
          variant="ghost"
          size="sm"
          className="h-8 px-2"
          onClick={onReset}
        >
          Reset
          <X className="ml-2 h-4 w-4" />
        </Button>
      ) : null}
    </div>
  )
}
