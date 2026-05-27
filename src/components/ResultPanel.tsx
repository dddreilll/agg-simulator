import { CheckCircle2, Copy, XCircle } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import type { Simulator } from '@/hooks/useOrderSimulator'
import type { SendResult } from '@/lib/api'
import { formatCents } from '@/lib/money'

const time = new Intl.DateTimeFormat('en-PH', {
  hour: '2-digit',
  minute: '2-digit',
  second: '2-digit',
  hour12: true,
})

const STATUS: Record<
  SendResult['status'],
  { label: string; variant: 'default' | 'secondary' | 'destructive' }
> = {
  accepted: { label: 'Accepted', variant: 'default' },
  duplicate: { label: 'Duplicate', variant: 'secondary' },
  rejected: { label: 'Rejected', variant: 'destructive' },
  error: { label: 'Error', variant: 'destructive' },
}

export function ResultPanel({ sim }: { sim: Simulator }) {
  const { result, history, payload } = sim

  return (
    <Card>
      <CardHeader>
        <CardTitle>Backend response</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {!result ? (
          <p className="text-sm text-muted-foreground">
            Place an order to POST the webhook to{' '}
            <code className="rounded bg-muted px-1 py-0.5 text-xs">
              /webhooks/{sim.platformId}
            </code>{' '}
            and see the response here.
          </p>
        ) : (
          <div className="space-y-3">
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant={STATUS[result.status].variant}>
                {result.status === 'accepted' || result.status === 'duplicate' ? (
                  <CheckCircle2 />
                ) : (
                  <XCircle />
                )}
                {result.httpStatus > 0 ? `${result.httpStatus} ` : ''}
                {STATUS[result.status].label}
              </Badge>
              {result.status === 'accepted' && (
                <span className="text-sm text-muted-foreground">
                  Enqueued for translation, persistence & kitchen broadcast.
                </span>
              )}
              {result.status === 'duplicate' && (
                <span className="text-sm text-muted-foreground">
                  Idempotent replay — not re-enqueued. Send a new order id to retry.
                </span>
              )}
            </div>

            <dl className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-1 text-sm">
              {result.idempotencyKey && (
                <>
                  <dt className="text-muted-foreground">Idempotency key</dt>
                  <dd className="font-mono text-xs">{result.idempotencyKey}</dd>
                </>
              )}
              {result.jobId && (
                <>
                  <dt className="text-muted-foreground">Job id</dt>
                  <dd className="font-mono text-xs">{result.jobId}</dd>
                </>
              )}
              {result.message && (
                <>
                  <dt className="text-muted-foreground">Message</dt>
                  <dd className="text-destructive">{result.message}</dd>
                </>
              )}
            </dl>
          </div>
        )}

        {/* Raw payload that would be / was sent */}
        <details className="rounded-lg border">
          <summary className="flex cursor-pointer items-center justify-between px-3 py-2 text-sm font-medium">
            <span>Webhook payload</span>
            <button
              type="button"
              className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground"
              onClick={(e) => {
                e.preventDefault()
                navigator.clipboard?.writeText(JSON.stringify(payload, null, 2))
              }}
            >
              <Copy className="size-3" /> copy
            </button>
          </summary>
          <pre className="max-h-72 overflow-auto border-t bg-muted/40 p-3 text-xs leading-relaxed">
            {JSON.stringify(payload, null, 2)}
          </pre>
        </details>

        {/* Send history */}
        {history.length > 0 && (
          <div>
            <p className="mb-2 text-sm font-medium">Recent sends</p>
            <ul className="divide-y rounded-lg border text-sm">
              {history.map((h) => (
                <li key={h.key} className="flex items-center gap-3 px-3 py-2">
                  <Badge variant={STATUS[h.status].variant} className="shrink-0">
                    {h.httpStatus > 0 ? h.httpStatus : '—'}
                  </Badge>
                  <span className="truncate font-mono text-xs">{h.orderId}</span>
                  <span className="ml-auto shrink-0 text-muted-foreground">
                    {formatCents(h.totalCents)}
                  </span>
                  <span className="shrink-0 text-xs text-muted-foreground">
                    {time.format(h.at)}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
