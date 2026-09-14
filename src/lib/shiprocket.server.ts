import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/integrations/supabase/types";

const API_BASE = "https://apiv2.shiprocket.in/v1/external";
const TOKEN_TTL_MS = 240 * 60 * 60 * 1000;
const TOKEN_EXPIRY_SAFETY_MS = 5 * 60 * 1000;

let cachedToken: { value: string; expiresAt: number } | null = null;
let authenticationRequest: Promise<string> | null = null;

type AdminClient = SupabaseClient<Database>;

type CreateResponse = {
  order_id?: number | string;
  shipment_id?: number | string;
  status?: string;
};

type AwbResponse = {
  response?: {
    data?: {
      awb_code?: string;
      courier_name?: string;
    };
  };
};

export async function syncOrderToShiprocket(supabase: AdminClient, orderId: string) {
  const email = process.env["SHIPROCKET_EMAIL"];
  const password = process.env["SHIPROCKET_PASSWORD"];
  if (!email || !password) throw new Error("Shiprocket credentials are not configured.");

  const { data: claimed, error: claimError } = await supabase
    .from("orders")
    .update({
      shiprocket_sync_status: "processing",
      shiprocket_last_attempt_at: new Date().toISOString(),
      shiprocket_error: null,
    })
    .eq("id", orderId)
    .in("shiprocket_sync_status", ["pending", "failed"])
    .is("shiprocket_order_id", null)
    .select("*")
    .maybeSingle();
  if (claimError) throw new Error(claimError.message);

  if (!claimed) {
    const { data: existing, error } = await supabase
      .from("orders")
      .select("shiprocket_sync_status, shiprocket_order_id, shiprocket_shipment_id, shiprocket_awb")
      .eq("id", orderId)
      .maybeSingle();
    if (error) throw new Error(error.message);
    if (!existing) throw new Error("Order not found.");
    return { ok: true, duplicate: true, ...existing };
  }

  try {
    const [{ data: items, error: itemsError }, { data: settings, error: settingsError }] =
      await Promise.all([
        supabase
          .from("order_items")
          .select("product_id, product_name, quantity, price, products(sku, weight_kg)")
          .eq("order_id", orderId),
        supabase.from("shipping_settings").select("*").eq("id", true).single(),
      ]);
    if (itemsError) throw new Error(itemsError.message);
    if (settingsError) throw new Error(settingsError.message);
    if (!items?.length) throw new Error("This order has no items.");

    const weight = items.reduce((sum, item) => {
      const product = Array.isArray(item.products) ? item.products[0] : item.products;
      return sum + Number(product?.weight_kg || settings.default_weight_kg) * item.quantity;
    }, 0);
    const orderItems = items.map((item) => {
      const product = Array.isArray(item.products) ? item.products[0] : item.products;
      return {
        name: item.product_name,
        sku:
          product?.sku ||
          `90S-${String(item.product_id).replaceAll("-", "").slice(0, 12).toUpperCase()}`,
        units: item.quantity,
        selling_price: Number(item.price),
      };
    });

    const created = await requestShiprocket<CreateResponse>(email, password, "/orders/create/adhoc", {
      order_id: claimed.order_number,
      order_date: new Date(claimed.created_at || Date.now())
        .toISOString()
        .slice(0, 16)
        .replace("T", " "),
      pickup_location: settings.pickup_location,
      billing_customer_name: claimed.customer_name,
      billing_last_name: "",
      billing_address: claimed.address,
      billing_city: claimed.city,
      billing_pincode: Number(claimed.pincode),
      billing_state: claimed.state,
      billing_country: "India",
      billing_email: claimed.email,
      billing_phone: claimed.phone,
      shipping_is_billing: true,
      order_items: orderItems,
      payment_method: "COD",
      sub_total: Number(claimed.total_amount),
      length: Number(settings.package_length_cm),
      breadth: Number(settings.package_breadth_cm),
      height: Number(settings.package_height_cm),
      weight: Math.max(weight, Number(settings.default_weight_kg)),
    });
    if (!created.order_id || !created.shipment_id) {
      throw new Error("Shiprocket did not return order and shipment IDs.");
    }

    let awb: string | null = null;
    let courier: string | null = null;
    let awbError: string | null = null;
    try {
      const assigned = await requestShiprocket<AwbResponse>(email, password, "/courier/assign/awb", {
        shipment_id: created.shipment_id,
      });
      awb = assigned.response?.data?.awb_code || null;
      courier = assigned.response?.data?.courier_name || null;
    } catch (error) {
      awbError = safeError(error);
    }

    const now = new Date().toISOString();
    const { error: updateError } = await supabase
      .from("orders")
      .update({
        shiprocket_sync_status: "success",
        shiprocket_order_id: String(created.order_id),
        shiprocket_shipment_id: String(created.shipment_id),
        shiprocket_awb: awb,
        shiprocket_courier: courier,
        shiprocket_tracking_status: created.status || "NEW",
        shiprocket_error: awbError,
        shiprocket_synced_at: now,
        shiprocket_updated_at: now,
      })
      .eq("id", orderId);
    if (updateError) throw new Error(updateError.message);
    return { ok: true, duplicate: false, orderId: String(created.order_id), shipmentId: String(created.shipment_id), awb, courier };
  } catch (error) {
    const message = safeError(error);
    const { data: current } = await supabase
      .from("orders")
      .select("shiprocket_retry_count")
      .eq("id", orderId)
      .maybeSingle();
    await supabase
      .from("orders")
      .update({
        shiprocket_sync_status: "failed",
        shiprocket_error: message,
        shiprocket_retry_count: Number(current?.shiprocket_retry_count || 0) + 1,
        shiprocket_updated_at: new Date().toISOString(),
      })
      .eq("id", orderId);
    throw new Error(message);
  }
}

