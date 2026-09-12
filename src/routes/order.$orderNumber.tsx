import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { CheckCircle2 } from "lucide-react";
import { BrandLogo } from "@/components/BrandLogo";
import { StoreLayout } from "@/components/StoreLayout";
import { getOrderByNumber } from "@/lib/shop.functions";
import { formatINR } from "@/lib/types";

export const Route = createFileRoute("/order/$orderNumber")({
  head: () => ({
    meta: [
      { title: "Order Confirmed — 90'S CLOTHING" },
      { name: "description", content: "Your 90'S Clothing order details and delivery status." },
      { property: "og:title", content: "Order Confirmed — 90'S CLOTHING" },
      { property: "og:description", content: "Track the status of your 90'S Clothing order." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: OrderPage,
});

function OrderPage() {
  const { orderNumber } = Route.useParams();
  const fetchOrder = useServerFn(getOrderByNumber);
  const { data: order, isLoading } = useQuery({
    queryKey: ["order", orderNumber],
    queryFn: () => fetchOrder({ data: { orderNumber } }),
  });

  return (
    <StoreLayout>
      <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6">
        {isLoading ? (
          <p className="text-center text-sm text-muted-foreground">Loading your order…</p>
        ) : !order ? (
          <div className="text-center">
            <h1 className="text-4xl">Order not found</h1>
            <Link to="/shop" className="micro-label mt-6 inline-block bg-ink px-6 py-3 text-paper">
              Back to shop
            </Link>
          </div>
        ) : (
          <div className="border border-ink/15 bg-card p-8">
            <div className="flex items-center justify-between gap-4 border-b border-ink/10 pb-6">
              <BrandLogo className="h-9" />
              <span className="micro-label border border-ink/25 px-3 py-1.5">{order.status}</span>
            </div>

            <div className="mt-8 text-center">
              <CheckCircle2 className="mx-auto size-10 text-accent" />
              <h1 className="mt-4 text-4xl">Order confirmed</h1>
              <p className="mt-2 text-sm text-muted-foreground">
                Thanks {order.customer_name.split(" ")[0]} — we're packing your fit.
              </p>
              <p className="micro-label mt-4">Order no. {order.order_number}</p>
            </div>

            <ul className="mt-8 divide-y divide-ink/10 border-y border-ink/10">
              {order.order_items?.map((item) => (
                <li key={item.id} className="flex justify-between gap-4 py-4 text-sm">
                  <div>
                    <p className="font-bold uppercase tracking-wide">{item.product_name}</p>
                    <p className="micro-label text-muted-foreground">
                      {[item.size, item.color].filter(Boolean).join(" · ")} × {item.quantity}
                    </p>
                  </div>
                  <p className="font-bold">{formatINR(item.price * item.quantity)}</p>
                </li>
              ))}
            </ul>

            <div className="mt-6 flex justify-between text-base">
              <p className="font-bold uppercase">Total ({order.payment_method})</p>
              <p className="font-bold">{formatINR(order.total_amount)}</p>
            </div>

            <div className="mt-8 border-t border-ink/10 pt-6 text-sm text-muted-foreground">
              <p className="micro-label mb-2 text-foreground">Delivering to</p>
              <p>
                {order.address}, {order.city}, {order.state} — {order.pincode}
              </p>
              <p className="mt-1">
                {order.phone} · {order.email}
              </p>
            </div>

            {order.shiprocket_awb && (
              <div className="mt-6 border-t border-ink/10 pt-6 text-sm">
                <p className="micro-label mb-2">Shipment tracking</p>
                <p>
                  {order.shiprocket_courier || "Courier assigned"} · AWB {order.shiprocket_awb}
                </p>
                {order.shiprocket_tracking_status && (
                  <p className="mt-1 text-muted-foreground">{order.shiprocket_tracking_status}</p>
                )}
                {order.shiprocket_tracking_url && (
                  <a
                    href={order.shiprocket_tracking_url}
                    target="_blank"
                    rel="noreferrer"
                    className="micro-label mt-3 inline-block underline"
                  >
                    Track shipment
                  </a>
                )}
              </div>
            )}

            <Link
              to="/shop"
              className="micro-label mt-8 block bg-ink py-4 text-center text-paper transition-colors hover:bg-accent"
            >
              Continue shopping
            </Link>
          </div>
        )}
      </div>
    </StoreLayout>
  );
}
