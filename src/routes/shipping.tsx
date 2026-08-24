import { createFileRoute } from "@tanstack/react-router";
import { PageHeader, StoreLayout } from "@/components/StoreLayout";

export const Route = createFileRoute("/shipping")({
  head: () => ({
    meta: [
      { title: "Shipping & Returns — 90'S CLOTHING" },
      {
        name: "description",
        content:
          "Delivery timelines, shipping charges, cash on delivery and the 7-day return process at 90'S Clothing.",
      },
      { property: "og:title", content: "Shipping & Returns — 90'S CLOTHING" },
      { property: "og:description", content: "Free shipping over ₹1999 and 7-day easy returns." },
    ],
  }),
  component: ShippingPage,
});

function ShippingPage() {
  return (
    <StoreLayout>
      <PageHeader title="Shipping & returns" subtitle="Pan-India delivery with cash on delivery." />
      <div className="mx-auto max-w-3xl space-y-8 px-4 py-14 text-sm leading-relaxed text-muted-foreground sm:px-6">
        <section>
          <h2 className="mb-3 text-xl text-foreground">Delivery</h2>
          <p>
            Orders are packed within 24–48 hours. Delivery takes 3–6 working days across India, and
            usually 3 days to metro cities. You'll get your order number the moment you check out.
          </p>
        </section>
        <section>
          <h2 className="mb-3 text-xl text-foreground">Charges</h2>
          <p>
            Shipping is free on orders above ₹1999. Below that a flat ₹99 applies. Cash on delivery
            carries no extra fee.
          </p>
        </section>
        <section>
          <h2 className="mb-3 text-xl text-foreground">Returns & exchanges</h2>
          <p>
            Return or exchange anything within 7 days of delivery as long as it is unworn, unwashed
            and has the original tags. Email hello@90sclothing.in with your order number and we'll
            arrange a pickup. Refunds land within 5–7 working days of the parcel reaching us.
          </p>
        </section>
        <section>
          <h2 className="mb-3 text-xl text-foreground">Damaged or wrong item</h2>
          <p>
            Send a photo within 48 hours of delivery and we'll ship a replacement at our cost — no
            return shipping charges for you.
          </p>
        </section>
      </div>
    </StoreLayout>
  );
}
