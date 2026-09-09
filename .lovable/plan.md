# Product images: upload from device instead of pasting links

Today the admin product form has a single "Image URLs" text box where links must be typed or pasted. This replaces it with real image picking.

## What the admin will see

In the New/Edit product form, the "Image URLs" field is replaced by an **Images** section:

- An "Upload images" button that opens the device file picker (photos/folder), accepting multiple images at once.
- A "Choose from gallery" option that shows images already uploaded to the store, so the same photo can be reused across products.
- Thumbnails of the product's selected images, each with a remove button; drag-free ordering via a "make first" action so the first image stays the main one.
- Up to 6 images per product, matching the current limit. Files over 5MB or non-image files are rejected with a clear message.

Everything else in the dashboard stays exactly as it is.

## Technical notes

- Create a public storage bucket `product-images` (5MB file size limit) via the storage tool.
- Migration: RLS policies on `storage.objects` for that bucket — public read for everyone; insert/update/delete restricted to `is_admin()`.
- Upload happens client-side with the existing browser Supabase client (`src/integrations/supabase/client.ts`) under path `products/<uuid>.<ext>`; store the resulting public URLs in `products.images`, so `productSchema` and `saveProduct` need no change.
- Gallery listing uses `supabase.storage.from('product-images').list('products')` and maps to public URLs.
- New component `src/components/admin/ProductImagePicker.tsx` holding upload, gallery modal, and thumbnail grid; `src/routes/_authenticated/admin.tsx` swaps the images text input for it and keeps `draft.images` as a string array internally.
- No changes to product/order data, auth, or design tokens.
