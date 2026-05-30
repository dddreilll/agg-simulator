import { CheckCircle2, Loader2, UtensilsCrossed } from 'lucide-react'
import type { Simulator } from '@/hooks/useOrderSimulator'
import { formatCents } from '@/lib/money'

/**
 * Flat view of every product the simulator can send for the selected store,
 * with the platform external id the backend resolves it by.
 * Products are fetched live from GET /catalog/products/by-platform.
 */
export function MenuValidation({ sim }: { sim: Simulator }) {
  const { products, productsLoading, productsError, platform, store } = sim

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold tracking-tight">Menu validation</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Products fetched from the backend for{' '}
          <span className="font-medium">{platform.label}</span> ·{' '}
          <span className="font-medium">{store.name}</span> (
          <code className="text-xs">{store.externalId}</code>). Every order the simulator
          places uses these external ids — anything outside this list would fail to
          translate.
        </p>
      </div>

      <div className="overflow-hidden rounded-lg border">
        <div className="flex items-center justify-between gap-2 border-b bg-muted/40 px-4 py-2">
          <span className="font-medium">{store.name}</span>
          <span className="font-mono text-xs text-muted-foreground">
            store · {store.externalId}
          </span>
        </div>

        {productsLoading ? (
          <div className="flex items-center justify-center gap-2 py-10 text-sm text-muted-foreground">
            <Loader2 className="size-4 animate-spin" />
            Loading products…
          </div>
        ) : productsError ? (
          <div className="py-10 text-center text-sm text-destructive">{productsError}</div>
        ) : products.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-2 py-10 text-sm text-muted-foreground">
            <UtensilsCrossed className="size-6" />
            <p>No products found for this platform and store.</p>
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b text-left text-xs text-muted-foreground">
                <th className="px-4 py-2 font-medium">Type</th>
                <th className="px-4 py-2 font-medium">Name</th>
                <th className="px-4 py-2 font-medium">External id</th>
                <th className="px-4 py-2 text-right font-medium">Price</th>
                <th className="px-4 py-2" />
              </tr>
            </thead>
            <tbody>
              {products.map((product) => (
                <tr key={product.externalId} className="border-b last:border-0">
                  <td className="px-4 py-2 text-muted-foreground">Product</td>
                  <td className="px-4 py-2 font-medium">{product.name}</td>
                  <td className="px-4 py-2 font-mono text-xs">{product.externalId}</td>
                  <td className="px-4 py-2 text-right">{formatCents(product.basePriceCents)}</td>
                  <td className="px-4 py-2">
                    <CheckCircle2 className="ml-auto size-4 text-emerald-600" />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}
