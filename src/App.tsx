import { useState } from 'react'
import { Smartphone } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { StorePicker } from '@/components/StorePicker'
import { ControlsPanel } from '@/components/ControlsPanel'
import { PhonePreview } from '@/components/PhonePreview'
import { ResultPanel } from '@/components/ResultPanel'
import { MenuValidation } from '@/components/MenuValidation'
import { useOrderSimulator } from '@/hooks/useOrderSimulator'

const API_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:3000'

type Tab = 'simulator' | 'validation'

const TABS: { id: Tab; label: string }[] = [
  { id: 'simulator', label: 'App Simulator' },
  { id: 'validation', label: 'Menu Validation' },
]

function App() {
  const sim = useOrderSimulator(API_URL)
  const [tab, setTab] = useState<Tab>('simulator')

  return (
    <div className="min-h-svh bg-background text-foreground">
      <header className="border-b">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center gap-x-4 gap-y-2 px-4 py-4">
          <div className="mr-auto flex items-center gap-3">
            <span className="flex size-9 items-center justify-center rounded-lg bg-primary text-primary-foreground">
              <Smartphone className="size-5" />
            </span>
            <div>
              <h1 className="text-xl font-bold tracking-tight">Aggregator Simulator</h1>
              <p className="text-sm text-muted-foreground">
                Simulate a customer placing an order on their device.
              </p>
            </div>
          </div>
          <span className="font-mono text-xs text-muted-foreground">
            backend: {API_URL}
          </span>
        </div>
      </header>

      <main className="mx-auto max-w-6xl space-y-6 px-4 py-6">
        <StorePicker sim={sim} />

        <Card>
          <div className="border-b px-4">
            <nav className="-mb-px flex gap-6">
              {TABS.map((t) => (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => setTab(t.id)}
                  className={`border-b-2 px-1 py-2 text-sm font-medium transition-colors ${
                    tab === t.id
                      ? 'border-primary text-primary'
                      : 'border-transparent text-muted-foreground hover:text-foreground'
                  }`}
                >
                  {t.label}
                </button>
              ))}
            </nav>
          </div>
          <CardContent>
            {tab === 'simulator' ? (
              <div className="grid items-start gap-8 lg:grid-cols-[1fr_360px]">
                <ControlsPanel sim={sim} />
                <PhonePreview sim={sim} />
              </div>
            ) : (
              <MenuValidation sim={sim} />
            )}
          </CardContent>
        </Card>

        {tab === 'simulator' && <ResultPanel sim={sim} />}
      </main>
    </div>
  )
}

export default App
