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
  sku: string;
  weight_kg: number;
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
  "Shirts",
  "Linen Pants",
  "Jeans",
  "T-Shirts",
  "Oversized T-Shirts",
  "Hoodies",
  "Cargo Pants",
  "Baggy Pants",
  "Jackets",
  "Sweatshirts",
  "Tracksuits",
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
  shiprocket_sync_status: "pending" | "processing" | "success" | "failed";
  shiprocket_order_id: string | null;
  shiprocket_shipment_id: string | null;
  shiprocket_awb: string | null;
  shiprocket_courier: string | null;
  shiprocket_tracking_url: string | null;
  shiprocket_tracking_status: string | null;
  shiprocket_error: string | null;
  shiprocket_retry_count: number;
  order_items?: OrderItem[];
};

export type ShippingSettings = {
  pickup_location: string;
  package_length_cm: number;
  package_breadth_cm: number;
  package_height_cm: number;
  default_weight_kg: number;
};

export function formatINR(value: number) {
  return "₹" + Math.round(value).toLocaleString("en-IN");
}

export function effectivePrice(p: Pick<Product, "price" | "discount_price">) {
  return p.discount_price != null && p.discount_price < p.price ? p.discount_price : p.price;
}
