import type { LlmModel } from "@/lib/types/llm-model"

export const CAPABILITY_FILTERS = [
  "reasoning",
  "toolCall",
  "structuredOutput",
  "attachment",
] as const

export type CapabilityFilter = (typeof CAPABILITY_FILTERS)[number]

export const WEIGHT_FILTERS = ["open", "closed"] as const

export type WeightFilter = (typeof WEIGHT_FILTERS)[number]

export type ModelFilters = {
  labs: string[]
  modalities: string[]
  capabilities: CapabilityFilter[]
  weights: WeightFilter[]
  providers: string[]
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
  releaseDateMin: string | null
  releaseDateMax: string | null
  lastUpdatedMin: string | null
  lastUpdatedMax: string | null
}

export const EMPTY_MODEL_FILTERS: ModelFilters = {
  labs: [],
  modalities: [],
  capabilities: [],
  weights: [],
  providers: [],
  providersMin: null,
  providersMax: null,
  intelligenceMin: null,
  intelligenceMax: null,
  codingMin: null,
  codingMax: null,
  agenticMin: null,
  agenticMax: null,
  contextMin: null,
  contextMax: null,
  outputMin: null,
  outputMax: null,
  inputPriceMin: null,
  inputPriceMax: null,
  outputPriceMin: null,
  outputPriceMax: null,
  releaseDateMin: null,
  releaseDateMax: null,
  lastUpdatedMin: null,
  lastUpdatedMax: null,
}

function matchesNumericRange(
  value: number | null,
  min: number | null,
  max: number | null
) {
  if (min === null && max === null) return true
  if (value === null) return false
  if (min !== null && value < min) return false
  if (max !== null && value > max) return false
  return true
}

function matchesDateRange(
  value: string | null,
  min: string | null,
  max: string | null
) {
  if (!min && !max) return true
  if (!value) return false
  if (min && value < min) return false
  if (max && value > max) return false
  return true
}

function modelHasCapability(model: LlmModel, capability: CapabilityFilter) {
  return model[capability]
}

function modelMatchesWeight(model: LlmModel, weight: WeightFilter) {
  return weight === "open" ? model.openWeights : !model.openWeights
}

export function matchesModelFilters(model: LlmModel, filters: ModelFilters) {
  if (filters.labs.length > 0 && !filters.labs.includes(model.lab)) {
    return false
  }

  if (
    filters.modalities.length > 0 &&
    !filters.modalities.some((modality) =>
      model.inputModalities.includes(modality)
    )
  ) {
    return false
  }

  if (
    filters.capabilities.length > 0 &&
    !filters.capabilities.every((capability) =>
      modelHasCapability(model, capability)
    )
  ) {
    return false
  }

  if (
    filters.weights.length > 0 &&
    !filters.weights.some((weight) => modelMatchesWeight(model, weight))
  ) {
    return false
  }

  if (
    filters.providers.length > 0 &&
    !filters.providers.some((provider) => model.providerNames.includes(provider))
  ) {
    return false
  }

  if (
    !matchesNumericRange(
      model.providers,
      filters.providersMin,
      filters.providersMax
    )
  ) {
    return false
  }

  if (
    !matchesNumericRange(
      model.intelligenceIndex,
      filters.intelligenceMin,
      filters.intelligenceMax
    )
  ) {
    return false
  }

  if (
    !matchesNumericRange(model.codingIndex, filters.codingMin, filters.codingMax)
  ) {
    return false
  }

  if (
    !matchesNumericRange(
      model.agenticIndex,
      filters.agenticMin,
      filters.agenticMax
    )
  ) {
    return false
  }

  if (
    !matchesNumericRange(model.context, filters.contextMin, filters.contextMax)
  ) {
    return false
  }

  if (!matchesNumericRange(model.output, filters.outputMin, filters.outputMax)) {
    return false
  }

  if (
    !matchesNumericRange(
      model.inputPrice,
      filters.inputPriceMin,
      filters.inputPriceMax
    )
  ) {
    return false
  }

  if (
    !matchesNumericRange(
      model.outputPrice,
      filters.outputPriceMin,
      filters.outputPriceMax
    )
  ) {
    return false
  }

  if (
    !matchesDateRange(
      model.releaseDate,
      filters.releaseDateMin,
      filters.releaseDateMax
    )
  ) {
    return false
  }

  if (
    !matchesDateRange(
      model.lastUpdated,
      filters.lastUpdatedMin,
      filters.lastUpdatedMax
    )
  ) {
    return false
  }

  return true
}

export function filterModels(models: LlmModel[], filters: ModelFilters) {
  return models.filter((model) => matchesModelFilters(model, filters))
}

export function countActiveFilters(filters: ModelFilters) {
  let count = 0

  if (filters.labs.length > 0) count += 1
  if (filters.modalities.length > 0) count += 1
  if (filters.capabilities.length > 0) count += 1
  if (filters.weights.length > 0) count += 1
  if (filters.providers.length > 0) count += 1

  const numericFields: Array<keyof ModelFilters> = [
    "providersMin",
    "providersMax",
    "intelligenceMin",
    "intelligenceMax",
    "codingMin",
    "codingMax",
    "agenticMin",
    "agenticMax",
    "contextMin",
    "contextMax",
    "outputMin",
    "outputMax",
    "inputPriceMin",
    "inputPriceMax",
    "outputPriceMin",
    "outputPriceMax",
  ]

  for (const field of numericFields) {
    if (filters[field] !== null) count += 1
  }

  const dateFields: Array<keyof ModelFilters> = [
    "releaseDateMin",
    "releaseDateMax",
    "lastUpdatedMin",
    "lastUpdatedMax",
  ]

  for (const field of dateFields) {
    if (filters[field]) count += 1
  }

  return count
}

export function getUniqueLabs(models: LlmModel[]) {
  return [...new Set(models.map((model) => model.lab))].sort()
}

export function getUniqueModalities(models: LlmModel[]) {
  return [
    ...new Set(models.flatMap((model) => model.inputModalities)),
  ].sort()
}

export function getUniqueProviders(models: LlmModel[]) {
  return [
    ...new Set(models.flatMap((model) => model.providerNames)),
  ].sort()
}

export const CAPABILITY_LABELS: Record<CapabilityFilter, string> = {
  reasoning: "Reasoning",
  toolCall: "Tools",
  structuredOutput: "Structured",
  attachment: "Attachment",
}

export const WEIGHT_LABELS: Record<WeightFilter, string> = {
  open: "Open",
  closed: "Closed",
}
