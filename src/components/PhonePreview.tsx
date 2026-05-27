import { useState } from 'react'
import {
  ArrowLeft,
  BatteryFull,
  Loader2,
  Minus,
  Plus,
  RefreshCw,
  Signal,
  Trash2,
  UtensilsCrossed,
  Wifi,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Switch } from '@/components/ui/switch'
import type { Simulator } from '@/hooks/useOrderSimulator'
import type { MenuProduct } from '@/lib/catalog'
import { lineUnitCents } from '@/lib/cart'
import { formatCents } from '@/lib/money'

const clock = new Intl.DateTimeFormat('en-GB', { hour: '2-digit', minute: '2-digit' })

type Screen = 'menu' | 'item' | 'basket'
interface Draft {
  quantity: number
  modifierIds: string[]
  notes: string
}

/** A small grey tile standing in for the product photo. */
function Thumb({ className = '' }: { className?: string }) {
  return (
    <span
      className={`flex shrink-0 items-center justify-center rounded-md bg-gradient-to-br from-neutral-100 to-neutral-200 text-neutral-400 ${className}`}
    >
      <UtensilsCrossed className="size-1/3" />
    </span>
  )
}

export function PhonePreview({ sim }: { sim: Simulator }) {
  const { store, platform, totals, lines, cart, options } = sim

  const [screen, setScreen] = useState<Screen>('menu')
  const [openId, setOpenId] = useState<string | null>(null)
  const [draft, setDraft] = useState<Draft>({ quantity: 1, modifierIds: [], notes: '' })

  // Reset the flow when the channel/store (and therefore the menu) changes.
  const storeKey = `${platform.id}|${store.externalId}`
  const [prevKey, setPrevKey] = useState(storeKey)
  if (storeKey !== prevKey) {
    setPrevKey(storeKey)
    setScreen('menu')
    setOpenId(null)
  }

  const openProduct = store.products.find((p) => p.externalId === openId) ?? null
  const itemCount = lines.reduce((n, l) => n + l.quantity, 0)

  function openItem(product: MenuProduct) {
    const existing = cart[product.externalId]
    setDraft(
      existing
        ? {
            quantity: existing.quantity,
            modifierIds: [...existing.modifierIds],
            notes: existing.notes,
          }
        : { quantity: 1, modifierIds: [], notes: '' },
    )
    setOpenId(product.externalId)
    setScreen('item')
  }

  function toggleDraftModifier(id: string) {
    setDraft((d) => ({
      ...d,
      modifierIds: d.modifierIds.includes(id)
        ? d.modifierIds.filter((m) => m !== id)
        : [...d.modifierIds, id],
    }))
  }

  function commitDraft() {
    if (!openProduct) return
    sim.addToBasket(openProduct.externalId, draft)
    setScreen('menu')
  }

  const draftUnitCents = openProduct
    ? openProduct.basePriceCents +
      openProduct.modifiers
        .filter((m) => draft.modifierIds.includes(m.externalId))
        .reduce((s, m) => s + m.priceCents, 0)
    : 0

  return (
    <div className="mx-auto w-full max-w-[360px]">
      <div className="overflow-hidden rounded-[2.25rem] border-8 border-neutral-900 bg-white shadow-xl">
        {/* Status bar */}
        <div className="flex items-center justify-between bg-neutral-900 px-5 py-1.5 text-xs text-white">
          <span>{clock.format(new Date())}</span>
          <span className="flex items-center gap-1">
            <Wifi className="size-3.5" />
            <Signal className="size-3.5" />
            <BatteryFull className="size-4" /> 85%
          </span>
        </div>

        <div className="flex h-[620px] flex-col text-neutral-900">
          {/* ---------- MENU ---------- */}
          {screen === 'menu' && (
            <>
              <div className="flex items-center gap-2 border-b px-4 py-3">
                <span className="font-semibold">{store.name}</span>
                <span
                  className={`ml-auto rounded-full px-2 py-0.5 text-[10px] font-medium ${platform.badgeClass}`}
                >
                  {platform.label}
                </span>
              </div>
              <ul className="flex-1 divide-y overflow-y-auto">
                {store.products.map((product) => {
                  const qty = cart[product.externalId]?.quantity ?? 0
                  return (
                    <li key={product.externalId}>
                      <button
                        type="button"
                        onClick={() => openItem(product)}
                        className="flex w-full gap-3 p-4 text-left hover:bg-neutral-50"
                      >
                        <Thumb className="size-16" />
                        <div className="min-w-0 flex-1">
                          <p className="flex items-center gap-1.5 font-medium">
                            {qty > 0 && (
                              <span className="text-emerald-600">{qty}×</span>
                            )}
                            {product.name}
                          </p>
                          <p className="line-clamp-2 text-xs text-neutral-500">
                            {product.description}
                          </p>
                          <p className="mt-1 text-sm font-medium">
                            {formatCents(product.basePriceCents)}
                          </p>
                        </div>
                      </button>
                    </li>
                  )
                })}
              </ul>
              {itemCount > 0 && (
                <div className="border-t p-3">
                  <Button
                    type="button"
                    className="h-11 w-full justify-between bg-emerald-600 px-4 text-base text-white hover:bg-emerald-600/90"
                    onClick={() => setScreen('basket')}
                  >
                    <span>View Basket</span>
                    <span>
                      {itemCount} {itemCount === 1 ? 'item' : 'items'} ·{' '}
                      {formatCents(totals.subtotalCents)}
                    </span>
                  </Button>
                </div>
              )}
            </>
          )}

          {/* ---------- ITEM DETAIL ---------- */}
          {screen === 'item' && openProduct && (
            <>
              <Thumb className="h-40 w-full rounded-none" />
              <div className="flex-1 overflow-y-auto p-4">
                <button
                  type="button"
                  onClick={() => setScreen('menu')}
                  className="mb-3 inline-flex items-center gap-1 text-sm text-neutral-500 hover:text-neutral-900"
                >
                  <ArrowLeft className="size-4" /> Menu
                </button>
                <div className="flex items-start justify-between gap-2">
                  <h3 className="text-lg font-semibold">{openProduct.name}</h3>
                  <span className="font-semibold">
                    {formatCents(openProduct.basePriceCents)}
                  </span>
                </div>
                <p className="mt-1 text-sm text-neutral-500">{openProduct.description}</p>

                {openProduct.modifiers.length > 0 && (
                  <div className="mt-4 border-t pt-3">
                    <p className="mb-2 text-sm font-medium">Add-ons</p>
                    <div className="space-y-1.5">
                      {openProduct.modifiers.map((m) => (
                        <label
                          key={m.externalId}
                          className="flex cursor-pointer items-center justify-between gap-2 text-sm"
                        >
                          <span className="flex items-center gap-2">
                            <input
                              type="checkbox"
                              checked={draft.modifierIds.includes(m.externalId)}
                              onChange={() => toggleDraftModifier(m.externalId)}
                              className="size-4 accent-emerald-600"
                            />
                            {m.name}
                          </span>
                          <span className="text-neutral-500">+{formatCents(m.priceCents)}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                )}

                <div className="mt-4 border-t pt-3">
                  <label className="text-sm font-medium">
                    Note to restaurant{' '}
                    <span className="font-normal text-neutral-400">Optional</span>
                  </label>
                  <input
                    value={draft.notes}
                    onChange={(e) => setDraft((d) => ({ ...d, notes: e.target.value }))}
                    placeholder="Add your request (subject to restaurant's discretion)"
                    className="mt-1.5 h-9 w-full rounded-md border bg-transparent px-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-emerald-500"
                  />
                </div>

                <div className="mt-5 flex items-center justify-center gap-4">
                  <Button
                    type="button"
                    size="icon"
                    variant="outline"
                    aria-label="Decrease quantity"
                    disabled={draft.quantity <= 1}
                    onClick={() => setDraft((d) => ({ ...d, quantity: d.quantity - 1 }))}
                  >
                    <Minus />
                  </Button>
                  <span className="w-6 text-center text-lg tabular-nums">{draft.quantity}</span>
                  <Button
                    type="button"
                    size="icon"
                    variant="outline"
                    aria-label="Increase quantity"
                    onClick={() => setDraft((d) => ({ ...d, quantity: d.quantity + 1 }))}
                  >
                    <Plus />
                  </Button>
                </div>
              </div>
              <div className="border-t p-3">
                <Button
                  type="button"
                  className="h-11 w-full justify-between bg-emerald-600 px-4 text-base text-white hover:bg-emerald-600/90"
                  onClick={commitDraft}
                >
                  <span>{cart[openProduct.externalId] ? 'Update Basket' : 'Add to Basket'}</span>
                  <span>{formatCents(draftUnitCents * draft.quantity)}</span>
                </Button>
              </div>
            </>
          )}

          {/* ---------- BASKET / CHECKOUT ---------- */}
          {screen === 'basket' && (
            <>
              <div className="flex items-center gap-3 border-b px-4 py-3">
                <button
                  type="button"
                  onClick={() => setScreen('menu')}
                  aria-label="Back to menu"
                >
                  <ArrowLeft className="size-5 text-neutral-500" />
                </button>
                <span className="font-semibold">Your Order</span>
                <span
                  className={`ml-auto rounded-full px-2 py-0.5 text-[10px] font-medium ${platform.badgeClass}`}
                >
                  {platform.label}
                </span>
              </div>

              <div className="flex-1 space-y-4 overflow-y-auto p-4">
                <div>
                  <p className="text-sm text-neutral-500">Deliver to</p>
                  <div className="mt-1 flex items-center gap-2">
                    <span className="size-8 rounded-full bg-emerald-100" />
                    <div className="text-sm">
                      <p className="font-medium">{store.name}</p>
                      <p className="text-neutral-500">Deliver now</p>
                    </div>
                  </div>
                </div>

                <div className="border-t pt-3">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium">Order summary</p>
                    <button
                      type="button"
                      onClick={() => setScreen('menu')}
                      className="text-xs font-medium text-emerald-600"
                    >
                      Add items
                    </button>
                  </div>
                  <ul className="mt-2 space-y-2">
                    {lines.map((line) => (
                      <li key={line.product.externalId} className="flex gap-2 text-sm">
                        <span className="flex h-6 min-w-7 items-center justify-center rounded border px-1 text-xs">
                          {line.quantity}×
                        </span>
                        <div className="flex-1">
                          <div className="flex justify-between gap-2">
                            <button
                              type="button"
                              onClick={() => openItem(line.product)}
                              className="text-left font-medium hover:text-emerald-700"
                            >
                              {line.product.name}
                            </button>
                            <span>{formatCents(lineUnitCents(line) * line.quantity)}</span>
                          </div>
                          {line.modifiers.map((m) => (
                            <p key={m.externalId} className="text-xs text-neutral-500">
                              + {m.name}
                            </p>
                          ))}
                          {line.notes && (
                            <p className="text-xs text-amber-700">“{line.notes}”</p>
                          )}
                        </div>
                        <button
                          type="button"
                          aria-label={`Remove ${line.product.name}`}
                          onClick={() => sim.removeFromBasket(line.product.externalId)}
                          className="self-start text-neutral-400 hover:text-destructive"
                        >
                          <Trash2 className="size-4" />
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="space-y-1 border-t pt-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-neutral-500">Subtotal</span>
                    <span>{formatCents(totals.subtotalCents)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-neutral-500">Delivery Fee</span>
                    <span>{formatCents(totals.deliveryFeeCents)}</span>
                  </div>
                </div>

                <div className="flex items-center justify-between border-t pt-3">
                  <div className="text-sm">
                    <p className="font-medium">
                      {options.cutlery ? 'Cutlery requested' : 'No cutlery requested'}
                    </p>
                    <p className="text-xs text-neutral-500">
                      {options.cutlery
                        ? 'Single-use cutlery will be included.'
                        : 'Thanks for reducing single-use plastic!'}
                    </p>
                  </div>
                  <Switch
                    checked={options.cutlery}
                    onCheckedChange={sim.setCutlery}
                    aria-label="Request cutlery"
                  />
                </div>
              </div>

              <div className="space-y-3 border-t bg-neutral-50 p-4">
                <div className="flex items-center justify-between font-semibold">
                  <span>Total (incl. Tax)</span>
                  <span>{formatCents(totals.totalCents)}</span>
                </div>
                <Button
                  type="button"
                  className="h-11 w-full bg-emerald-600 text-base text-white hover:bg-emerald-600/90"
                  disabled={lines.length === 0 || sim.sending}
                  onClick={sim.placeOrder}
                >
                  {sim.sending ? <Loader2 className="animate-spin" /> : null}
                  {sim.sending ? 'Placing…' : 'Place Order'}
                </Button>
                <div className="flex items-center justify-between text-xs text-neutral-500">
                  <span className="font-mono">order id: {sim.orderId}</span>
                  <button
                    type="button"
                    onClick={sim.newOrderId}
                    className="inline-flex items-center gap-1 text-neutral-600 hover:text-neutral-900"
                  >
                    <RefreshCw className="size-3" /> new id
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
