import { describe, expect, test } from "bun:test"

import {
  countActiveFilters,
  EMPTY_MODEL_FILTERS,
  filterModels,
  matchesModelFilters,
} from "./filter-models"
import type { LlmModel } from "./types/llm-model"

function model(overrides: Partial<LlmModel> = {}): LlmModel {
  return {
    id: "openai/gpt-4o",
    name: "GPT-4o",
    lab: "openai",
    providers: 2,
    providerNames: ["openai", "azure"],
    context: 128_000,
    output: 16_384,
    inputModalities: ["text", "image"],
    reasoning: true,
    toolCall: true,
    structuredOutput: false,
    attachment: false,
    openWeights: false,
    inputPrice: 2.5,
    outputPrice: 10,
    releaseDate: "2024-05-13",
    lastUpdated: "2025-01-10",
    intelligenceIndex: 42.1,
    codingIndex: 38.5,
    agenticIndex: 35.2,
    intelligenceIndexVersion: 4,
    aaSlug: "gpt-4o",
    ...overrides,
  }
}

describe("matchesModelFilters", () => {
  test("returns true when no filters are active", () => {
    expect(matchesModelFilters(model(), EMPTY_MODEL_FILTERS)).toBe(true)
  })

  test("filters by lab", () => {
    expect(
      matchesModelFilters(model(), { ...EMPTY_MODEL_FILTERS, labs: ["openai"] })
    ).toBe(true)
    expect(
      matchesModelFilters(model(), { ...EMPTY_MODEL_FILTERS, labs: ["anthropic"] })
    ).toBe(false)
  })

  test("filters by modalities with OR semantics", () => {
    expect(
      matchesModelFilters(model(), {
        ...EMPTY_MODEL_FILTERS,
        modalities: ["image"],
      })
    ).toBe(true)
    expect(
      matchesModelFilters(model(), {
        ...EMPTY_MODEL_FILTERS,
        modalities: ["audio"],
      })
    ).toBe(false)
  })

  test("filters by capabilities with AND semantics", () => {
    expect(
      matchesModelFilters(model(), {
        ...EMPTY_MODEL_FILTERS,
        capabilities: ["reasoning", "toolCall"],
      })
    ).toBe(true)
    expect(
      matchesModelFilters(model(), {
        ...EMPTY_MODEL_FILTERS,
        capabilities: ["reasoning", "structuredOutput"],
      })
    ).toBe(false)
  })

  test("filters by weights", () => {
    expect(
      matchesModelFilters(model(), {
        ...EMPTY_MODEL_FILTERS,
        weights: ["closed"],
      })
    ).toBe(true)
    expect(
      matchesModelFilters(model({ openWeights: true }), {
        ...EMPTY_MODEL_FILTERS,
        weights: ["open"],
      })
    ).toBe(true)
  })

  test("filters by providers with OR semantics", () => {
    expect(
      matchesModelFilters(model(), {
        ...EMPTY_MODEL_FILTERS,
        providers: ["azure"],
      })
    ).toBe(true)
    expect(
      matchesModelFilters(model(), {
        ...EMPTY_MODEL_FILTERS,
        providers: ["bedrock"],
      })
    ).toBe(false)
  })

  test("excludes null numeric values when a range filter is active", () => {
    expect(
      matchesModelFilters(model({ intelligenceIndex: null }), {
        ...EMPTY_MODEL_FILTERS,
        intelligenceMin: 10,
      })
    ).toBe(false)
    expect(
      matchesModelFilters(model({ intelligenceIndex: 42.1 }), {
        ...EMPTY_MODEL_FILTERS,
        intelligenceMin: 10,
        intelligenceMax: 50,
      })
    ).toBe(true)
    expect(
      matchesModelFilters(model({ intelligenceIndex: 42.1 }), {
        ...EMPTY_MODEL_FILTERS,
        intelligenceMax: 40,
      })
    ).toBe(false)
  })

  test("filters by date range", () => {
    expect(
      matchesModelFilters(model(), {
        ...EMPTY_MODEL_FILTERS,
        releaseDateMin: "2024-01-01",
        releaseDateMax: "2024-12-31",
      })
    ).toBe(true)
    expect(
      matchesModelFilters(model({ releaseDate: null }), {
        ...EMPTY_MODEL_FILTERS,
        releaseDateMin: "2024-01-01",
      })
    ).toBe(false)
  })
})

describe("filterModels", () => {
  test("chains multiple filters", () => {
    const models = [
      model(),
      model({ id: "anthropic/claude-3", lab: "anthropic", reasoning: false }),
    ]

    const result = filterModels(models, {
      ...EMPTY_MODEL_FILTERS,
      labs: ["openai"],
      capabilities: ["reasoning"],
    })

    expect(result).toHaveLength(1)
    expect(result[0]?.id).toBe("openai/gpt-4o")
  })
})

describe("countActiveFilters", () => {
  test("counts each active filter group and bound", () => {
    expect(countActiveFilters(EMPTY_MODEL_FILTERS)).toBe(0)
    expect(
      countActiveFilters({
        ...EMPTY_MODEL_FILTERS,
        labs: ["openai"],
        intelligenceMin: 10,
        releaseDateMax: "2025-12-31",
      })
    ).toBe(3)
  })
})
