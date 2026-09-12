# Automatic Shiprocket integration

## Goal
Keep the existing storefront and COD checkout unchanged while adding reliable, server-side Shiprocket fulfillment through the connected external Supabase project.

## Database updates
- Extend `products` with an admin-managed SKU and packed weight. Existing products receive stable generated SKUs; default packed weight is 0.5 kg until edited.
- Extend `orders` with Shiprocket sync state, retry details, Shiprocket order/shipment identifiers, AWB, courier, tracking URL/status, timestamps, and a retry counter.
- Add one admin-only shipping settings row for the Shiprocket pickup nickname and package dimensions: 16 × 15 × 10 cm.
- Preserve all current products, orders, users, roles, and RLS. No duplicate business tables.

## Automatic order flow
- Keep Supabase as the source of truth and save the website order plus items first.
- Mark the saved order `pending`, then call a secured Supabase Edge Function to create the Shiprocket order.
- Build the Shiprocket payload from trusted Supabase rows, using the stored SKU, price, quantity, 0.5 kg default weight, current package dimensions, COD amount, and configured pickup nickname.
- Use the website order number as the Shiprocket channel order ID so retries cannot create duplicate Shiprocket orders.
- Store Shiprocket IDs and shipping details when successful. On failure, retain the customer order and save a safe error plus retry state.

## Admin controls
- Add SKU and packed-weight fields to the existing product form without redesigning it.
- Show Shiprocket sync state and shipping details inside existing order cards.
- Add an admin-only retry action for pending/failed shipments.
- Add admin-editable package dimensions and pickup nickname to the existing dashboard.

## Tracking sync and security
- Add a secured Shiprocket webhook Edge Function for tracking/status updates and verify a shared webhook secret before accepting changes.
- Keep Shiprocket email, password, tokens, and webhook secret in Supabase secrets only.
- Never expose credentials or service-role access to the browser.

## Verification
- Test database access rules and Edge Function validation without credentials.
- After Shiprocket credentials are securely added, place one COD test order and confirm: Supabase order/items → Shiprocket order/shipment → IDs/status stored → Admin Orders display.
- Confirm a retry does not create a duplicate Shiprocket order and a Shiprocket failure never removes the Supabase order.
