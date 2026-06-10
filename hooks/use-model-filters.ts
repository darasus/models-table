"use client"

import {
  parseAsArrayOf,
  parseAsFloat,
  parseAsString,
  parseAsStringEnum,
  useQueryStates,
} from "nuqs"

import {
  CAPABILITY_FILTERS,
  countActiveFilters,
  EMPTY_MODEL_FILTERS,
  type CapabilityFilter,
  type ModelFilters,
  type WeightFilter,
  WEIGHT_FILTERS,
} from "@/lib/filter-models"

const filterParsers = {
  lab: parseAsArrayOf(parseAsString).withDefault([]),
  modality: parseAsArrayOf(parseAsString).withDefault([]),
  capability: parseAsArrayOf(
    parseAsStringEnum([...CAPABILITY_FILTERS])
  ).withDefault([]),
  weight: parseAsArrayOf(parseAsStringEnum([...WEIGHT_FILTERS])).withDefault(
    []
  ),
  provider: parseAsArrayOf(parseAsString).withDefault([]),
  providersMin: parseAsFloat,
  providersMax: parseAsFloat,
  intelligenceMin: parseAsFloat,
  intelligenceMax: parseAsFloat,
  codingMin: parseAsFloat,
  codingMax: parseAsFloat,
  agenticMin: parseAsFloat,
  agenticMax: parseAsFloat,
  contextMin: parseAsFloat,
  contextMax: parseAsFloat,
  outputMin: parseAsFloat,
  outputMax: parseAsFloat,
  inputPriceMin: parseAsFloat,
  inputPriceMax: parseAsFloat,
  outputPriceMin: parseAsFloat,
  outputPriceMax: parseAsFloat,
  releaseMin: parseAsString,
  releaseMax: parseAsString,
  updatedMin: parseAsString,
  updatedMax: parseAsString,
} as const

const filterOptions = {
  history: "replace" as const,
  shallow: true,
  throttleMs: 300,
}

function toModelFilters(state: {
  lab: string[]
  modality: string[]
  capability: CapabilityFilter[]
  weight: WeightFilter[]
  provider: string[]
  providersMin: number | null
  providersMax: number | null
  intelligenceMin: number | null
  intelligenceMax: number | null
  codingMin: number | null
  codingMax: number | null
  agenticMin: number | null
  agenticMax: number | null
  contextMin: number | null
  contextMax: number | null
  outputMin: number | null
  outputMax: number | null
  inputPriceMin: number | null
  inputPriceMax: number | null
  outputPriceMin: number | null
  outputPriceMax: number | null
  releaseMin: string | null
  releaseMax: string | null
  updatedMin: string | null
  updatedMax: string | null
}): ModelFilters {
  return {
    labs: state.lab,
    modalities: state.modality,
    capabilities: state.capability,
    weights: state.weight,
    providers: state.provider,
    providersMin: state.providersMin,
    providersMax: state.providersMax,
    intelligenceMin: state.intelligenceMin,
    intelligenceMax: state.intelligenceMax,
    codingMin: state.codingMin,
    codingMax: state.codingMax,
    agenticMin: state.agenticMin,
    agenticMax: state.agenticMax,
    contextMin: state.contextMin,
    contextMax: state.contextMax,
    outputMin: state.outputMin,
    outputMax: state.outputMax,
    inputPriceMin: state.inputPriceMin,
    inputPriceMax: state.inputPriceMax,
    outputPriceMin: state.outputPriceMin,
    outputPriceMax: state.outputPriceMax,
    releaseDateMin: state.releaseMin,
    releaseDateMax: state.releaseMax,
    lastUpdatedMin: state.updatedMin,
    lastUpdatedMax: state.updatedMax,
  }
}

function fromModelFilters(filters: ModelFilters) {
  return {
    lab: filters.labs,
    modality: filters.modalities,
    capability: filters.capabilities,
    weight: filters.weights,
    provider: filters.providers,
    providersMin: filters.providersMin,
    providersMax: filters.providersMax,
    intelligenceMin: filters.intelligenceMin,
    intelligenceMax: filters.intelligenceMax,
    codingMin: filters.codingMin,
    codingMax: filters.codingMax,
    agenticMin: filters.agenticMin,
    agenticMax: filters.agenticMax,
    contextMin: filters.contextMin,
    contextMax: filters.contextMax,
    outputMin: filters.outputMin,
    outputMax: filters.outputMax,
    inputPriceMin: filters.inputPriceMin,
    inputPriceMax: filters.inputPriceMax,
    outputPriceMin: filters.outputPriceMin,
    outputPriceMax: filters.outputPriceMax,
    releaseMin: filters.releaseDateMin,
    releaseMax: filters.releaseDateMax,
    updatedMin: filters.lastUpdatedMin,
    updatedMax: filters.lastUpdatedMax,
  }
}

export function useModelFilters() {
  const [state, setState] = useQueryStates(filterParsers, filterOptions)
  const filters = toModelFilters(state)
  const activeCount = countActiveFilters(filters)

  const setFilters = (next: Partial<ModelFilters>) => {
    void setState(fromModelFilters({ ...filters, ...next }))
  }

  const resetFilters = () => {
    void setState(fromModelFilters(EMPTY_MODEL_FILTERS))
  }

  return {
    filters,
    setFilters,
    resetFilters,
    activeCount,
  }
}
