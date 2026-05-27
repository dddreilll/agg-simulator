// The simulated menu. These external ids are exactly the ones the backend seed
// (`delivery-platform_backend/src/database/seed.ts`) maps to internal products,
// modifiers, and stores via `platform_mappings`. Sending anything else would be
// accepted at ingestion but fail to resolve during translation — so the simulator
// only offers what the backend knows how to fulfil. Keep this in sync with the seed.

export type PlatformId = 'grabfood' | 'foodpanda'

export interface MenuModifier {
  /** Platform-side id the backend resolves to an internal modifier. */
  externalId: string
  name: string
  priceCents: number
}

export interface MenuProduct {
  /** Platform-side id the backend resolves to an internal product. */
  externalId: string
  name: string
  description: string
  basePriceCents: number
  modifiers: MenuModifier[]
}

export interface SimStore {
  /** GrabFood `merchantID` / Foodpanda `platformRestaurant.id`. */
  externalId: string
  /** Shown in the store picker, e.g. "Manila Branch 01". */
  name: string
  location: string
  products: MenuProduct[]
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
        externalId: '1-CYNGRUNGSBCCC', // seed: GRABFOOD STORE mapping
        name: 'Manila Branch 01',
        location: 'Manila, PH',
        products: [
          {
            externalId: 'item-1', // seed: GRABFOOD PRODUCT mapping
            name: '1-pc Spicy Chicken Meal',
            description: 'Crispy spicy chicken with rice and a drink.',
            basePriceCents: 13000,
            modifiers: [
              {
                externalId: 'modifier-1', // seed: GRABFOOD MODIFIER mapping
                name: 'Garlic Rice Upgrade',
                priceCents: 3000,
              },
            ],
          },
        ],
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
        externalId: 'sq-abcd', // seed: FOODPANDA STORE mapping
        name: 'Manila Branch 01',
        location: 'Manila, PH',
        products: [
          {
            externalId: 'ID_FOR_DOUBLE_CHEESE_BURGER_ON_POS', // seed: FOODPANDA PRODUCT remoteCode
            name: 'Double Cheese Burger',
            description: 'Two beef patties, double cheese, toasted bun.',
            basePriceCents: 642,
            modifiers: [
              {
                externalId: 'ID_FOR_EXTRA_CHEESE_ON_POS', // seed: FOODPANDA MODIFIER remoteCode
                name: 'Extra Cheese',
                priceCents: 150,
              },
            ],
          },
        ],
      },
    ],
  },
]

export function getPlatform(id: PlatformId): PlatformDef {
  const found = PLATFORMS.find((p) => p.id === id)
  if (!found) throw new Error(`Unknown platform: ${id}`)
  return found
}
