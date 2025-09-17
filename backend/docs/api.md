# Digimart Backend API Documentation

This document describes the REST API endpoints exposed by the Digimart backend. All endpoints return JSON unless stated otherwise.

- Base URL (production): `${NEXT_PUBLIC_API_BASE_URL}` or `${NEXT_PUBLIC_BACKEND_URL}`
- Base URL (local): `http://localhost:3001` (adjust to your backend port)
- Authentication: Most public endpoints are open; protected endpoints require Bearer token in `Authorization` header.
- Content-Type: `application/json` unless file uploads.

## Authentication (Store/Mitra)

### Send OTP (register)
- POST `/stores/register`
- Body: `{ "phone_number": "+62812xxxx" }`
- Response: `{ success: boolean, message: string }
`

### Verify OTP (register)
- POST `/stores/register/verify`
- Body: `{ "phone_number": "+62812xxxx", "otp_code": "123456" }`
- Response: `{ success: boolean, data: { token: string, store: {...} } }`

### Send OTP (login)
- POST `/stores/login`
- Body: `{ "phone_number": "+62812xxxx" }`

### Verify OTP (login)
- POST `/stores/login/verify`
- Body: `{ "phone_number": "+62812xxxx", "otp_code": "123456" }`

---

## Products

### List products
- GET `/products?limit=12&page=1&category_id=<id>`
- Response: `{ data: Product[], pagination: { page, limit, total } }`

### Get product by id
- GET `/products/:id`
- Response: `{ data: Product }`

### Search products
- GET `/products/search?keyword=term&limit=10&page=1`
- Response: `{ data: Product[], pagination }`

### Product categories
- GET `/product-categories`
- Response: `{ data: Category[] }`

---

## Services

### List services
- GET `/services?limit=12&page=1&category_id=<id>`
- Response: `{ data: Service[], pagination }`

### Popular services
- GET `/services/popular?limit=8`
- Response: `{ data: Service[], pagination }`

### Get service
- GET `/services/:id`
- Response: `{ data: Service }`

### Service categories & subcategories
- GET `/service-categories`
- GET `/service-categories/:categoryId/subcategories`
- GET `/service-subcategories/:subcategoryId/services`

---

## Auctions

### Active auctions
- GET `/auctions?limit=10&page=1`
- Response: `{ data: Auction[], pagination }`

### Pending auctions
- GET `/auctions/pending?limit=10&page=1`
- Response: `{ data: PendingAuction[], pagination }`

### Auction details
- GET `/auctions/:auctionId`
- Response: `{ data: Auction }`

### Submit bid
- POST `/auctions/:auctionId/bid`
- Body: `{ bidder_name, bidder_phone, bid_amount, user_id? }`
- Response: `{ success: boolean, data?: Bid }`

---

## Orders (Store)

Authorization: `Authorization: Bearer <token>`

### Get store orders
- GET `/orders/store/:storeId?status=all&page=1&limit=10&search=&date=`
- Response: `{ data: Order[], pagination }`

### Update order item status
- PUT `/orders/store/:storeId/item/:itemId/status`
- Body: `{ status: "processing" | "completed" | ... }`

### Refund canceled order item
- POST `/orders/store/:storeId/item/:itemId/refund`

### Order stats
- GET `/orders/store/:storeId/stats`

---

## Finance (Store)

Authorization: `Authorization: Bearer <token>`

### Finance summary
- GET `/finance/store/:storeId`

### Transaction history
- GET `/finance/store/:storeId/transactions?type=all&page=1&limit=20&date_from=&date_to=`

### Create withdrawal
- POST `/finance/store/:storeId/withdrawal`
- Body: `{ amount, bank_name, account_number, account_name }`

### Revenue analytics
- GET `/finance/store/:storeId/analytics?period=monthly|weekly|daily`

---

## Store products (Official/Mitra)

Some endpoints may use `${NEXT_PUBLIC_BACKEND_URL}` directly:

- GET `/store-products?page=1&limit=12` — list store products
- GET `/store-products/categories` — list categories
- GET `/store-products/:id` — product detail

---

## Embed Codes (Store)

Authorization: `Authorization: Bearer <token>`

- GET `/embed/store/:storeId/embed-codes` — list embed codes
- POST `/embed/store/:storeId/embed-codes` — create
- PUT `/embed/store/:storeId/embed-codes/:id` — update
- DELETE `/embed/store/:storeId/embed-codes/:id` — delete
- GET `/embed/public/:embedCode` — public embed meta

---

## QR (Store)

Authorization: `Authorization: Bearer <token>`

- GET `/qr/store/:storeId/scanned` — scanned QR list
- GET `/qr/store/:storeId/stats` — QR stats

---

## Reviews

- GET `/products/:productId/reviews` — list reviews for a product

---

## Midtrans (Payments)

- Client uses Midtrans Snap via `window.snap.pay(token, callbacks)`
- Server should handle Midtrans notifications (webhook) at an endpoint such as `/payments/midtrans/notify` (adjust to your implementation).

Notes:
- Provide `NEXT_PUBLIC_MIDTRANS_CLIENT_KEY` in frontend, and use Server Key (secret) in the backend only.
- Sandbox vs Production is controlled by `NEXT_PUBLIC_MIDTRANS_ENVIRONMENT` (frontend) and server config.

---

## Health Check

- GET `/health` → `{ status: "ok" }`

---

## Error Format

Typical error response:
```json
{ "success": false, "message": "<error message>" }
```

Some list endpoints return empty arrays and basic pagination when backend is unreachable.

---

## Environment Variables (frontend/runtime)

- `NEXT_PUBLIC_API_BASE_URL` — public API base URL used by axios (frontend)
- `NEXT_PUBLIC_BACKEND_URL` — base URL for assets (images) and some public endpoints
- `NEXT_PUBLIC_ASSETS_BASE_URL` — optional base for serving static assets
- `NEXT_PUBLIC_FRONTEND_URL` — public URL of the frontend
- `NEXT_PUBLIC_MIDTRANS_CLIENT_KEY` — Midtrans client key for Snap
- `NEXT_PUBLIC_MIDTRANS_ENVIRONMENT` — `sandbox` or `production`

Build-time helper:
- `SKIP_BUILD_FETCH=true` — used only at build time to avoid network fetch during `next build` (Dockerfile passes this arg). Does not disable lint/type-check.

---

## Changelog
- v1.0: Initial API doc extracted from application usage (`app/lib/api.ts`) and routes inferred from backend usage.
