# Verify the COD order flow on the current backend

## What I checked first

The server-side backend configuration is already present and valid in this environment:

- Backend URL: set, and it points at this project's own backend (ref `ohmtavylsvzwyhgepqdp`)
- Publishable key: set
- Service-role key: set (server-only, never referenced from frontend code)

So there is nothing missing to "fix" in configuration. The service-role key is only loaded inside server handlers (`placeOrder`, `getOrderByNumber`, admin functions) via a dynamic import, so it never reaches the browser bundle. No secret changes are needed and none will be made.

The other project reference you pasted (`amjgjismsqgyinilezzb`) will be ignored, per your instruction to keep the current backend.

## Plan: end-to-end verification only

1. Open the storefront, add one product to the cart.
2. Complete the COD checkout form and place a single test order.
3. Confirm the confirmation page shows the order number and total.
4. Query the database to confirm one new row in `orders` and the matching rows in `order_items` (order number, total, items, sizes/colours, prices).
5. Sign in as the admin account and confirm the order appears in the Admin → Orders tab with the correct customer details and status.
6. Remove the test order and its items so your live data stays clean, and confirm the deletion.

## If something fails

Only the specific broken step gets fixed, with the smallest possible change. Examples of what a failure would point to and how it would be handled:

- Insert error on `orders`/`order_items`: correct the insert payload or column mismatch in `src/lib/shop.functions.ts`.
- Order not visible in Admin: correct the admin read path in `src/lib/admin.functions.ts` / the admin route query.
- A configuration read error surfacing at runtime: re-bind the backend environment through Lovable's secure backend configuration tool (no keys typed, shown, or logged).

No redesign, no schema changes, no new tables, no user or role changes, no edits to the working admin auth.
