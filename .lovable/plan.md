# New logo + admin sign-in link

## What changes

1. **New logo** — Use the uploaded black-background "90's CLOTHING" image as the site logo, shown in the header, footer and on the sign-in card.
   - Because the new image already has a black background, the logo no longer needs the colour-flipping trick currently applied. The header will show the logo as a black tile, the dark footer keeps showing it as-is.
2. **Admin sign-in link** — Admin login already exists at `/auth` but there's no way to reach it by clicking. Add a small "Admin login" link in the footer's Company column, so you can sign in without typing the address.

Nothing else changes: products, orders, checkout, admin permissions and the store's look stay exactly as they are.

## Technical notes

- Upload `user-uploads://image-3.png` via `lovable-assets create` into `src/assets/logo-black.png.asset.json` and point `src/components/BrandLogo.tsx` at that pointer URL; drop the `invert` behaviour (keep the prop signature tolerant so existing `invert` call sites in `SiteFooter.tsx` don't break, or remove those props).
- Keep the old `src/assets/logo.png` file untouched in case a rollback is wanted.
- `SiteFooter.tsx`: add `<Link to="/auth">Admin login</Link>` in the Company list, same styling as the sibling links.
- No database, auth, or route changes — `/auth` and `/_authenticated/admin` already handle sign-in and admin-role verification.