async function authenticate(email: string, password: string) {
  if (cachedToken && cachedToken.expiresAt > Date.now()) return cachedToken.value;
  if (authenticationRequest) return authenticationRequest;

  authenticationRequest = (async () => {
    const response = await fetch(`${API_BASE}/auth/login`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ email: email.trim(), password }),
    });
    const responseText = await response.text();
    const body = parseShiprocketBody<{ token?: string; message?: string }>(responseText);
    if (!response.ok || !body.token) {
      if (response.status === 403 && responseText.trimStart().startsWith("<")) {
        throw new Error(
          "Shiprocket blocked this server connection (403). Ask Shiprocket support to unblock API access, then retry.",
        );
      }
      throw new Error(body.message || `Shiprocket authentication failed (${response.status}).`);
    }
    cachedToken = {
      value: body.token,
      expiresAt: Date.now() + TOKEN_TTL_MS - TOKEN_EXPIRY_SAFETY_MS,
    };
    return body.token;
  })();

  try {
    return await authenticationRequest;
  } finally {
    authenticationRequest = null;
  }
}

async function requestShiprocket<T>(
  email: string,
  password: string,
  path: string,
  payload: unknown,
): Promise<T> {
  const token = await authenticate(email, password);
  try {
    return await sendShiprocketRequest<T>(token, path, payload);
  } catch (error) {
    if (!(error instanceof ShiprocketHttpError) || error.status !== 401) throw error;

    if (cachedToken?.value === token) cachedToken = null;
    const refreshedToken = await authenticate(email, password);
    return sendShiprocketRequest<T>(refreshedToken, path, payload);
  }
}

async function sendShiprocketRequest<T>(token: string, path: string, payload: unknown): Promise<T> {
  const response = await fetch(`${API_BASE}${path}`, {
    method: "POST",
    headers: { authorization: `Bearer ${token}`, "content-type": "application/json" },
    body: JSON.stringify(payload),
  });
  const body = (await response.json().catch(() => ({}))) as T & { message?: string };
  if (!response.ok) {
    throw new ShiprocketHttpError(
      response.status,
      body.message || `Shiprocket request failed (${response.status}).`,
    );
  }
  return body;
}

class ShiprocketHttpError extends Error {
  constructor(
    readonly status: number,
    message: string,
  ) {
    super(message);
    this.name = "ShiprocketHttpError";
  }
}

function parseShiprocketBody<T extends object>(value: string): T {
  try {
    return JSON.parse(value) as T;
  } catch {
    return {} as T;
  }
}

export function safeError(error: unknown) {
  return (error instanceof Error ? error.message : "Shiprocket sync failed.")
    .replace(/[\r\n]+/g, " ")
    .slice(0, 500);
}