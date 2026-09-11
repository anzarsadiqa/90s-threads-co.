import { createFileRoute } from "@tanstack/react-router";
import { PageHeader, StoreLayout } from "@/components/StoreLayout";

export const Route = createFileRoute("/refund-policy")({
  head: () => ({
    meta: [
      { title: "Refund Policy — 90'S CLOTHING" },
      { name: "description", content: "Refund and replacement policy for 90'S Clothing orders." },
      { property: "og:title", content: "Refund Policy — 90'S CLOTHING" },
      {
        property: "og:description",
        content: "No refunds. Eligible damaged products are handled through replacement only.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: RefundPolicyPage,
});

function RefundPolicyPage() {
  return (
    <StoreLayout>
      <PageHeader title="Refund policy" />
      <div className="mx-auto max-w-3xl px-4 py-14 text-sm leading-relaxed text-muted-foreground sm:px-6">
        <p>No refunds. Eligible damaged products are handled through replacement only.</p>
      </div>
    </StoreLayout>
  );
}