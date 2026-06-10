import "server-only"

import { cache } from "react"

import { fetchArtificialAnalysisModels } from "@/lib/data/fetch-artificial-analysis"
import { fetchModelsDevCatalog } from "@/lib/data/fetch-models-dev"
import {
  buildIntelligenceLookup,
  matchIntelligenceScores,
} from "@/lib/intelligence-matching"
import type { LlmModel } from "@/lib/types/llm-model"

function enrichModelsWithIntelligence(
  models: LlmModel[],
  lookup: ReturnType<typeof buildIntelligenceLookup>
): LlmModel[] {
  return models.map((model) => {
    const scores = matchIntelligenceScores(model.id, lookup)
    if (!scores) return model

    return {
      ...model,
      intelligenceIndex: scores.intelligenceIndex,
      codingIndex: scores.codingIndex,
      agenticIndex: scores.agenticIndex,
      intelligenceIndexVersion: scores.intelligenceIndexVersion,
      aaSlug: scores.aaSlug,
    }
  })
}

async function loadLlmModels(): Promise<LlmModel[]> {
  const [catalogResult, intelligenceResult] = await Promise.allSettled([
    fetchModelsDevCatalog(),
    fetchArtificialAnalysisModels(),
  ])

  if (catalogResult.status === "rejected") {
    throw catalogResult.reason
  }

  const models = catalogResult.value

  if (intelligenceResult.status === "rejected") {
    console.error(
      "Failed to fetch Artificial Analysis intelligence data:",
      intelligenceResult.reason
    )
    return models
  }

  const lookup = buildIntelligenceLookup(
    intelligenceResult.value.models,
    intelligenceResult.value.intelligenceIndexVersion
  )

  return enrichModelsWithIntelligence(models, lookup)
}

export const getLlmModels = cache(loadLlmModels)
