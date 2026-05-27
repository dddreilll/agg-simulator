import type { MenuModifier, MenuProduct, PlatformDef } from './catalog'

export interface CartLine {
  product: MenuProduct
  quantity: number
  modifiers: MenuModifier[]
  /** Free-text preparation note → GrabFood `specifications` / Foodpanda `comment`. */
  notes: string
}

export interface CartTotals {
  subtotalCents: number
  deliveryFeeCents: number
  totalCents: number
}

/** Per-unit price including selected modifiers. */
export function lineUnitCents(line: CartLine): number {
  return (
    line.product.basePriceCents +
    line.modifiers.reduce((sum, m) => sum + m.priceCents, 0)
  )
}

export function lineSubtotalCents(line: CartLine): number {
  return lineUnitCents(line) * line.quantity
}

/** Order totals. Delivery fee only applies once there's something in the cart. */
export function cartTotals(lines: CartLine[], platform: PlatformDef): CartTotals {
  const subtotalCents = lines.reduce((sum, l) => sum + lineSubtotalCents(l), 0)
  const deliveryFeeCents = subtotalCents > 0 ? platform.deliveryFeeCents : 0
  return {
    subtotalCents,
    deliveryFeeCents,
    totalCents: subtotalCents + deliveryFeeCents,
  }
}
