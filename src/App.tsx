import { useState } from 'react'
import { Smartphone } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { StorePicker } from '@/components/StorePicker'
import { ControlsPanel } from '@/components/ControlsPanel'
import { PhonePreview } from '@/components/PhonePreview'
import { ResultPanel } from '@/components/ResultPanel'
import { MenuValidation } from '@/components/MenuValidation'
import { useOrderSimulator } from '@/hooks/useOrderSimulator'

const BACKEND_KEY = 'agg_backend_url'

type TestState = 'idle' | 'testing' | 'ok' | 'error'

function cleanUrl(s: string) {
  return s.trim().replace(/\/+$/, '')
}

async function pingBackend(url: string): Promise<void> {
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), 6000)
  try {
    const res = await fetch(`${url}/healthz`, { signal: controller.signal })
    if (!res.ok) throw new Error(`Server returned ${res.status}`)
  } finally {
    clearTimeout(timer)
  }
}

type Tab = 'simulator' | 'validation'

const TABS: { id: Tab; label: string }[] = [
  { id: 'simulator', label: 'App Simulator' },
  { id: 'validation', label: 'Menu Validation' },
]

function App() {
  const [apiUrl, setApiUrl] = useState(() => localStorage.getItem(BACKEND_KEY) ?? '')
  const [urlInput, setUrlInput] = useState(apiUrl)
  const [tab, setTab] = useState<Tab>('simulator')
  const [testState, setTestState] = useState<TestState>('idle')
  const [testError, setTestError] = useState('')

  const sim = useOrderSimulator(apiUrl)

  function resetSettings() {
    localStorage.removeItem(BACKEND_KEY)
    setApiUrl('')
    setUrlInput('')
    setTestState('idle')
    setTestError('')
  }

  async function testAndApply(url: string) {
    const u = cleanUrl(url)
    if (!u) return

    setTestState('testing')
    setTestError('')

    try {
      await pingBackend(u)
      localStorage.setItem(BACKEND_KEY, u)
      setApiUrl(u)
      setUrlInput(u)
      setTestState('ok')
    } catch (err) {
      const msg =
        err instanceof Error
          ? err.name === 'AbortError'
            ? 'Connection timed out — check the URL and network'
            : err.message
          : 'Unknown error'
      setTestError(msg)
      setTestState('error')
    }
  }

  // First-launch setup screen
  if (!apiUrl) {
    return (
      <div className="flex min-h-svh items-center justify-center bg-background p-4">
        <div className="w-full max-w-sm space-y-6">
          <div className="flex items-center gap-3">
            <span className="flex size-9 items-center justify-center rounded-lg bg-primary text-primary-foreground">
              <Smartphone className="size-5" />
            </span>
            <div>
              <h1 className="text-xl font-bold tracking-tight">Aggregator Simulator</h1>
              <p className="text-sm text-muted-foreground">Configure your backend to continue.</p>
            </div>
          </div>
          <form
            className="space-y-4"
            onSubmit={(e) => {
              e.preventDefault()
              void testAndApply(urlInput)
            }}
          >
            <div className="space-y-1.5">
              <label className="text-sm font-medium" htmlFor="setup-backend-url">
                Backend URL
              </label>
              <input
                id="setup-backend-url"
                value={urlInput}
                onChange={(e) => {
                  setUrlInput(e.target.value)
                  setTestState('idle')
                }}
                placeholder="http://192.168.1.1:3000"
                required
                disabled={testState === 'testing'}
                className="h-9 w-full rounded-md border bg-transparent px-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-50"
              />
            </div>

            {testState === 'error' && (
              <p className="text-sm text-destructive">{testError}</p>
            )}

            <Button type="submit" className="w-full" disabled={testState === 'testing'}>
              {testState === 'testing' ? 'Testing connection…' : 'Connect'}
            </Button>
          </form>
        </div>
      </div>
    )
  }

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
              <p className="hidden text-sm text-muted-foreground sm:block">
                Simulate a customer placing an order on their device.
              </p>
            </div>
          </div>
          <form
            onSubmit={(e) => {
              e.preventDefault()
              void testAndApply(urlInput)
            }}
            className="flex flex-wrap items-center gap-2"
          >
            <label htmlFor="header-backend-url" className="sr-only">
              Backend URL
            </label>
            <input
              id="header-backend-url"
              value={urlInput}
              onChange={(e) => {
                setUrlInput(e.target.value)
                setTestState('idle')
              }}
              placeholder="backend url"
              disabled={testState === 'testing'}
              className="h-9 w-56 rounded-md border bg-transparent px-3 text-xs outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-50"
            />
            <Button type="submit" size="sm" variant="secondary" disabled={testState === 'testing'}>
              {testState === 'testing' ? 'Testing…' : 'Apply'}
            </Button>
            <Button type="button" size="sm" variant="outline" onClick={resetSettings}>
              Clear
            </Button>
            {testState === 'error' && (
              <span className="w-full text-xs text-destructive">{testError}</span>
            )}
          </form>
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
