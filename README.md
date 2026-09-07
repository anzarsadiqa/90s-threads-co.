# 90s Threads Co.

Build 90'S CLOTHING — Basic E-commerce Website

Build a complete, responsive clothing e-commerce website for 90'S CLOTHING.

IMPORTANT:

Keep this project lightweight and simple.

Build only essential/basic features.

Do NOT add advanced features that consume unnecessary credits.

Do NOT rebuild the same feature multiple times.

Use clean, reusable components.

Make the website fully functional, not just a visual mockup.

Use sample products and images so the website looks complete.

If something is not essential for a basic store, skip it.

DESIGN

Create a premium 90s vintage streetwear aesthetic.

Style:

90s vintage + modern streetwear

Premium but bold

Slightly retro typography

Strong product photography

Clean layouts

Subtle vintage/grunge details

Smooth but lightweight animations

Mobile-first responsive design

Take general inspiration from modern Indian fashion stores such as SNITCH for usability and product presentation, but DO NOT copy its branding, layout, text, images, or design.

Brand:
90'S CLOTHING

Create a simple text/logo treatment for the brand if no logo is provided.

PAGES

Create these essential pages:

Home

Shop

Product Details

Cart

Checkout

Order Confirmation

About

Contact

FAQ

HOME PAGE

Include:

Announcement bar

Header/navbar

Brand logo/name

Search

Cart icon

Hero section with strong 90s streetwear imagery

"Shop Now" CTA

Featured categories

New Arrivals

Best Sellers

Promotional banner

Short brand story

Product grid

Customer reviews using clearly labeled demo/sample content

Footer

Use high-quality fashion placeholder/sample images if actual brand images are not available.

SHOP

Include:

Product grid

Category filter

Size filter

Price filter

Search

Sort by:

Newest

Price low to high

Price high to low

Product cards with:

Image

Name

Price

Discount price where applicable

Available sizes

Quick Add

Keep filtering simple and reliable.

PRODUCTS

Create around 10-12 realistic SAMPLE clothing products.

Example categories:

Oversized T-Shirts

Graphic Tees

Baggy Jeans

Cargo Pants

Hoodies

Jackets

Each product should have:

Product name

Images

Price

Discount price if applicable

Description

Available sizes

Available colors

Stock status

Quantity selector

Add to Cart

Use realistic sample Indian pricing in ₹.

Make all sample products easy to replace later.

CART

Implement a working cart.

Features:

Add product

Select size/color

Change quantity

Remove product

Subtotal

Total

Continue shopping

Checkout button

Persist cart locally so refreshing the page does not immediately empty it.

CHECKOUT

Keep checkout simple.

Fields:

Full name

Mobile number

Email

Address

City

State

Pincode

Payment method:

Cash on Delivery (COD)

Do not implement online payment yet.

Add basic form validation.

After successful order submission, show an Order Confirmation page with an order number.

SUPABASE

Connect the project to Supabase.

Use Supabase for the basic backend.

Create/use these basic tables:

products

id

name

description

price

discount_price

category

images

sizes

colors

stock

created_at

orders

id

order_number

customer_name

phone

email

address

city

state

pincode

total_amount

payment_method

status

created_at

order_items

id

order_id

product_id

product_name

quantity

size

color

price

Use Supabase Storage if needed for product images.

IMPORTANT:
Do not expose secret Supabase service-role keys in frontend code.

Use environment variables for Supabase configuration.

SIMPLE ADMIN PANEL

Create a basic /admin section.

Admin should be able to:

View products

Add product

Edit product

Delete product

Change price

Change discount price

Change stock

Change images

Change sizes/colors

View orders

Change order status

Basic order statuses:

Pending

Confirmed

Shipped

Delivered

Cancelled

Keep the admin panel simple. No advanced analytics.

Protect admin functionality with Supabase authentication/RLS where practical.

IMAGES

Use attractive sample fashion images for:

Hero

Categories

Products

Banners

Prefer consistent 90s vintage streetwear photography.

Do not use copyrighted brand/product images from SNITCH or other brands.

Keep image loading optimized.

NAVIGATION

Header:

90'S CLOTHING logo | Home | Shop | Categories | About | Contact | Search | Cart

Mobile:

Use a clean hamburger menu.

FOOTER

Include:

90'S CLOTHING

About

Shop

Contact

FAQ

Shipping information

Privacy Policy

Terms

Instagram placeholder

Copyright

BASIC QUALITY

Before finishing:

Fix broken links

Fix console errors

Fix mobile layout

Make buttons functional

Make cart functional

Make checkout functional

Make Supabase connection functional

Make admin CRUD functional

Check product images

Check empty states

Check loading states

Check error states

Do NOT add unnecessary advanced features.

FINAL REQUIREMENT

The result must feel like a real premium 90s vintage clothing store, not an AI-generated template.

Prioritize:

Working e-commerce flow

Good visual design

Mobile responsiveness

Supabase connection

Basic admin management

Sample products/images

Clean, maintainable code

Build the complete basic version first. Do not spend credits on advanced features.

This project was built with [Lovable](https://lovable.dev).

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/0cab1ae0-1c82-4b6e-b462-75a11a7c26d4).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
