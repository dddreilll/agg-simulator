import type { PlatformId } from './catalog'

export type SendStatus = 'accepted' | 'duplicate' | 'rejected' | 'error'

export interface SendResult {
  /** Normalized outcome the UI renders. */
  status: SendStatus
  /** HTTP status code, or 0 if the request never reached the server. */
  httpStatus: number
  /** `<platform>:<orderId>` echoed back by the backend on 200/202. */
  idempotencyKey?: string
  /** BullMQ job id (only on a fresh 202). */
  jobId?: string
  /** Human-readable message for the rejected/error cases. */
  message?: string
  /** Parsed response body (or the thrown error), for the raw view. */
  body: unknown
}

/**
 * POST a platform-native webhook to the backend's ingestion front door.
 *
 * Mirrors the contract in `delivery-platform_backend/src/ingestion`:
 *   202 → accepted + enqueued (fresh order)
 *   200 → duplicate (idempotent replay; not re-enqueued)
 *   400 → unsupported platform / unparseable payload
 *   503 → idempotency store down (only when IDEMPOTENCY_FAIL_OPEN=false)
 */
export async function sendWebhook(
  apiUrl: string,
  platform: PlatformId,
  payload: unknown,
): Promise<SendResult> {
  let res: Response
  try {
    res = await fetch(`${apiUrl}/webhooks/${platform}`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify(payload),
    })
  } catch (err) {
    return {
      status: 'error',
      httpStatus: 0,
      message:
        err instanceof Error
          ? `Could not reach the backend at ${apiUrl}: ${err.message}`
          : 'Network error',
      body: String(err),
    }
  }

  const body: unknown = await res.json().catch(() => null)
  const record = (body ?? {}) as Record<string, unknown>

  if (res.status === 202) {
    return {
      status: 'accepted',
      httpStatus: res.status,
      idempotencyKey: record.idempotencyKey as string | undefined,
      jobId: record.jobId as string | undefined,
      body,
    }
  }
  if (res.status === 200) {
    return {
      status: 'duplicate',
      httpStatus: res.status,
      idempotencyKey: record.idempotencyKey as string | undefined,
      body,
    }
  }
  return {
    status: 'rejected',
    httpStatus: res.status,
    message:
      (record.message as string | undefined) ??
      `Backend responded ${res.status}`,
    body,
  }
}
