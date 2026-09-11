import { createFileRoute } from "@tanstack/react-router";
import { PageHeader, StoreLayout } from "@/components/StoreLayout";

export const Route = createFileRoute("/privacy")({
  head: () => ({
    meta: [
      { title: "Privacy Policy — 90'S CLOTHING" },
      {
        name: "description",
        content: "How 90'S Clothing collects, uses and protects your personal information.",
      },
      { property: "og:title", content: "Privacy Policy — 90'S CLOTHING" },
      {
        property: "og:description",
        content: "How customer and payment information is handled by 90'S Clothing.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: PrivacyPage,
});

function PrivacyPage() {
  return (
    <StoreLayout>
      <PageHeader title="Privacy policy" />
      <div className="mx-auto max-w-3xl space-y-8 px-4 py-14 text-sm leading-relaxed text-muted-foreground sm:px-6">
        <section>
          <h2 className="mb-3 text-xl text-foreground">Customer information</h2>
          <p>
            Customer information is used only for order processing and delivery.
          </p>
        </section>
        <section>
          <h2 className="mb-3 text-xl text-foreground">Payment information</h2>
          <p>Payment information is handled securely by the payment provider.</p>
        </section>
      </div>
    </StoreLayout>
  );
}
