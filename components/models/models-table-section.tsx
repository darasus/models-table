import { connection } from "next/server"

import { ModelsDataTable } from "@/components/models/models-data-table"
import { ModelsPageHeader } from "@/components/models/models-page-header"
import { getLlmModels } from "@/lib/data/get-llm-models"
import { summarizeLlmModels } from "@/lib/data/summarize-llm-models"

export async function ModelsTableSection() {
  await connection()

  const models = await getLlmModels()
  const summary = summarizeLlmModels(models)

  return (
    <>
      <ModelsPageHeader summary={summary} />
      <ModelsDataTable data={models} />
    </>
  )
}
