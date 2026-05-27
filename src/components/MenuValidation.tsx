import { CheckCircle2 } from 'lucide-react'
import type { Simulator } from '@/hooks/useOrderSimulator'
import { formatCents } from '@/lib/money'

/**
 * Mirrors the "Menu Validation" idea: a flat view of every item the simulator can
 * send for the selected channel and the external id the backend resolves it by.
 * Anything outside this list would be accepted at ingestion but fail to translate.
 */
export function MenuValidation({ sim }: { sim: Simulator }) {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold tracking-tight">Menu validation</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          These are the {sim.platform.label} ids the backend maps to internal products,
          modifiers and stores (via <code className="text-xs">platform_mappings</code>). The
          simulator only offers mapped items so every order translates and persists.
        </p>
      </div>

      {sim.platform.stores.map((store) => (
        <div key={store.externalId} className="overflow-hidden rounded-lg border">
          <div className="flex items-center justify-between gap-2 border-b bg-muted/40 px-4 py-2">
            <span className="font-medium">{store.name}</span>
            <span className="font-mono text-xs text-muted-foreground">
              store · {store.externalId}
            </span>
          </div>
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
              {store.products.flatMap((product) => [
                <tr key={product.externalId} className="border-b">
                  <td className="px-4 py-2 text-muted-foreground">Product</td>
                  <td className="px-4 py-2 font-medium">{product.name}</td>
                  <td className="px-4 py-2 font-mono text-xs">{product.externalId}</td>
                  <td className="px-4 py-2 text-right">{formatCents(product.basePriceCents)}</td>
                  <td className="px-4 py-2">
                    <CheckCircle2 className="ml-auto size-4 text-emerald-600" />
                  </td>
                </tr>,
                ...product.modifiers.map((m) => (
                  <tr key={m.externalId} className="border-b last:border-0">
                    <td className="px-4 py-2 pl-8 text-muted-foreground">↳ Modifier</td>
                    <td className="px-4 py-2">{m.name}</td>
                    <td className="px-4 py-2 font-mono text-xs">{m.externalId}</td>
                    <td className="px-4 py-2 text-right">+{formatCents(m.priceCents)}</td>
                    <td className="px-4 py-2">
                      <CheckCircle2 className="ml-auto size-4 text-emerald-600" />
                    </td>
                  </tr>
                )),
              ])}
            </tbody>
          </table>
        </div>
      ))}
    </div>
  )
}
