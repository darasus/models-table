export type LlmModel = {
  id: string
  name: string
  lab: string
  providers: number
  providerNames: string[]
  context: number | null
  output: number | null
  inputModalities: string[]
  reasoning: boolean
  toolCall: boolean
  structuredOutput: boolean
  attachment: boolean
  openWeights: boolean
  inputPrice: number | null
  outputPrice: number | null
  releaseDate: string | null
  lastUpdated: string | null
  intelligenceIndex: number | null
  codingIndex: number | null
  agenticIndex: number | null
  intelligenceIndexVersion: number | null
  aaSlug: string | null
}

export type LlmModelsSummary = {
  total: number
  withIntelligence: number
  indexVersion: number | null
  hasApiKey: boolean
}
