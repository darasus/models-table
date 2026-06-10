import "server-only"

import type { LlmModel } from "@/lib/types/llm-model"

type ModelsDevCost = {
  input?: number
  output?: number
  reasoning?: number
  cache_read?: number
  cache_write?: number
}

type ModelsDevModel = {
  id: string
  name: string
  family?: string
  attachment?: boolean
  reasoning?: boolean
  tool_call?: boolean
  structured_output?: boolean
  temperature?: boolean
  knowledge?: string
  release_date?: string
  last_updated?: string
  open_weights?: boolean
  modalities?: {
    input?: string[]
    output?: string[]
  }
  limit?: {
    context?: number
    input?: number
    output?: number
  }
  cost?: ModelsDevCost
}

type ModelsDevProvider = {
  id: string
  name: string
  models?: Record<string, ModelsDevModel>
}

type ModelsDevCatalog = {
  models: Record<string, ModelsDevModel>
  providers: Record<string, ModelsDevProvider>
}

type ProviderStats = {
  count: number
  minInput: number | null
  minOutput: number | null
  names: string[]
}

function buildProviderStats(catalog: ModelsDevCatalog): Map<string, ProviderStats> {
  const stats = new Map<string, ProviderStats>()

  for (const provider of Object.values(catalog.providers)) {
    for (const model of Object.values(provider.models ?? {})) {
      const id = model.id
      if (!id) continue

      const current = stats.get(id) ?? {
        count: 0,
        minInput: null,
        minOutput: null,
        names: [],
      }

      current.count += 1

      for (const label of [provider.name, provider.id]) {
        if (label && !current.names.includes(label)) {
          current.names.push(label)
        }
      }

      if (model.cost?.input != null) {
        current.minInput =
          current.minInput === null
            ? model.cost.input
            : Math.min(current.minInput, model.cost.input)
      }

      if (model.cost?.output != null) {
        current.minOutput =
          current.minOutput === null
            ? model.cost.output
            : Math.min(current.minOutput, model.cost.output)
      }

      stats.set(id, current)
    }
  }

  return stats
}

function transformCatalog(catalog: ModelsDevCatalog): LlmModel[] {
  const providerStats = buildProviderStats(catalog)

  return Object.values(catalog.models)
    .map((model) => {
      const lab = model.id.split("/")[0] ?? "unknown"
      const pricing = providerStats.get(model.id) ?? {
        count: 0,
        minInput: null,
        minOutput: null,
        names: [],
      }

      return {
        id: model.id,
        name: model.name,
        lab,
        providers: pricing.count,
        providerNames: [...pricing.names].sort((a, b) => a.localeCompare(b)),
        context: model.limit?.context ?? null,
        output: model.limit?.output ?? null,
        inputModalities: model.modalities?.input ?? [],
        reasoning: model.reasoning ?? false,
        toolCall: model.tool_call ?? false,
        structuredOutput: model.structured_output ?? false,
        attachment: model.attachment ?? false,
        openWeights: model.open_weights ?? false,
        inputPrice: pricing.minInput,
        outputPrice: pricing.minOutput,
        releaseDate: model.release_date ?? null,
        lastUpdated: model.last_updated ?? null,
        intelligenceIndex: null,
        codingIndex: null,
        agenticIndex: null,
        intelligenceIndexVersion: null,
        aaSlug: null,
      }
    })
    .sort((a, b) => a.name.localeCompare(b.name))
}

export async function fetchModelsDevCatalog(): Promise<LlmModel[]> {
  const response = await fetch("https://models.dev/catalog.json", {
    cache: "no-store",
  })

  if (!response.ok) {
    throw new Error(`Failed to fetch models.dev catalog: ${response.status}`)
  }

  const catalog = (await response.json()) as ModelsDevCatalog
  return transformCatalog(catalog)
}
