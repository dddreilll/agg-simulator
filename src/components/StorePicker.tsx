import { Select } from '@/components/ui/select'
import type { Simulator } from '@/hooks/useOrderSimulator'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

/** The top "Select a store" card: channel (platform) + partner store. */
export function StorePicker({ sim }: { sim: Simulator }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-primary">Select a store</CardTitle>
      </CardHeader>
      <CardContent className="grid gap-4 sm:grid-cols-2">
        <div className="grid gap-1.5">
          <label htmlFor="channel" className="text-sm font-medium">
            Order channel
          </label>
          <Select
            id="channel"
            value={sim.platformId}
            onChange={(e) => sim.selectPlatform(e.target.value as Simulator['platformId'])}
          >
            {sim.platforms.map((p) => (
              <option key={p.id} value={p.id}>
                {p.label}
              </option>
            ))}
          </Select>
        </div>

        <div className="grid gap-1.5">
          <label htmlFor="store" className="text-sm font-medium">
            Partner store
          </label>
          <Select
            id="store"
            value={sim.store.externalId}
            onChange={(e) => sim.selectStore(e.target.value)}
          >
            {sim.platform.stores.map((s) => (
              <option key={s.externalId} value={s.externalId}>
                {s.name} — {s.externalId}
              </option>
            ))}
          </Select>
        </div>
      </CardContent>
    </Card>
  )
}
