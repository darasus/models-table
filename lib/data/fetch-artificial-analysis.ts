import "server-only"

import { cacheLife, cacheTag } from "next/cache"

import type { ArtificialAnalysisModel } from "@/lib/intelligence-matching"

const AA_API_BASE = "https://artificialanalysis.ai/api/v2"
const MAX_RETRIES = 3
const MAX_RETRY_DELAY_MS = 10_000

type ArtificialAnalysisListResponse = {
  tier: string
  intelligence_index_version: number
  pagination: {
    page: number
    page_size: number
    total_pages: number
    has_more: boolean
  }
  data: ArtificialAnalysisModel[]
}

export type ArtificialAnalysisResult = {
  models: ArtificialAnalysisModel[]
  intelligenceIndexVersion: number
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

const PAGE_FETCH_DELAY_MS = 150

function getRetryDelayMs(response: Response, attempt: number): number {
  const retryAfter = response.headers.get("retry-after")
  if (retryAfter) {
    const seconds = Number.parseInt(retryAfter, 10)
    if (!Number.isNaN(seconds)) {
      return Math.min(seconds * 1000, MAX_RETRY_DELAY_MS)
    }
  }

  return Math.min(1000 * 2 ** attempt, MAX_RETRY_DELAY_MS)
}

async function fetchArtificialAnalysisPage(
  apiKey: string,
  page: number
): Promise<ArtificialAnalysisListResponse | null> {
  for (let attempt = 0; attempt <= MAX_RETRIES; attempt += 1) {
    const response = await fetch(
      `${AA_API_BASE}/language/models/free?page=${page}`,
      {
        headers: {
          "x-api-key": apiKey,
        },
        cache: "no-store",
      }
    )

    if (response.ok) {
      return (await response.json()) as ArtificialAnalysisListResponse
    }

    if (response.status === 429 && attempt < MAX_RETRIES) {
      const delayMs = getRetryDelayMs(response, attempt)
      console.warn(
        `Artificial Analysis rate limited (429) on page ${page}, retrying in ${delayMs}ms`
      )
      await sleep(delayMs)
      continue
    }

    console.warn(
      `Failed to fetch Artificial Analysis page ${page}: ${response.status}`
    )
    return null
  }

  return null
}

async function fetchArtificialAnalysisModelsFromApi(): Promise<ArtificialAnalysisResult> {
  const apiKey = process.env.ARTIFICIAL_ANALYSIS_API_KEY
  if (!apiKey) {
    return { models: [], intelligenceIndexVersion: 4 }
  }

  const models: ArtificialAnalysisModel[] = []
  let intelligenceIndexVersion = 4
  let page = 1
  let totalPages = 1

  while (page <= totalPages) {
    if (page > 1) {
      await sleep(PAGE_FETCH_DELAY_MS)
    }

    const payload = await fetchArtificialAnalysisPage(apiKey, page)
    if (!payload) {
      if (models.length === 0) {
        throw new Error("Failed to fetch Artificial Analysis models")
      }

      console.warn(
        "Using partial Artificial Analysis data after a failed page fetch"
      )
      break
    }

    intelligenceIndexVersion = payload.intelligence_index_version
    totalPages = payload.pagination.total_pages
    models.push(...payload.data)
    page += 1
  }

  return { models, intelligenceIndexVersion }
}

export async function fetchArtificialAnalysisModels(): Promise<ArtificialAnalysisResult> {
  "use cache: remote"
  cacheLife("days")
  cacheTag("artificial-analysis")

  return fetchArtificialAnalysisModelsFromApi()
}
