import { createServerFn } from "@tanstack/react-start";
import {
  PRODUCT_COLUMNS,
  checkoutSchema,
  idSchema,
  orderNumberSchema,
} from "./shop-schemas";
import { createPublicClient } from "./supabase-public.server";
import type { Order, Product } from "./types";

export const listProducts = createServerFn({ method: "GET" }).handler(async () => {
  const supabase = createPublicClient();
  const { data, error } = await supabase
    .from("products")
    .select(PRODUCT_COLUMNS)
    .order("created_at", { ascending: false });
  if (error) throw new Error(error.message);
  return (data ?? []) as unknown as Product[];
});

export const getProduct = createServerFn({ method: "GET" })
  .inputValidator((input: { id: string }) => idSchema.parse(input))
  .handler(async ({ data }) => {
    const supabase = createPublicClient();
    const { data: row, error } = await supabase
      .from("products")
      .select(PRODUCT_COLUMNS)
      .eq("id", data.id)
      .maybeSingle();
    if (error) throw new Error(error.message);
    return (row ?? null) as unknown as Product | null;
  });

export const placeOrder = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => checkoutSchema.parse(input))
  .handler(async ({ data }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    const ids = [...new Set(data.items.map((i) => i.product_id))];
    const { data: products, error: productError } = await supabaseAdmin
      .from("products")
      .select("id, name, price, discount_price, stock")
      .in("id", ids);
    if (productError) throw new Error(productError.message);
    if (!products || products.length !== ids.length) {
      throw new Error("Some items in your cart are no longer available.");
    }

    const priced = data.items.map((item) => {
      const product = products.find((p) => p.id === item.product_id)!;
      const unit =
        product.discount_price != null && Number(product.discount_price) < Number(product.price)
          ? Number(product.discount_price)
          : Number(product.price);
      if (product.stock <= 0) throw new Error(`${product.name} is out of stock.`);
      return {
        product_id: product.id,
        product_name: product.name,
        quantity: item.quantity,
        size: item.size,
        color: item.color,
        price: unit,
      };
    });

    const total = priced.reduce((sum, i) => sum + i.price * i.quantity, 0);
    const orderNumber = `90S-${Date.now().toString(36).toUpperCase()}${Math.floor(
      Math.random() * 900 + 100,
    )}`;

    const { data: order, error: orderError } = await supabaseAdmin
      .from("orders")
      .insert({
        order_number: orderNumber,
        customer_name: data.customer_name,
        phone: data.phone,
        email: data.email,
        address: data.address,
        city: data.city,
        state: data.state,
        pincode: data.pincode,
        total_amount: total,
        payment_method: "COD",
        status: "Pending",
      })
      .select("id, order_number")
      .single();
    if (orderError || !order) throw new Error(orderError?.message ?? "Could not place order.");

    const { error: itemsError } = await supabaseAdmin
      .from("order_items")
      .insert(priced.map((i) => ({ ...i, order_id: order.id })));
    if (itemsError) throw new Error(itemsError.message);

    return { order_number: order.order_number, total_amount: total };
  });

export const getOrderByNumber = createServerFn({ method: "GET" })
  .inputValidator((input: { orderNumber: string }) => orderNumberSchema.parse(input))
  .handler(async ({ data }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: order, error } = await supabaseAdmin
      .from("orders")
      .select(
        "id, order_number, customer_name, phone, email, address, city, state, pincode, total_amount, payment_method, status, created_at, order_items(id, product_name, quantity, size, color, price)",
      )
      .eq("order_number", data.orderNumber)
      .maybeSingle();
    if (error) throw new Error(error.message);
    return (order ?? null) as unknown as Order | null;
  });
