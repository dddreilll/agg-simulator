import { useMemo, useState } from 'react'
import { PLATFORMS, getPlatform, type PlatformId, type SimStore } from '@/lib/catalog'
import { cartTotals, type CartLine } from '@/lib/cart'
import { buildPayload, generateOrderId, type OrderOptions } from '@/lib/payload'
import { sendWebhook, type SendResult } from '@/lib/api'

/** What the customer has configured for a single product on the menu. */
interface LineState {
  quantity: number
  modifierIds: string[]
  notes: string
}

export interface HistoryEntry {
  key: string
  orderId: string
  platformId: PlatformId
  platformLabel: string
  status: SendResult['status']
  httpStatus: number
  totalCents: number
  at: number
}

const DEFAULT_OPTIONS: OrderOptions = { orderId: '', cashless: false, cutlery: false }

export function useOrderSimulator(apiUrl: string) {
  const [platformId, setPlatformId] = useState<PlatformId>('grabfood')
  const platform = getPlatform(platformId)

  const [storeExternalId, setStoreExternalId] = useState<string>(
    platform.stores[0].externalId,
  )
  const store: SimStore =
    platform.stores.find((s) => s.externalId === storeExternalId) ?? platform.stores[0]

  const [cart, setCart] = useState<Record<string, LineState>>({})
  const [cashless, setCashless] = useState(false)
  const [cutlery, setCutlery] = useState(false)
  const [orderId, setOrderId] = useState(() => generateOrderId('grabfood'))

  const [sending, setSending] = useState(false)
  const [result, setResult] = useState<SendResult | null>(null)
  const [history, setHistory] = useState<HistoryEntry[]>([])

  // Derive the cart lines from the current store's menu + per-product selections.
  const lines: CartLine[] = useMemo(() => {
    return store.products
      .map((product): CartLine | null => {
        const state = cart[product.externalId]
        if (!state || state.quantity <= 0) return null
        return {
          product,
          quantity: state.quantity,
          modifiers: product.modifiers.filter((m) =>
            state.modifierIds.includes(m.externalId),
          ),
          notes: state.notes,
        }
      })
      .filter((l): l is CartLine => l !== null)
  }, [store, cart])

  const totals = useMemo(() => cartTotals(lines, platform), [lines, platform])

  // The payload that "Place Order" would send right now — also shown raw in the UI.
  const payload = useMemo(
    () => buildPayload(platformId, store, lines, totals, { ...DEFAULT_OPTIONS, orderId, cashless, cutlery }),
    [platformId, store, lines, totals, orderId, cashless, cutlery],
  )

  /** Commit an item from the in-phone detail screen to the basket (replaces any
   *  existing line for the same product). A non-positive quantity removes it. */
  function addToBasket(productId: string, line: LineState) {
    setCart((prev) => {
      if (line.quantity <= 0) {
        const next = { ...prev }
        delete next[productId]
        return next
      }
      return { ...prev, [productId]: { ...line } }
    })
  }

  function removeFromBasket(productId: string) {
    setCart((prev) => {
      const next = { ...prev }
      delete next[productId]
      return next
    })
  }

  function selectPlatform(id: PlatformId) {
    if (id === platformId) return
    const next = getPlatform(id)
    setPlatformId(id)
    setStoreExternalId(next.stores[0].externalId)
    setCart({})
    setResult(null)
    setOrderId(generateOrderId(id))
  }

  function selectStore(externalId: string) {
    if (externalId === storeExternalId) return
    setStoreExternalId(externalId)
    setCart({})
  }

  function newOrderId() {
    setOrderId(generateOrderId(platformId))
  }

  async function placeOrder() {
    if (lines.length === 0 || sending) return
    setSending(true)
    try {
      const res = await sendWebhook(apiUrl, platformId, payload)
      setResult(res)
      setHistory((prev) =>
        [
          {
            key: `${orderId}-${Date.now()}`,
            orderId,
            platformId,
            platformLabel: platform.label,
            status: res.status,
            httpStatus: res.httpStatus,
            totalCents: totals.totalCents,
            at: Date.now(),
          },
          ...prev,
        ].slice(0, 12),
      )
    } finally {
      setSending(false)
    }
  }

  return {
    platforms: PLATFORMS,
    platform,
    platformId,
    store,
    lines,
    totals,
    cart,
    options: { cashless, cutlery },
    orderId,
    payload,
    sending,
    result,
    history,
    selectPlatform,
    selectStore,
    addToBasket,
    removeFromBasket,
    setCashless,
    setCutlery,
    newOrderId,
    placeOrder,
  }
}

export type Simulator = ReturnType<typeof useOrderSimulator>
