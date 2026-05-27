// The platform deals in Philippine pesos. Internally we keep money as integer
// minor units ("cents") — the same representation GrabFood sends and the backend
// canonical schema stores — and only convert at the edges.

const peso = new Intl.NumberFormat('en-PH', {
  style: 'currency',
  currency: 'PHP',
})

/** Format integer cents as Philippine pesos, e.g. 12500 → "₱125.00". */
export function formatCents(cents: number): string {
  return peso.format(cents / 100)
}

/** Cents → a major-unit decimal string, e.g. 642 → "6.42" (Foodpanda's wire format). */
export function centsToDecimalString(cents: number): string {
  return (cents / 100).toFixed(2)
}
