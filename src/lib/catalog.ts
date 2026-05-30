// Platform and store definitions for the simulator. Products are fetched from
// the backend API (GET /catalog/products/by-platform) so this file only holds
// the metadata needed before a connection is established (platform labels,
// delivery fees, and the store external ids used to query the backend).

export type PlatformId = 'grabfood' | 'foodpanda'

/** A product as returned by GET /catalog/products/by-platform. */
export interface MenuProduct {
  /** Platform-specific external id the backend resolves in translation. */
  externalId: string
  /** Short customer-facing code shown on the menu, e.g. "CHK1". */
  productCode: string | null
  name: string
  description: string | null
  basePriceCents: number
  isAvailable: boolean
}

export interface SimStore {
  /** GrabFood `merchantID` / Foodpanda `platformRestaurant.id`. */
  externalId: string
  /** Shown in the store picker, e.g. "Manila Branch 01". */
  name: string
  location: string
}

export interface PlatformDef {
  id: PlatformId
  /** Channel label as a customer would see it, e.g. "Delivery by Grab". */
  label: string
  /** Tailwind classes for the platform chip (mirrors the frontend's lib/platform). */
  badgeClass: string
  /** Flat delivery fee added to the order total, in cents. */
  deliveryFeeCents: number
  stores: SimStore[]
}

export const PLATFORMS: PlatformDef[] = [
  {
    id: 'grabfood',
    label: 'Delivery by Grab',
    badgeClass: 'bg-green-600 text-white',
    deliveryFeeCents: 5000,
    stores: [
      {
        externalId: '1-CYNGRUNGSBCCC',
        name: 'Manila Branch 01',
        location: 'Manila, PH',
      },
    ],
  },
  {
    id: 'foodpanda',
    label: 'Delivery by foodpanda',
    badgeClass: 'bg-pink-600 text-white',
    deliveryFeeCents: 4900,
    stores: [
      {
        externalId: 'sq-abcd',
        name: 'Manila Branch 01',
        location: 'Manila, PH',
      },
    ],
  },
]

export function getPlatform(id: PlatformId): PlatformDef {
  const found = PLATFORMS.find((p) => p.id === id)
  if (!found) throw new Error(`Unknown platform: ${id}`)
  return found
}
