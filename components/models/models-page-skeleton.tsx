import { ModelsPageHeader } from "@/components/models/models-page-header"

export function ModelsPageSkeleton() {
  return (
    <div className="flex flex-col gap-6">
      <ModelsPageHeader
        summary={{
          total: 0,
          withIntelligence: 0,
          indexVersion: null,
          hasApiKey: Boolean(process.env.ARTIFICIAL_ANALYSIS_API_KEY),
        }}
      />
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <div className="h-9 max-w-sm flex-1 animate-pulse rounded-md bg-muted" />
          <div className="h-8 w-16 animate-pulse rounded-md bg-muted" />
        </div>
        <div className="overflow-hidden rounded-md border">
          <div className="space-y-0">
            <div className="h-10 animate-pulse border-b bg-muted/40" />
            {Array.from({ length: 8 }).map((_, index) => (
              <div
                key={index}
                className="h-12 animate-pulse border-b bg-muted/20 last:border-b-0"
              />
            ))}
          </div>
        </div>
        <div className="flex justify-between">
          <div className="h-5 w-40 animate-pulse rounded bg-muted" />
          <div className="h-8 w-64 animate-pulse rounded bg-muted" />
        </div>
      </div>
    </div>
  )
}
