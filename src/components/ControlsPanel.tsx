import { Select } from '@/components/ui/select'
import type { Simulator } from '@/hooks/useOrderSimulator'

/**
 * The left-hand simulation controls. The menu and checkout now live inside the
 * phone (right); this panel holds the order-level knobs that aren't part of the
 * in-app browsing flow.
 */
export function ControlsPanel({ sim }: { sim: Simulator }) {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold tracking-tight">Simulate the order</h2>
        <p className="mt-1 hidden text-sm text-muted-foreground lg:block">
          Browse the menu and check out on the device to the right, the way a customer would
          in the {sim.platform.label.toLowerCase()} app. Placing the order sends the webhook to
          the backend.
        </p>
      </div>

      <div className="grid gap-1.5">
        <label htmlFor="payment" className="text-sm font-medium">
          Payment
        </label>
        <Select
          id="payment"
          value={sim.options.cashless ? 'cashless' : 'cash'}
          onChange={(e) => sim.setCashless(e.target.value === 'cashless')}
        >
          <option value="cash">Cash on delivery</option>
          <option value="cashless">Cashless (paid online)</option>
        </Select>
        <p className="text-xs text-muted-foreground">
          Maps to the platform payment field the backend translates
          ({sim.options.cashless ? 'paid online' : 'pay on delivery'}).
        </p>
      </div>

      <dl className="space-y-2 rounded-lg border p-4 text-sm">
        <div className="flex justify-between gap-2">
          <dt className="text-muted-foreground">Channel</dt>
          <dd className="font-medium">{sim.platform.label}</dd>
        </div>
        <div className="flex justify-between gap-2">
          <dt className="text-muted-foreground">Store</dt>
          <dd className="font-medium">{sim.store.name}</dd>
        </div>
        <div className="flex justify-between gap-2">
          <dt className="text-muted-foreground">Store id</dt>
          <dd className="font-mono text-xs">{sim.store.externalId}</dd>
        </div>
      </dl>
    </div>
  )
}
