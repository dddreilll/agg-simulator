// Builds the *native* webhook payload each platform would POST to the backend.
// The backend's front door only reads the order id at ingestion; full structural
// validation (the zod schemas in `delivery-platform_backend/src/translation/*`)
// happens in the worker, so these payloads are shaped to pass that validation and
// resolve against the seeded mappings.

import type { CartLine, CartTotals } from './cart'
import type { PlatformId, SimStore } from './catalog'
import { centsToDecimalString } from './money'

export interface OrderOptions {
  /** The platform-native order id (drives the idempotency key). */
  orderId: string
  /** Cashless (online) vs cash-on-delivery. */
  cashless: boolean
  /** Customer requested cutlery (GrabFood `cutlery`). */
  cutlery: boolean
}

/** A platform-native order id. GrabFood ids are short codes; Foodpanda uses a UUID token. */
export function generateOrderId(platform: PlatformId): string {
  if (platform === 'foodpanda') return crypto.randomUUID()
  const rand = Math.random().toString(36).slice(2, 8).toUpperCase()
  return `SIM-${rand}`
}

function buildGrabFood(
  store: SimStore,
  lines: CartLine[],
  totals: CartTotals,
  opts: OrderOptions,
): Record<string, unknown> {
  const now = new Date().toISOString()
  return {
    orderID: opts.orderId,
    shortOrderNumber: `GF-${opts.orderId.slice(-4)}`,
    merchantID: store.externalId,
    partnerMerchantID: store.externalId,
    paymentType: opts.cashless ? 'CASHLESS' : 'CASH',
    cutlery: opts.cutlery,
    orderTime: now,
    submitTime: now,
    currency: { code: 'PHP', symbol: '₱', exponent: 2 },
    featureFlags: {
      orderAcceptedType: 'AUTO',
      orderType: 'DeliveredByGrab',
      isMexEditOrder: false,
    },
    items: lines.map((line, i) => ({
      id: line.product.externalId,
      grabItemID: `IDGFSIM${i}`,
      quantity: line.quantity,
      price: line.product.basePriceCents,
      tax: 0,
      ...(line.notes ? { specifications: line.notes } : {}),
      modifiers: line.modifiers.map((m) => ({
        id: m.externalId,
        price: m.priceCents,
        quantity: 1,
        tax: 0,
      })),
    })),
    price: {
      subtotal: totals.subtotalCents,
      tax: 0,
      deliveryFee: totals.deliveryFeeCents,
      total: totals.totalCents,
    },
    receiver: { name: 'Simulated Customer', phones: '+639170000000' },
  }
}

function buildFoodpanda(
  store: SimStore,
  lines: CartLine[],
  totals: CartTotals,
  opts: OrderOptions,
): Record<string, unknown> {
  return {
    token: opts.orderId,
    code: opts.orderId.slice(0, 8),
    createdAt: new Date().toISOString(),
    expeditionType: 'delivery',
    payment: {
      status: opts.cashless ? 'paid' : 'pending',
      type: opts.cashless ? 'paid' : 'pending',
    },
    localInfo: {
      countryCode: 'PH',
      currencySymbol: '₱',
      platform: 'foodpanda',
      platformKey: 'FP_PH',
    },
    platformRestaurant: { id: store.externalId },
    products: lines.map((line) => ({
      id: line.product.externalId,
      remoteCode: line.product.externalId,
      name: line.product.name,
      quantity: String(line.quantity),
      unitPrice: centsToDecimalString(line.product.basePriceCents),
      paidPrice: centsToDecimalString(line.product.basePriceCents * line.quantity),
      ...(line.notes ? { comment: line.notes } : {}),
      selectedToppings: line.modifiers.map((m) => ({
        remoteCode: m.externalId,
        name: m.name,
        price: centsToDecimalString(m.priceCents),
        quantity: 1,
      })),
    })),
    price: { grandTotal: centsToDecimalString(totals.totalCents) },
  }
}

export function buildPayload(
  platform: PlatformId,
  store: SimStore,
  lines: CartLine[],
  totals: CartTotals,
  opts: OrderOptions,
): Record<string, unknown> {
  return platform === 'foodpanda'
    ? buildFoodpanda(store, lines, totals, opts)
    : buildGrabFood(store, lines, totals, opts)
}
