export function formatTokens(value: number | null) {
  if (value === null) return "—"
  return new Intl.NumberFormat("en-US").format(value)
}

export function formatPrice(value: number | null) {
  if (value === null) return "—"
  if (value === 0) return "Free"
  return `$${value.toFixed(2)}`
}

export function formatDate(value: string | null) {
  if (!value) return "—"
  return new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  }).format(new Date(value))
}

export function formatLab(lab: string) {
  return lab
    .split("-")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ")
}

export function formatScore(value: number | null) {
  if (value === null) return "—"
  return value.toFixed(1)
}
