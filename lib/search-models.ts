import { formatLab } from "@/lib/format"
import type { LlmModel } from "@/lib/types/llm-model"

export function matchesSearch(model: LlmModel, query: string) {
  const haystack = [model.name, model.id, model.lab, formatLab(model.lab)]
    .join(" ")
    .toLowerCase()

  return haystack.includes(query)
}

/** Higher score = more relevant (lab/id before name before formatted lab label). */
export function getSearchMatchScore(model: LlmModel, query: string) {
  const q = query.toLowerCase()

  if (model.lab === q || model.id.startsWith(`${q}/`)) return 100
  if (model.id.toLowerCase().includes(q)) return 80
  if (model.name.toLowerCase().includes(q)) return 60
  if (formatLab(model.lab).toLowerCase().includes(q)) return 40

  return 0
}

export function filterModelsForSearch(models: LlmModel[], query: string) {
  const normalized = query.trim().toLowerCase()
  if (!normalized) return models

  return models
    .filter((model) => matchesSearch(model, normalized))
    .sort((a, b) => {
      const scoreDiff =
        getSearchMatchScore(b, normalized) - getSearchMatchScore(a, normalized)
      if (scoreDiff !== 0) return scoreDiff

      return (b.intelligenceIndex ?? -Infinity) - (a.intelligenceIndex ?? -Infinity)
    })
}
