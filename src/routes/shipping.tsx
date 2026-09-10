import { createFileRoute } from "@tanstack/react-router";
import { PageHeader, StoreLayout } from "@/components/StoreLayout";
import {
  BUSINESS,
  COD_FEE,
  DELIVERY_DAYS,
  DELIVERY_FEE,
  FREE_DELIVERY_ABOVE,
  telHref,
  whatsappHref,
} from "@/lib/business";
import { formatINR } from "@/lib/types";

export const Route = createFileRoute("/shipping")({
  head: () => ({
    meta: [
      { title: "Delivery & Returns — 90'S CLOTHING" },
      {
        name: "description",
        content: `Delivery in ${DELIVERY_DAYS}, ${formatINR(DELIVERY_FEE)} delivery charge, free above ${formatINR(FREE_DELIVERY_ABOVE)}, ${formatINR(COD_FEE)} cash on delivery charge.`,
      },
      { property: "og:title", content: "Delivery & Returns — 90'S CLOTHING" },
      {
        property: "og:description",
        content: `Free delivery above ${formatINR(FREE_DELIVERY_ABOVE)} · Damaged-product returns within 7 days.`,
      },
    ],
  }),
  component: ShippingPage,
});

function ShippingPage() {
  return (
    <StoreLayout>
      <PageHeader title="Delivery & returns" subtitle="Delivery across India with cash on delivery." />
      <div className="mx-auto max-w-3xl space-y-8 px-4 py-14 text-sm leading-relaxed text-muted-foreground sm:px-6">
        <section>
          <h2 className="mb-3 text-xl text-foreground">Delivery time</h2>
          <p>Estimated delivery is {DELIVERY_DAYS} after your order is placed. We deliver across India.</p>
        </section>
        <section>
          <h2 className="mb-3 text-xl text-foreground">Delivery charges</h2>
          <p>
            Standard delivery is {formatINR(DELIVERY_FEE)}. Delivery is free on orders above{" "}
            {formatINR(FREE_DELIVERY_ABOVE)}.
          </p>
        </section>
        <section>
          <h2 className="mb-3 text-xl text-foreground">Cash on delivery</h2>
          <p>
            All orders are cash on delivery. An additional cash on delivery charge of{" "}
            {formatINR(COD_FEE)} applies to every order and is shown in your order total before you
            place the order.
          </p>
        </section>
        <section>
          <h2 className="mb-3 text-xl text-foreground">Returns & exchanges</h2>
          <p>
            Returns are accepted only if the product is delivered damaged. The request must be made
            within 7 days of delivery, and an unboxing video is required as proof for every
            damaged-product return. We do not accept returns for size issues or change of mind.
          </p>
          <p className="mt-3">
            To raise a damaged-product request,{" "}
            <a href={telHref} className="font-bold text-foreground underline">
              call {BUSINESS.phoneDisplay}
            </a>{" "}
            or{" "}
            <a
              href={whatsappHref}
              target="_blank"
              rel="noreferrer noopener"
              className="font-bold text-foreground underline"
            >
              message us on WhatsApp
            </a>{" "}
            with your order number and the unboxing video.
          </p>
        </section>
      </div>
    </StoreLayout>
  );
}
