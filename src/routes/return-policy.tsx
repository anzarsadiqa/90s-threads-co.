import { createFileRoute } from "@tanstack/react-router";
import { PageHeader, StoreLayout } from "@/components/StoreLayout";

export const Route = createFileRoute("/return-policy")({
  head: () => ({
    meta: [
      { title: "Return Policy — 90'S CLOTHING" },
      {
        name: "description",
        content: "Damaged-product replacement policy for 90'S Clothing orders.",
      },
      { property: "og:title", content: "Return Policy — 90'S CLOTHING" },
      {
        property: "og:description",
        content: "Damaged products may be returned within 7 days for replacement only.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: ReturnPolicyPage,
});

function ReturnPolicyPage() {
  return (
    <StoreLayout>
      <PageHeader title="Return policy" />
      <div className="mx-auto max-w-3xl space-y-5 px-4 py-14 text-sm leading-relaxed text-muted-foreground sm:px-6">
        <p>Only damaged products can be returned within 7 days of delivery.</p>
        <p>An unboxing video is always required as proof.</p>
        <p>No returns are accepted for size issues or change of mind.</p>
        <p>Approved damaged products will be replaced only. 90s Clothing pays replacement shipping.</p>
      </div>
    </StoreLayout>
  );
}