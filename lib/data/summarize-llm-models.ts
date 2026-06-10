import "server-only"

import type { LlmModel, LlmModelsSummary } from "@/lib/types/llm-model"

export function summarizeLlmModels(models: LlmModel[]): LlmModelsSummary {
  return {
    total: models.length,
    withIntelligence: models.filter((model) => model.intelligenceIndex !== null)
      .length,
    indexVersion:
      models.find((model) => model.intelligenceIndexVersion !== null)
        ?.intelligenceIndexVersion ?? null,
    hasApiKey: Boolean(process.env.ARTIFICIAL_ANALYSIS_API_KEY),
  }
}
