import { createFileRoute, Link } from "@tanstack/react-router";
import { Minus, Plus, Trash2 } from "lucide-react";
import { PageHeader, StoreLayout } from "@/components/StoreLayout";
import { lineKey, useCart } from "@/lib/cart";
import { COD_FEE, FREE_DELIVERY_ABOVE, orderCharges } from "@/lib/business";
import { formatINR } from "@/lib/types";

export const Route = createFileRoute("/cart")({
  head: () => ({
    meta: [
      { title: "Your Cart — 90'S CLOTHING" },
      { name: "description", content: "Review your 90s streetwear picks before checkout." },
      { property: "og:title", content: "Your Cart — 90'S CLOTHING" },
      { property: "og:description", content: "Review your picks and check out with cash on delivery." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: CartPage,
});

function CartPage() {
  const cart = useCart();
  const charges = orderCharges(cart.subtotal);

  return (
    <StoreLayout>
      <PageHeader
        title="Your cart"
        subtitle={`Free delivery on orders above ${formatINR(FREE_DELIVERY_ABOVE)} · ${formatINR(COD_FEE)} cash on delivery charge`}
      />
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6">
        {cart.lines.length === 0 ? (
          <div className="py-16 text-center">
            <p className="text-sm text-muted-foreground">Your cart is empty.</p>
            <Link to="/shop" className="micro-label mt-6 inline-block bg-ink px-6 py-3 text-paper">
              Start shopping
            </Link>
          </div>
        ) : (
          <div className="grid gap-12 lg:grid-cols-[1fr_360px]">
            <ul className="divide-y divide-ink/10 border-y border-ink/10">
              {cart.lines.map((line) => {
                const key = lineKey(line);
                return (
                  <li key={key} className="flex gap-4 py-5">
                    <img
                      src={line.image}
                      alt={line.name}
                      className="size-24 shrink-0 bg-muted object-cover sm:size-28"
                    />
                    <div className="flex flex-1 flex-col">
                      <div className="flex justify-between gap-3">
                        <div>
                          <p className="text-sm font-bold uppercase tracking-wide">{line.name}</p>
                          <p className="micro-label mt-1 text-muted-foreground">
                            {[line.size, line.color].filter(Boolean).join(" · ") || "One size"}
                          </p>
                        </div>
                        <p className="text-sm font-bold">{formatINR(line.price * line.quantity)}</p>
                      </div>
                      <div className="mt-auto flex items-center gap-4 pt-4">
                        <div className="flex items-center border border-ink/25">
                          <button
                            type="button"
                            aria-label="Decrease quantity"
                            onClick={() => cart.setQuantity(key, line.quantity - 1)}
                            className="px-2.5 py-2"
                          >
                            <Minus className="size-3.5" />
                          </button>
                          <span className="w-8 text-center text-sm font-bold">{line.quantity}</span>
                          <button
                            type="button"
                            aria-label="Increase quantity"
                            onClick={() => cart.setQuantity(key, line.quantity + 1)}
                            className="px-2.5 py-2"
                          >
                            <Plus className="size-3.5" />
                          </button>
                        </div>
                        <button
                          type="button"
                          onClick={() => cart.remove(key)}
                          className="micro-label inline-flex items-center gap-1.5 text-muted-foreground hover:text-destructive"
                        >
                          <Trash2 className="size-3.5" /> Remove
                        </button>
                      </div>
                    </div>
                  </li>
                );
              })}
            </ul>

            <aside className="h-max border border-ink/15 bg-card p-6">
              <h2 className="text-2xl">Summary</h2>
              <dl className="mt-6 space-y-3 text-sm">
                <div className="flex justify-between">
                  <dt className="text-muted-foreground">Subtotal</dt>
                  <dd className="font-bold">{formatINR(cart.subtotal)}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-muted-foreground">Shipping</dt>
                  <dd className="font-bold">{shipping === 0 ? "Free" : formatINR(shipping)}</dd>
                </div>
                <div className="flex justify-between border-t border-ink/15 pt-3 text-base">
                  <dt className="font-bold uppercase">Total</dt>
                  <dd className="font-bold">{formatINR(cart.subtotal + shipping)}</dd>
                </div>
              </dl>
              <Link
                to="/checkout"
                className="micro-label mt-6 block bg-ink py-4 text-center text-paper transition-colors hover:bg-accent"
              >
                Checkout
              </Link>
              <Link
                to="/shop"
                className="micro-label mt-3 block py-2 text-center text-muted-foreground hover:text-accent"
              >
                Continue shopping
              </Link>
            </aside>
          </div>
        )}
      </div>
    </StoreLayout>
  );
}
