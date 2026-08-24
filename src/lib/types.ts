export type Product = {
  id: string;
  name: string;
  description: string;
  price: number;
  discount_price: number | null;
  category: string;
  images: string[];
  sizes: string[];
  colors: string[];
  stock: number;
  created_at: string;
};

export type OrderStatus = "Pending" | "Confirmed" | "Shipped" | "Delivered" | "Cancelled";

export const ORDER_STATUSES: OrderStatus[] = [
  "Pending",
  "Confirmed",
  "Shipped",
  "Delivered",
  "Cancelled",
];

export const CATEGORIES = [
  "Oversized T-Shirts",
  "Graphic Tees",
  "Baggy Jeans",
  "Cargo Pants",
  "Hoodies",
  "Jackets",
] as const;

export type OrderItem = {
  id: string;
  product_name: string;
  quantity: number;
  size: string | null;
  color: string | null;
  price: number;
};

export type Order = {
  id: string;
  order_number: string;
  customer_name: string;
  phone: string;
  email: string;
  address: string;
  city: string;
  state: string;
  pincode: string;
  total_amount: number;
  payment_method: string;
  status: string;
  created_at: string;
  order_items?: OrderItem[];
};

export function formatINR(value: number) {
  return "₹" + Math.round(value).toLocaleString("en-IN");
}

export function effectivePrice(p: Pick<Product, "price" | "discount_price">) {
  return p.discount_price != null && p.discount_price < p.price ? p.discount_price : p.price;
}
