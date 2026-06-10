import { Suspense } from "react"
import type { Metadata } from "next"

import { ModelsPageSkeleton } from "@/components/models/models-page-skeleton"
import { ModelsTableSection } from "@/components/models/models-table-section"

export const metadata: Metadata = {
  title: "LLM Models",
  description: "Browse and compare LLM models from models.dev",
}

export default function Page() {
  return (
    <main className="container mx-auto flex min-h-svh flex-col gap-6 py-10">
      <Suspense fallback={<ModelsPageSkeleton />}>
        <ModelsTableSection />
      </Suspense>
    </main>
  )
}
