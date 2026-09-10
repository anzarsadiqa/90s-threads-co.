import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useMutation } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";
import { PageHeader, StoreLayout } from "@/components/StoreLayout";
import { useCart } from "@/lib/cart";
import { placeOrder } from "@/lib/shop.functions";
import {
  COD_FEE,
  DELIVERY_DAYS,
  FREE_DELIVERY_ABOVE,
  RETURN_POLICY,
  orderCharges,
} from "@/lib/business";
import { formatINR } from "@/lib/types";

export const Route = createFileRoute("/checkout")({
  head: () => ({
    meta: [
      { title: "Checkout — 90'S CLOTHING" },
      { name: "description", content: "Enter your delivery details and pay cash on delivery." },
      { property: "og:title", content: "Checkout — 90'S CLOTHING" },
      { property: "og:description", content: "Cash on delivery checkout, shipped across India." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: CheckoutPage,
});

const FIELDS = [
  { name: "customer_name", label: "Full name", type: "text", placeholder: "Aarav Sharma" },
  { name: "phone", label: "Mobile number", type: "tel", placeholder: "9876543210" },
  { name: "email", label: "Email", type: "email", placeholder: "you@email.com" },
  { name: "city", label: "City", type: "text", placeholder: "Mumbai" },
  { name: "state", label: "State", type: "text", placeholder: "Maharashtra" },
  { name: "pincode", label: "Pincode", type: "text", placeholder: "400001" },
] as const;

function CheckoutPage() {
  const cart = useCart();
  const navigate = useNavigate();
  const submitOrder = useServerFn(placeOrder);
  const [error, setError] = useState<string | null>(null);

  const charges = orderCharges(cart.subtotal);

  const mutation = useMutation({
    mutationFn: (form: Record<string, string>) =>
      submitOrder({
        data: {
          ...form,
          items: cart.lines.map((l) => ({
            product_id: l.product_id,
            quantity: l.quantity,
            size: l.size,
            color: l.color,
          })),
        },
      }),
    onSuccess: (result) => {
      cart.clear();
      toast.success("Order placed!");
      navigate({ to: "/order/$orderNumber", params: { orderNumber: result.order_number } });
    },
    onError: (err: Error) => {
      setError(err.message || "Could not place your order. Check your details and try again.");
    },
  });

  function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    const data = new FormData(event.currentTarget);
    const form: Record<string, string> = {};
    for (const [key, value] of data.entries()) form[key] = String(value).trim();
    mutation.mutate(form);
  }

  if (cart.lines.length === 0) {
    return (
      <StoreLayout>
        <PageHeader title="Checkout" />
        <div className="mx-auto max-w-3xl px-4 py-20 text-center">
          <p className="text-sm text-muted-foreground">Your cart is empty.</p>
          <Link to="/shop" className="micro-label mt-6 inline-block bg-ink px-6 py-3 text-paper">
            Shop products
          </Link>
        </div>
      </StoreLayout>
    );
  }

  return (
    <StoreLayout>
      <PageHeader title="Checkout" subtitle="Cash on delivery · Shipped across India" />
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6">
        <div className="grid gap-12 lg:grid-cols-[1fr_360px]">
          <form onSubmit={onSubmit} className="space-y-5">
            <h2 className="text-2xl">Delivery details</h2>
            <div className="grid gap-5 sm:grid-cols-2">
              {FIELDS.map((field) => (
                <label key={field.name} className="block">
                  <span className="micro-label">{field.label}</span>
                  <input
                    required
                    name={field.name}
                    type={field.type}
                    placeholder={field.placeholder}
                    maxLength={160}
                    className="mt-2 w-full border border-ink/25 bg-card px-3 py-3 text-sm outline-none focus:border-accent"
                  />
                </label>
              ))}
            </div>
            <label className="block">
              <span className="micro-label">Full address</span>
              <textarea
                required
                name="address"
                rows={3}
                maxLength={300}
                placeholder="Flat / house no, street, landmark"
                className="mt-2 w-full border border-ink/25 bg-card px-3 py-3 text-sm outline-none focus:border-accent"
              />
            </label>

            <div className="space-y-2 border border-ink/15 bg-card p-4 text-sm">
              <p className="micro-label">Payment method</p>
              <p>Cash on delivery — pay when your parcel arrives.</p>
              <p className="font-bold">
                An additional cash on delivery charge of {formatINR(COD_FEE)} applies to this order.
              </p>
              <p className="text-muted-foreground">
                {charges.delivery === 0
                  ? `Delivery is free on this order (above ${formatINR(FREE_DELIVERY_ABOVE)}).`
                  : `Delivery ${formatINR(charges.delivery)} — free above ${formatINR(FREE_DELIVERY_ABOVE)}.`}{" "}
                Estimated delivery in {DELIVERY_DAYS}.
              </p>
              <p className="text-muted-foreground">{RETURN_POLICY}</p>
            </div>

            {error && <p className="text-sm text-destructive">{error}</p>}

            <button
              type="submit"
              disabled={mutation.isPending}
              className="micro-label w-full bg-ink py-4 text-paper transition-colors hover:bg-accent disabled:opacity-50"
            >
              {mutation.isPending ? "Placing order…" : `Place order · ${formatINR(charges.total)}`}
            </button>
          </form>

          <aside className="h-max border border-ink/15 bg-card p-6">
            <h2 className="text-2xl">Order summary</h2>
            <ul className="mt-5 space-y-4">
              {cart.lines.map((line) => (
                <li key={`${line.product_id}${line.size}${line.color}`} className="flex gap-3">
                  <img src={line.image} alt="" className="size-16 bg-muted object-cover" />
                  <div className="flex-1 text-sm">
                    <p className="font-bold uppercase tracking-wide">{line.name}</p>
                    <p className="micro-label text-muted-foreground">
                      {[line.size, line.color].filter(Boolean).join(" · ")} × {line.quantity}
                    </p>
                  </div>
                  <p className="text-sm font-bold">{formatINR(line.price * line.quantity)}</p>
                </li>
              ))}
            </ul>
            <dl className="mt-6 space-y-2 border-t border-ink/15 pt-4 text-sm">
              <div className="flex justify-between">
                <dt className="text-muted-foreground">Subtotal</dt>
                <dd className="font-bold">{formatINR(cart.subtotal)}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-muted-foreground">Delivery</dt>
                <dd className="font-bold">
                  {charges.delivery === 0 ? "Free" : formatINR(charges.delivery)}
                </dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-muted-foreground">Cash on delivery charge</dt>
                <dd className="font-bold">{formatINR(charges.cod)}</dd>
              </div>
              <div className="flex justify-between border-t border-ink/15 pt-2 text-base">
                <dt className="font-bold uppercase">Total to pay</dt>
                <dd className="font-bold">{formatINR(charges.total)}</dd>
              </div>
            </dl>
          </aside>
        </div>
      </div>
    </StoreLayout>
  );
}
