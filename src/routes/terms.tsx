import { createFileRoute } from "@tanstack/react-router";
import { PageHeader, StoreLayout } from "@/components/StoreLayout";

export const Route = createFileRoute("/terms")({
  head: () => ({
    meta: [
      { title: "Terms of Service — 90'S CLOTHING" },
      {
        name: "description",
        content: "The terms that apply when you shop with 90'S Clothing.",
      },
      { property: "og:title", content: "Terms of Service — 90'S CLOTHING" },
      { property: "og:description", content: "Orders, pricing, returns and liability terms." },
    ],
  }),
  component: TermsPage,
});

function TermsPage() {
  return (
    <StoreLayout>
      <PageHeader title="Terms of service" subtitle="Last updated: January 2026" />
      <div className="mx-auto max-w-3xl space-y-8 px-4 py-14 text-sm leading-relaxed text-muted-foreground sm:px-6">
        <section>
          <h2 className="mb-3 text-xl text-foreground">Orders</h2>
          <p>
            Placing an order is an offer to buy. We confirm it once the parcel is packed. We may
            cancel an order if an item is out of stock or the delivery address is unserviceable.
          </p>
        </section>
        <section>
          <h2 className="mb-3 text-xl text-foreground">Pricing</h2>
          <p>
            All prices are in Indian rupees and inclusive of taxes. We may change prices at any time,
            but never after an order is placed.
          </p>
        </section>
        <section>
          <h2 className="mb-3 text-xl text-foreground">Products</h2>
          <p>
            Colours may vary slightly between screens and garment batches. Small variations in wash
            and print placement are part of the character of each piece.
          </p>
        </section>
        <section>
          <h2 className="mb-3 text-xl text-foreground">Liability</h2>
          <p>
            Our liability for any order is limited to the amount you paid for it. These terms are
            governed by the laws of India.
          </p>
        </section>
      </div>
    </StoreLayout>
  );
}
