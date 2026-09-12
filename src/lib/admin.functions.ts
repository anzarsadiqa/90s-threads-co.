import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { idSchema, orderStatusSchema, productSchema, shippingSettingsSchema } from "./shop-schemas";
import type { Order, Product, ShippingSettings } from "./types";

export const checkAdmin = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data } = await context.supabase.rpc("is_admin");
    return { isAdmin: Boolean(data) };
  });

export const saveProduct = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => productSchema.parse(input))
  .handler(async ({ data, context }) => {
    const { assertAdmin } = await import("./admin-helpers.server");
    await assertAdmin(context);
    const { id, ...fields } = data;
    const productFields = {
      ...fields,
      sku: fields.sku || `90S-${crypto.randomUUID().replaceAll("-", "").slice(0, 12).toUpperCase()}`,
    };
    if (id) {
      const { error } = await context.supabase.from("products").update(productFields).eq("id", id);
      if (error) throw new Error(error.message);
      return { id };
    }
    const { data: row, error } = await context.supabase
      .from("products")
      .insert(productFields)
      .select("id")
      .single();
    if (error) throw new Error(error.message);
    return { id: row.id as string };
  });

export const deleteProduct = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: { id: string }) => idSchema.parse(input))
  .handler(async ({ data, context }) => {
    const { assertAdmin } = await import("./admin-helpers.server");
    await assertAdmin(context);
    const { error } = await context.supabase.from("products").delete().eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const adminListProducts = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { assertAdmin } = await import("./admin-helpers.server");
    await assertAdmin(context);
    const { data, error } = await context.supabase
      .from("products")
      .select("*")
      .order("created_at", { ascending: false });
    if (error) throw new Error(error.message);
    return (data ?? []) as Product[];
  });

export const adminListOrders = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { assertAdmin } = await import("./admin-helpers.server");
    await assertAdmin(context);
    const { data, error } = await context.supabase
      .from("orders")
      .select("*, order_items(id, product_name, quantity, size, color, price)")
      .order("created_at", { ascending: false });
    if (error) throw new Error(error.message);
    return (data ?? []) as Order[];
  });

export const updateOrderStatus = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => orderStatusSchema.parse(input))
  .handler(async ({ data, context }) => {
    const { assertAdmin } = await import("./admin-helpers.server");
    await assertAdmin(context);
    const { error } = await context.supabase
      .from("orders")
      .update({ status: data.status })
      .eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const retryShiprocketSync = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: { id: string }) => idSchema.parse(input))
  .handler(async ({ data, context }) => {
    const { assertAdmin } = await import("./admin-helpers.server");
    await assertAdmin(context);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { syncOrderToShiprocket } = await import("./shiprocket.server");
    return syncOrderToShiprocket(supabaseAdmin, data.id);
  });

export const getShippingSettings = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { assertAdmin } = await import("./admin-helpers.server");
    await assertAdmin(context);
    const { data, error } = await context.supabase
      .from("shipping_settings")
      .select("*")
      .eq("id", true)
      .single();
    if (error) throw new Error(error.message);
    return data as ShippingSettings;
  });

export const saveShippingSettings = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => shippingSettingsSchema.parse(input))
  .handler(async ({ data, context }) => {
    const { assertAdmin } = await import("./admin-helpers.server");
    await assertAdmin(context);
    const { error } = await context.supabase
      .from("shipping_settings")
      .update(data)
      .eq("id", true);
    if (error) throw new Error(error.message);
    return { ok: true };
  });
