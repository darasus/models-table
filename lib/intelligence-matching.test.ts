import { describe, expect, test } from "bun:test"

import {
  buildIntelligenceLookup,
  expandMatchKeys,
  matchIntelligenceScores,
  normalizeMatchKey,
  type ArtificialAnalysisModel,
} from "./intelligence-matching"

function aaModel(
  slug: string,
  intelligenceIndex: number | null = 10
): ArtificialAnalysisModel {
  return {
    id: slug,
    slug,
    name: slug,
    model_creator: { id: "test", name: "Test" },
    evaluations: {
      artificial_analysis_intelligence_index: intelligenceIndex,
      artificial_analysis_coding_index: null,
      artificial_analysis_agentic_index: null,
    },
  }
}

describe("normalizeMatchKey", () => {
  test("strips nvidia prefix and normalizes punctuation", () => {
    expect(normalizeMatchKey("nvidia-nemotron-3-nano-30b-a3b")).toBe(
      "nemotron-3-nano-30b-a3b"
    )
    expect(normalizeMatchKey("llama-3.1-nemotron-70b-instruct")).toBe(
      "llama-3-1-nemotron-70b"
    )
  })
})

describe("expandMatchKeys", () => {
  test("creates llama nemotron alias keys", () => {
    expect(expandMatchKeys("llama-3.3-nemotron-super-49b-v1.5")).toContain(
      "llama-nemotron-super-49b-v1-5"
    )
  })
})

describe("matchIntelligenceScores", () => {
  test("matches exact slugs", () => {
    const lookup = buildIntelligenceLookup(
      [aaModel("nemotron-cascade-2-30b-a3b", 28.4)],
      4
    )

    expect(
      matchIntelligenceScores("nvidia/nemotron-cascade-2-30b-a3b", lookup)
        ?.intelligenceIndex
    ).toBe(28.4)
  })

  test("matches nvidia-prefixed AA slugs", () => {
    const lookup = buildIntelligenceLookup(
      [aaModel("nvidia-nemotron-3-nano-30b-a3b", 13.2)],
      4
    )

    expect(
      matchIntelligenceScores("nvidia/nemotron-3-nano-30b-a3b", lookup)
        ?.intelligenceIndex
    ).toBe(13.2)
  })

  test("matches reordered llama nemotron slugs", () => {
    const lookup = buildIntelligenceLookup(
      [aaModel("llama-3-1-nemotron-instruct-70b", 13.4)],
      4
    )

    expect(
      matchIntelligenceScores("nvidia/llama-3.1-nemotron-70b-instruct", lookup)
        ?.intelligenceIndex
    ).toBe(13.4)
  })

  test("prefers non-reasoning variant by default", () => {
    const lookup = buildIntelligenceLookup(
      [
        aaModel("llama-3-3-nemotron-super-49b", 14.3),
        aaModel("llama-3-3-nemotron-super-49b-reasoning", 18.5),
      ],
      4
    )

    expect(
      matchIntelligenceScores("nvidia/llama-3.3-nemotron-super-49b-v1", lookup)
        ?.aaSlug
    ).toBe("llama-3-3-nemotron-super-49b")
  })

  test("prefers reasoning variant when requested", () => {
    const lookup = buildIntelligenceLookup(
      [
        aaModel("nvidia-nemotron-3-nano-30b-a3b", 13.2),
        aaModel("nvidia-nemotron-3-nano-30b-a3b-reasoning", 24.3),
      ],
      4
    )

    expect(
      matchIntelligenceScores(
        "nvidia/nemotron-3-nano-30b-a3b-reasoning",
        lookup
      )?.aaSlug
    ).toBe("nvidia-nemotron-3-nano-30b-a3b-reasoning")
  })
})
