# 90'S CLOTHING — Basic E-commerce Store

A complete, working storefront with a 90s vintage streetwear look, real cart/checkout flow, Lovable Cloud backend, and a simple admin panel.

## Design direction

- Premium 90s vintage streetwear: warm off-white paper base, deep charcoal/ink text, one bold accent (faded red/orange), subtle grain and halftone texture.
- Retro-condensed display type for headings (bold, slightly compressed), clean sans for body.
- Big product imagery, tight grids, thin rules, uppercase micro-labels, minimal motion (fade/rise on scroll, hover image swap).
- Mobile-first: hamburger nav, sticky cart, 2-up product grid on phones.

## Pages

| Route | Contents |
| --- | --- |
| `/` | Announcement bar, header, hero + Shop Now, featured categories, New Arrivals, Best Sellers, promo banner, brand story, sample reviews, footer |
| `/shop` | Product grid, category/size/price filters, search, sort (newest, price asc/desc), Quick Add |
| `/product/$id` | Gallery, price + discount, description, size/color pick, quantity, stock status, Add to Cart |
| `/cart` | Line items with size/color, qty change, remove, subtotal/total, continue shopping, checkout |
| `/checkout` | Name, mobile, email, address, city, state, pincode, COD only, validated with zod |
| `/order/$orderNumber` | Confirmation with order number and summary |
| `/about`, `/contact`, `/faq` | Brand story, contact form, FAQ accordion |
| `/shipping`, `/privacy`, `/terms` | Short static policy pages linked from footer |
| `/admin` | Login-gated products + orders management |

## Backend (Lovable Cloud)

Tables: `products`, `orders`, `order_items` exactly as specified, plus `user_roles` (separate table, `has_role()` security-definer function) for admin checks.

- Public: read products only.
- Order placement: a server function inserts the order + items, generates the order number, and computes totals server-side from product rows (prices are never trusted from the client).
- Admin: authenticated + `admin` role required for product CRUD and order status updates, enforced by RLS and server-side role checks.
- 10–12 sample products seeded via migration INSERTs (oversized tees, graphic tees, baggy jeans, cargos, hoodies, jackets) with ₹ pricing.

## Cart

Client-side cart in localStorage (survives refresh), keyed by product + size + color. No cart tables — keeps it lightweight.

## Admin panel

- Email/password sign-in at `/admin` (Cloud auth). First admin role granted directly in the database.
- Products: list, add, edit (name, price, discount, stock, images, sizes, colors, category), delete.
- Orders: list with customer + total, change status among Pending / Confirmed / Shipped / Delivered / Cancelled.
- No analytics, no charts.

## Images

Generate a small, reused set: 1 hero, 3 category tiles, 1 promo banner, and one image per sample product (~12). Consistent 90s streetwear photography look, lazy-loaded, no brand-owned imagery.

## Technical notes

- TanStack Start file routes; shared `Header`, `Footer`, `ProductCard`, `PriceTag`, `Section` components.
- TanStack Query for reads via route loaders; `createServerFn` for order creation and admin writes.
- Per-route `head()` metadata (title, description, og tags).
- Empty/loading/error states on shop, product, cart, and admin lists.
- No online payments, no wishlist, no reviews backend, no coupons.
