# Delivery Operations Platform — Aggregator Simulator

A customer-device simulator for the [delivery operations platform](../delivery-platform_backend),
in the spirit of GrabFood's "Testing Simulator". It lets you build an order the way a
customer would in a delivery app and **place it** — which POSTs the platform's native
order webhook to the backend's ingestion front door (`POST /webhooks/:platform`). From
there the backend dedupes, translates, persists, and broadcasts it to the
[kitchen display](../delivery-platform_frontend).

## Stack

Same as the kitchen display frontend:

- React 19 + TypeScript + Vite
- Tailwind CSS v4 + [shadcn/ui](https://ui.shadcn.com) (radix-nova, neutral)
- `fetch` to the backend's REST webhook (no realtime — this app only *sends*)

## How it works

Pick an **order channel** (GrabFood / Foodpanda) and **partner store**, add items and
options, then hit **Place Order** on the phone mockup. The app builds the chosen
platform's native webhook payload (`src/lib/payload.ts`) and POSTs it to
`${VITE_API_URL}/webhooks/<platform>`. The response is shown inline:

| Backend response | Meaning |
| ---------------- | ------- |
| `202 Accepted`   | New order — enqueued for translation, persistence & kitchen broadcast. |
| `200 Duplicate`  | Idempotent replay of the same order id — not re-enqueued. |
| `400 Rejected`   | Unsupported platform or unparseable payload. |

The **order id** is shown under the Place Order button. Sending it again reproduces the
`200 Duplicate` path; hit **new id** to send the same cart as a fresh order — a quick way
to exercise the backend's idempotency.

> **Menu ⇄ backend mapping.** The catalog in [`src/lib/catalog.ts`](src/lib/catalog.ts)
> uses the exact external ids the backend seed
> ([`delivery-platform_backend/src/database/seed.ts`](../delivery-platform_backend/src/database/seed.ts))
> maps to internal stores/products/modifiers via `platform_mappings`. The simulator only
> offers mapped items, so every order resolves and persists. The **Menu Validation** tab
> lists those ids. Keep the catalog in sync with the seed.

## Configuration

Copy `.env.example` to `.env` and adjust:

| Variable       | Default                 | Purpose          |
| -------------- | ----------------------- | ---------------- |
| `VITE_API_URL` | `http://localhost:3000` | Backend base URL |

## Run

```bash
npm install
npm run dev      # http://localhost:5174
```

The dev server runs on **5174** so it can run alongside the kitchen display (5173). The
backend must be up (see [../delivery-platform_backend](../delivery-platform_backend)) and
seeded (`npm run seed`) for orders to translate. To watch an order land, open the
[kitchen display](../delivery-platform_frontend) for the same store and place an order here.

## Scripts

- `npm run dev` — Vite dev server with HMR
- `npm run build` — typecheck (`tsc -b`) + production build
- `npm run preview` — serve the production build
- `npm run lint` — ESLint

## Project layout

```
src/
  App.tsx                 layout: store picker + App Simulator / Menu Validation tabs
  hooks/
    useOrderSimulator.ts  channel/store/cart/options state + place-order action
  components/
    StorePicker.tsx       channel + partner store selectors
    ControlsPanel.tsx     order-level options (payment) + channel/store summary
    PhonePreview.tsx      in-phone flow: menu list → item detail → basket/Place Order
    ResultPanel.tsx       backend response, raw payload, recent-sends log
    MenuValidation.tsx    the external ids the backend resolves
    ui/                   shadcn primitives (button, card, badge, switch, select)
  lib/
    catalog.ts            simulated menu (mirrors the backend seed mappings)
    cart.ts               cart lines + totals
    payload.ts            builds each platform's native webhook payload
    api.ts                POSTs the webhook; normalizes 202/200/400/5xx
    money.ts              peso formatting + cents↔decimal-string helpers
```
