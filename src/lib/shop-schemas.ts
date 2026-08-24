import { z } from "zod";
import { ORDER_STATUSES } from "./types";

export const PRODUCT_COLUMNS =
  "id, name, description, price, discount_price, category, images, sizes, colors, stock, created_at";

export const idSchema = z.object({ id: z.string().uuid() });

export const orderNumberSchema = z.object({
  orderNumber: z.string().trim().min(4).max(40),
});

export const checkoutSchema = z.object({
  customer_name: z.string().trim().min(2).max(80),
  phone: z
    .string()
    .trim()
    .regex(/^[6-9]\d{9}$/, "Enter a valid 10-digit Indian mobile number"),
  email: z.string().trim().email().max(160),
  address: z.string().trim().min(8).max(300),
  city: z.string().trim().min(2).max(60),
  state: z.string().trim().min(2).max(60),
  pincode: z
    .string()
    .trim()
    .regex(/^\d{6}$/, "Enter a valid 6-digit pincode"),
  items: z
    .array(
      z.object({
        product_id: z.string().uuid(),
        quantity: z.number().int().min(1).max(10),
        size: z.string().max(20).nullable(),
        color: z.string().max(40).nullable(),
      }),
    )
    .min(1)
    .max(30),
});

export const productSchema = z.object({
  id: z.string().uuid().nullable().default(null),
  name: z.string().trim().min(2).max(120),
  description: z.string().trim().max(2000).default(""),
  price: z.number().min(1).max(1000000),
  discount_price: z.number().min(0).max(1000000).nullable(),
  category: z.string().trim().min(2).max(60),
  images: z.array(z.string().trim().min(1).max(500)).max(6),
  sizes: z.array(z.string().trim().min(1).max(20)).max(20),
  colors: z.array(z.string().trim().min(1).max(40)).max(20),
  stock: z.number().int().min(0).max(100000),
});

export const orderStatusSchema = z.object({
  id: z.string().uuid(),
  status: z.enum(ORDER_STATUSES as [string, ...string[]]),
});

export type CheckoutInput = z.infer<typeof checkoutSchema>;
export type ProductInput = z.infer<typeof productSchema>;
