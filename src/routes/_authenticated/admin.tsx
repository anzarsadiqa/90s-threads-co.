import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { Pencil, Plus, Trash2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { PageHeader, StoreLayout } from "@/components/StoreLayout";
import { ProductImagePicker } from "@/components/admin/ProductImagePicker";
import { supabase } from "@/integrations/supabase/client";
import {
  adminListOrders,
  adminListProducts,
  checkAdmin,
  deleteProduct,
  getShippingSettings,
  retryShiprocketSync,
  saveProduct,
  saveShippingSettings,
  updateOrderStatus,
} from "@/lib/admin.functions";
import { CATEGORIES, ORDER_STATUSES, formatINR, type Product, type ShippingSettings } from "@/lib/types";

export const Route = createFileRoute("/_authenticated/admin")({
  head: () => ({
    meta: [
      { title: "Admin Dashboard — 90'S CLOTHING" },
      { name: "description", content: "Manage products and orders for the 90'S Clothing store." },
      { property: "og:title", content: "Admin Dashboard — 90'S CLOTHING" },
      { property: "og:description", content: "Product and order management." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: AdminPage,
});

type Draft = {
  id: string | null;
  name: string;
  description: string;
  price: string;
  discount_price: string;
  category: string;
  images: string;
  sizes: string;
  colors: string;
  stock: string;
  sku: string;
  weight_kg: string;
};

const emptyDraft: Draft = {
  id: null,
  name: "",
  description: "",
  price: "",
  discount_price: "",
  category: CATEGORIES[0],
  images: "",
  sizes: "S, M, L, XL",
  colors: "",
  stock: "10",
  sku: "",
  weight_kg: "0.5",
};

function toDraft(product: Product): Draft {
  return {
    id: product.id,
    name: product.name,
    description: product.description,
    price: String(product.price),
    discount_price: product.discount_price != null ? String(product.discount_price) : "",
    category: product.category,
    images: product.images.join(", "),
    sizes: product.sizes.join(", "),
    colors: product.colors.join(", "),
    stock: String(product.stock),
    sku: product.sku,
    weight_kg: String(product.weight_kg),
  };
}

const list = (value: string) =>
  value
    .split(",")
    .map((v) => v.trim())
    .filter(Boolean);

function AdminPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const verifyAdmin = useServerFn(checkAdmin);
  const fetchProducts = useServerFn(adminListProducts);
  const fetchOrders = useServerFn(adminListOrders);
  const save = useServerFn(saveProduct);
  const remove = useServerFn(deleteProduct);
  const setStatus = useServerFn(updateOrderStatus);
  const retryShipment = useServerFn(retryShiprocketSync);
  const fetchShippingSettings = useServerFn(getShippingSettings);
  const saveShipping = useServerFn(saveShippingSettings);

  const [tab, setTab] = useState<"products" | "orders" | "shipping">("products");
  const [draft, setDraft] = useState<Draft | null>(null);
  const [shippingDraft, setShippingDraft] = useState<ShippingSettings | null>(null);

  const adminCheck = useQuery({ queryKey: ["is-admin"], queryFn: () => verifyAdmin() });
  const isAdmin = adminCheck.data?.isAdmin === true;

  const products = useQuery({
    queryKey: ["admin-products"],
    queryFn: () => fetchProducts(),
    enabled: isAdmin,
  });
  const orders = useQuery({
    queryKey: ["admin-orders"],
    queryFn: () => fetchOrders(),
    enabled: isAdmin,
  });
  const shippingSettings = useQuery({
    queryKey: ["shipping-settings"],
    queryFn: () => fetchShippingSettings(),
    enabled: isAdmin,
  });

  const saveMutation = useMutation({
    mutationFn: (d: Draft) =>
      save({
        data: {
          id: d.id,
          name: d.name,
          description: d.description,
          price: Number(d.price),
          discount_price: d.discount_price ? Number(d.discount_price) : null,
          category: d.category,
          images: list(d.images),
          sizes: list(d.sizes),
          colors: list(d.colors),
          stock: Number(d.stock),
          sku: d.sku,
          weight_kg: Number(d.weight_kg),
        },
      }),
    onSuccess: () => {
      toast.success("Product saved");
      setDraft(null);
      queryClient.invalidateQueries({ queryKey: ["admin-products"] });
      queryClient.invalidateQueries({ queryKey: ["products"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => remove({ data: { id } }),
    onSuccess: () => {
      toast.success("Product deleted");
      queryClient.invalidateQueries({ queryKey: ["admin-products"] });
      queryClient.invalidateQueries({ queryKey: ["products"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const statusMutation = useMutation({
    mutationFn: (input: { id: string; status: string }) => setStatus({ data: input }),
    onSuccess: () => {
      toast.success("Order updated");
      queryClient.invalidateQueries({ queryKey: ["admin-orders"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const retryMutation = useMutation({
    mutationFn: (id: string) => retryShipment({ data: { id } }),
    onSuccess: (result) => {
      if ("error" in result) {
        toast.error(result.error);
      } else {
        toast.success("Shiprocket sync completed");
      }
      queryClient.invalidateQueries({ queryKey: ["admin-orders"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const shippingMutation = useMutation({
    mutationFn: (settings: ShippingSettings) => saveShipping({ data: settings }),
    onSuccess: () => {
      toast.success("Shipping settings saved");
      setShippingDraft(null);
      queryClient.invalidateQueries({ queryKey: ["shipping-settings"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  async function signOut() {
    await queryClient.cancelQueries();
    queryClient.clear();
    await supabase.auth.signOut();
    navigate({ to: "/auth", replace: true });
  }

  if (adminCheck.isLoading) {
    return (
      <StoreLayout>
        <PageHeader title="Admin" />
        <p className="py-20 text-center text-sm text-muted-foreground">Checking access…</p>
      </StoreLayout>
    );
  }

  if (!isAdmin) {
    return (
      <StoreLayout>
        <PageHeader title="Admin" subtitle="This account does not have admin access." />
        <div className="mx-auto max-w-md px-4 py-16 text-center">
          <button
            type="button"
            onClick={signOut}
            className="micro-label bg-ink px-6 py-3 text-paper"
          >
            Sign out
          </button>
        </div>
      </StoreLayout>
    );
  }

  return (
    <StoreLayout>
      <PageHeader title="Admin dashboard" subtitle="Manage products and orders." />
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-ink/10 pb-4">
          <div className="flex gap-2">
            {(["products", "orders", "shipping"] as const).map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => setTab(t)}
                className={`micro-label border px-4 py-2 ${
                  tab === t ? "border-ink bg-ink text-paper" : "border-ink/25"
                }`}
              >
                {t}
              </button>
            ))}
          </div>
          <div className="flex gap-2">
            {tab === "products" && (
              <button
                type="button"
                onClick={() => setDraft(emptyDraft)}
                className="micro-label inline-flex items-center gap-2 bg-accent px-4 py-2 text-accent-foreground"
              >
                <Plus className="size-4" /> New product
              </button>
            )}
            <button
              type="button"
              onClick={signOut}
              className="micro-label border border-ink/25 px-4 py-2"
            >
              Sign out
            </button>
          </div>
        </div>

        {tab === "products" ? (
          <div className="mt-8 overflow-x-auto">
            <table className="w-full min-w-3xl text-left text-sm">
              <thead>
                <tr className="border-b border-ink/15">
                  <th className="micro-label py-3">Product</th>
                  <th className="micro-label py-3">Category</th>
                  <th className="micro-label py-3">Price</th>
                  <th className="micro-label py-3">Stock</th>
                  <th className="micro-label py-3" />
                </tr>
              </thead>
              <tbody>
                {(products.data ?? []).map((product) => (
                  <tr key={product.id} className="border-b border-ink/10">
                    <td className="py-3">
                      <div className="flex items-center gap-3">
                        <img
                          src={product.images[0]}
                          alt=""
                          className="size-10 bg-muted object-cover"
                        />
                        <span className="font-bold uppercase tracking-wide">{product.name}</span>
                      </div>
                    </td>
                    <td className="py-3 text-muted-foreground">{product.category}</td>
                    <td className="py-3">{formatINR(product.price)}</td>
                    <td className="py-3">{product.stock}</td>
                    <td className="py-3">
                      <div className="flex justify-end gap-2">
                        <button
                          type="button"
                          aria-label="Edit product"
                          onClick={() => setDraft(toDraft(product))}
                          className="border border-ink/25 p-2 hover:bg-ink hover:text-paper"
                        >
                          <Pencil className="size-4" />
                        </button>
                        <button
                          type="button"
                          aria-label="Delete product"
                          onClick={() => {
                            if (confirm(`Delete ${product.name}?`)) deleteMutation.mutate(product.id);
                          }}
                          className="border border-ink/25 p-2 hover:bg-destructive hover:text-destructive-foreground"
                        >
                          <Trash2 className="size-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {products.isLoading && (
              <p className="py-10 text-center text-sm text-muted-foreground">Loading products…</p>
            )}
          </div>
        ) : tab === "orders" ? (
          <div className="mt-8 space-y-4">
            {(orders.data ?? []).map((order) => (
              <div key={order.id} className="border border-ink/15 bg-card p-5">
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div>
                    <p className="text-sm font-bold uppercase tracking-wide">
                      {order.order_number} · {order.customer_name}
                    </p>
                    <p className="micro-label mt-1 text-muted-foreground">
                      {order.phone} · {order.city}, {order.state} {order.pincode}
                    </p>
                    <p className="micro-label mt-1 text-muted-foreground">
                      {new Date(order.created_at).toLocaleString("en-IN")}
                    </p>
                    <p className="micro-label mt-2">
                      Shiprocket: {order.shiprocket_sync_status}
                      {order.shiprocket_courier ? ` · ${order.shiprocket_courier}` : ""}
                      {order.shiprocket_awb ? ` · AWB ${order.shiprocket_awb}` : ""}
                    </p>
                    {order.shiprocket_tracking_status && (
                      <p className="micro-label mt-1 text-muted-foreground">Tracking: {order.shiprocket_tracking_status}</p>
                    )}
                    {order.shiprocket_error && (
                      <p className="mt-1 max-w-xl text-xs text-destructive">{order.shiprocket_error}</p>
                    )}
                  </div>
                  <div className="flex items-center gap-3">
                    <p className="text-sm font-bold">{formatINR(order.total_amount)}</p>
                    <select
                      value={order.status}
                      onChange={(e) =>
                        statusMutation.mutate({ id: order.id, status: e.target.value })
                      }
                      className="micro-label border border-ink/25 bg-background px-3 py-2"
                    >
                      {ORDER_STATUSES.map((s) => (
                        <option key={s} value={s}>
                          {s}
                        </option>
                      ))}
                    </select>
                    {(order.shiprocket_sync_status === "pending" || order.shiprocket_sync_status === "failed") && (
                      <button
                        type="button"
                        disabled={retryMutation.isPending}
                        onClick={() => retryMutation.mutate(order.id)}
                        className="micro-label border border-ink/25 px-3 py-2 disabled:opacity-50"
                      >
                        Retry Shiprocket
                      </button>
                    )}
                  </div>
                </div>
                <ul className="mt-4 space-y-1 border-t border-ink/10 pt-3 text-sm text-muted-foreground">
                  {order.order_items?.map((item) => (
                    <li key={item.id}>
                      {item.product_name} — {[item.size, item.color].filter(Boolean).join(" · ")} ×{" "}
                      {item.quantity} · {formatINR(item.price * item.quantity)}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
            {orders.isLoading && (
              <p className="py-10 text-center text-sm text-muted-foreground">Loading orders…</p>
            )}
            {!orders.isLoading && (orders.data ?? []).length === 0 && (
              <p className="py-10 text-center text-sm text-muted-foreground">No orders yet.</p>
            )}
          </div>
        ) : (
          <div className="mt-8 max-w-2xl">
            <h2 className="text-2xl">Shipping settings</h2>
            <p className="mt-2 text-sm text-muted-foreground">Package measurements are used for Shiprocket shipment creation.</p>
            {shippingSettings.data && (
              <>
                <button type="button" onClick={() => setShippingDraft(shippingSettings.data)} className="micro-label mt-6 bg-ink px-5 py-3 text-paper">Edit shipping settings</button>
                <dl className="mt-6 grid gap-4 border-y border-ink/15 py-5 text-sm sm:grid-cols-2">
                  <div><dt className="micro-label text-muted-foreground">Pickup location</dt><dd className="mt-1">{shippingSettings.data.pickup_location}</dd></div>
                  <div><dt className="micro-label text-muted-foreground">Package</dt><dd className="mt-1">{shippingSettings.data.package_length_cm} × {shippingSettings.data.package_breadth_cm} × {shippingSettings.data.package_height_cm} cm · {shippingSettings.data.default_weight_kg} kg default</dd></div>
                </dl>
              </>
            )}
          </div>
        )}
      </div>

      {draft && (
        <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-ink/70 p-4">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              saveMutation.mutate(draft);
            }}
            className="my-8 w-full max-w-2xl space-y-4 border border-ink/20 bg-card p-6"
          >
            <h2 className="text-2xl">{draft.id ? "Edit product" : "New product"}</h2>
            <div className="grid gap-4 sm:grid-cols-2">
              {(
                [
                  ["name", "Name", "text"],
                  ["price", "Price (₹)", "number"],
                  ["discount_price", "Discount price (₹)", "number"],
                  ["stock", "Stock", "number"],
                  ["sizes", "Sizes (comma separated)", "text"],
                  ["colors", "Colours (comma separated)", "text"],
                   ["sku", "SKU (generated if blank)", "text"],
                   ["weight_kg", "Packed weight (kg)", "number"],
                ] as const
              ).map(([key, label, type]) => (
                <label key={key} className="block">
                  <span className="micro-label">{label}</span>
                  <input
                    type={type}
                    step={key === "weight_kg" ? "0.01" : undefined}
                    min={key === "weight_kg" ? "0.01" : undefined}
                    required={key === "name" || key === "price" || key === "stock"}
                    value={draft[key]}
                    onChange={(e) => setDraft({ ...draft, [key]: e.target.value })}
                    className="mt-2 w-full border border-ink/25 bg-background px-3 py-2.5 text-sm outline-none focus:border-accent"
                  />
                </label>
              ))}
              <label className="block">
                <span className="micro-label">Category</span>
                <select
                  value={draft.category}
                  onChange={(e) => setDraft({ ...draft, category: e.target.value })}
                  className="mt-2 w-full border border-ink/25 bg-background px-3 py-2.5 text-sm"
                >
                  {CATEGORIES.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </label>
            </div>
            <ProductImagePicker
              value={list(draft.images)}
              onChange={(images) => setDraft({ ...draft, images: images.join(", ") })}
            />
            <label className="block">
              <span className="micro-label">Description</span>
              <textarea
                rows={4}
                value={draft.description}
                onChange={(e) => setDraft({ ...draft, description: e.target.value })}
                className="mt-2 w-full border border-ink/25 bg-background px-3 py-2.5 text-sm outline-none focus:border-accent"
              />
            </label>
            <div className="flex gap-3">
              <button
                type="submit"
                disabled={saveMutation.isPending}
                className="micro-label flex-1 bg-ink py-3.5 text-paper disabled:opacity-50"
              >
                {saveMutation.isPending ? "Saving…" : "Save product"}
              </button>
              <button
                type="button"
                onClick={() => setDraft(null)}
                className="micro-label flex-1 border border-ink/25 py-3.5"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}
      {shippingDraft && (
        <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-ink/70 p-4">
          <form
            onSubmit={(event) => {
              event.preventDefault();
              shippingMutation.mutate(shippingDraft);
            }}
            className="my-8 w-full max-w-2xl space-y-4 border border-ink/20 bg-card p-6"
          >
            <h2 className="text-2xl">Shipping settings</h2>
            <label className="block">
              <span className="micro-label">Shiprocket pickup nickname</span>
              <input required value={shippingDraft.pickup_location} onChange={(event) => setShippingDraft({ ...shippingDraft, pickup_location: event.target.value })} className="mt-2 w-full border border-ink/25 bg-background px-3 py-2.5 text-sm" />
            </label>
            <div className="grid gap-4 sm:grid-cols-2">
              {([[
                "package_length_cm", "Length (cm)"],
                ["package_breadth_cm", "Breadth (cm)"],
                ["package_height_cm", "Height (cm)"],
                ["default_weight_kg", "Default weight (kg)"],
              ] as const).map(([key, label]) => (
                <label key={key} className="block">
                  <span className="micro-label">{label}</span>
                  <input type="number" min="0.51" step="0.01" required value={shippingDraft[key]} onChange={(event) => setShippingDraft({ ...shippingDraft, [key]: Number(event.target.value) })} className="mt-2 w-full border border-ink/25 bg-background px-3 py-2.5 text-sm" />
                </label>
              ))}
            </div>
            <div className="flex gap-3">
              <button type="submit" disabled={shippingMutation.isPending} className="micro-label flex-1 bg-ink py-3.5 text-paper disabled:opacity-50">Save settings</button>
              <button type="button" onClick={() => setShippingDraft(null)} className="micro-label flex-1 border border-ink/25 py-3.5">Cancel</button>
            </div>
          </form>
        </div>
      )}
    </StoreLayout>
  );
}
