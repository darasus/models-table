import type { LlmModelsSummary } from "@/lib/types/llm-model"

type ModelsPageHeaderProps = {
  summary: LlmModelsSummary
}

export function ModelsPageHeader({ summary }: ModelsPageHeaderProps) {
  return (
    <header className="space-y-1">
      <h1 className="text-2xl font-semibold tracking-tight">LLM Models</h1>
      <p className="text-sm text-muted-foreground">
        {summary.total} models from{" "}
        <a
          href="https://models.dev"
          target="_blank"
          rel="noreferrer"
          className="underline underline-offset-4 hover:text-foreground"
        >
          models.dev
        </a>
        , enriched with intelligence scores from{" "}
        <a
          href="https://artificialanalysis.ai"
          target="_blank"
          rel="noreferrer"
          className="underline underline-offset-4 hover:text-foreground"
        >
          Artificial Analysis
        </a>
        {summary.indexVersion
          ? ` (Intelligence Index v${summary.indexVersion}.0)`
          : ""}
        .
        {summary.withIntelligence > 0
          ? ` ${summary.withIntelligence} models matched with benchmark data.`
          : summary.hasApiKey
            ? " No benchmark matches found yet."
            : " Add ARTIFICIAL_ANALYSIS_API_KEY to load intelligence scores."}{" "}
        Sort, filter, and compare context windows, capabilities, pricing, and
        intelligence.
      </p>
    </header>
  )
}
