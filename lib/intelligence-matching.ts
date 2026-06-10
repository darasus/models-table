export type IntelligenceScores = {
  intelligenceIndex: number | null
  codingIndex: number | null
  agenticIndex: number | null
  intelligenceIndexVersion: number
  aaSlug: string
  aaName: string
}

export type ArtificialAnalysisEvaluations = {
  artificial_analysis_intelligence_index?: number | null
  artificial_analysis_coding_index?: number | null
  artificial_analysis_agentic_index?: number | null
}

export type ArtificialAnalysisModel = {
  id: string
  name: string
  slug: string
  release_date?: string | null
  model_creator: {
    id: string
    name: string
  }
  evaluations: ArtificialAnalysisEvaluations
}

function modelsDevSlug(modelsDevId: string): string {
  const slashIndex = modelsDevId.indexOf("/")
  return slashIndex === -1 ? modelsDevId : modelsDevId.slice(slashIndex + 1)
}

function toSlug(value: string): string {
  return value.replace(/\./g, "-").replace(/_/g, "-")
}

/** Canonical key for fuzzy matching across naming conventions. */
export function normalizeMatchKey(slug: string): string {
  let normalized = slug.toLowerCase().replace(/[._]/g, "-")
  normalized = normalized.replace(/^nvidia-/, "")
  normalized = normalized.replace(
    /-(instruct|reasoning|non-reasoning|chat)(?=-|$)/gi,
    ""
  )
  normalized = normalized.replace(/-+/g, "-").replace(/^-|-$/g, "")
  return normalized
}

function hasModelRevisionSuffix(slug: string): boolean {
  // Model revisions like nano-9b-v2 or nano-12b-v2-vl — not release versions like super-49b-v1.
  return /\d+b-v[2-9]\d*(?:-|$)/i.test(slug)
}

function stripTrailingVersionSuffix(slug: string): string | null {
  if (hasModelRevisionSuffix(slug)) return null
  if (!/-v1(?:-\d+)?$/i.test(slug)) return null

  return slug.replace(/-v1(?:-\d+)?$/i, "")
}

/** Generate lookup keys for a slug, including common alias forms. */
export function expandMatchKeys(slug: string): string[] {
  const keys = new Set<string>()
  const base = normalizeMatchKey(slug)
  keys.add(base)

  const withoutVersion = stripTrailingVersionSuffix(base)
  if (withoutVersion) keys.add(withoutVersion)

  const nemotronAlias = base.replace(
    /^llama-\d+-\d+-nemotron-/,
    "llama-nemotron-"
  )
  if (nemotronAlias !== base) {
    keys.add(nemotronAlias)
    const aliasWithoutVersion = stripTrailingVersionSuffix(nemotronAlias)
    if (aliasWithoutVersion) keys.add(aliasWithoutVersion)
  }

  return [...keys]
}

function slugCandidatesFromModelsDevId(modelsDevId: string): string[] {
  const slug = modelsDevSlug(modelsDevId)
  const normalized = toSlug(slug)

  return Array.from(
    new Set([slug, normalized, `nvidia-${normalized}`, `nvidia-${slug}`])
  )
}

function pickBestMatch(
  candidates: IntelligenceScores[],
  modelsDevModelSlug: string
): IntelligenceScores {
  const slug = modelsDevModelSlug.toLowerCase()
  const wantsReasoning = slug.includes("reasoning")

  let pool = candidates
  if (wantsReasoning) {
    const reasoningMatches = candidates.filter((candidate) =>
      candidate.aaSlug.includes("reasoning")
    )
    if (reasoningMatches.length) pool = reasoningMatches
  } else {
    const nonReasoningMatches = candidates.filter(
      (candidate) => !candidate.aaSlug.includes("reasoning")
    )
    if (nonReasoningMatches.length) pool = nonReasoningMatches
  }

  return pool.reduce((best, candidate) => {
    const bestOverlap = countTokenOverlap(modelsDevModelSlug, best.aaSlug)
    const candidateOverlap = countTokenOverlap(modelsDevModelSlug, candidate.aaSlug)
    return candidateOverlap > bestOverlap ? candidate : best
  })
}

function countTokenOverlap(a: string, b: string): number {
  const tokensA = new Set(normalizeMatchKey(a).split("-").filter(Boolean))
  let overlap = 0

  for (const token of normalizeMatchKey(b).split("-")) {
    if (token && tokensA.has(token)) overlap += 1
  }

  return overlap
}

export function buildIntelligenceLookup(
  models: ArtificialAnalysisModel[],
  intelligenceIndexVersion: number
): {
  exact: Map<string, IntelligenceScores>
  normalized: Map<string, IntelligenceScores[]>
} {
  const exact = new Map<string, IntelligenceScores>()
  const normalized = new Map<string, IntelligenceScores[]>()

  for (const model of models) {
    const scores: IntelligenceScores = {
      intelligenceIndex:
        model.evaluations.artificial_analysis_intelligence_index ?? null,
      codingIndex: model.evaluations.artificial_analysis_coding_index ?? null,
      agenticIndex: model.evaluations.artificial_analysis_agentic_index ?? null,
      intelligenceIndexVersion,
      aaSlug: model.slug,
      aaName: model.name,
    }

    exact.set(model.slug, scores)
    exact.set(toSlug(model.slug), scores)

    for (const key of expandMatchKeys(model.slug)) {
      const bucket = normalized.get(key) ?? []
      bucket.push(scores)
      normalized.set(key, bucket)
    }
  }

  return { exact, normalized }
}

export function matchIntelligenceScores(
  modelsDevId: string,
  lookup: ReturnType<typeof buildIntelligenceLookup>
): IntelligenceScores | null {
  for (const candidate of slugCandidatesFromModelsDevId(modelsDevId)) {
    const match = lookup.exact.get(candidate)
    if (match) return match
  }

  const modelSlug = modelsDevSlug(modelsDevId)
  for (const key of expandMatchKeys(modelSlug)) {
    const candidates = lookup.normalized.get(key)
    if (!candidates?.length) continue

    if (candidates.length === 1) return candidates[0] ?? null

    return pickBestMatch(candidates, modelSlug)
  }

  return null
}
