import { createFileRoute } from "@tanstack/react-router";
import { PageHeader, StoreLayout } from "@/components/StoreLayout";

export const Route = createFileRoute("/disclaimer")({
  head: () => ({
    meta: [
      { title: "Disclaimer — 90'S CLOTHING" },
      { name: "description", content: "Product image and colour disclaimer for 90'S Clothing." },
      { property: "og:title", content: "Disclaimer — 90'S CLOTHING" },
      {
        property: "og:description",
        content: "Product colours may vary slightly, and images are for representation purposes.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: DisclaimerPage,
});

function DisclaimerPage() {
  return (
    <StoreLayout>
      <PageHeader title="Disclaimer" />
      <div className="mx-auto max-w-3xl space-y-5 px-4 py-14 text-sm leading-relaxed text-muted-foreground sm:px-6">
        <p>Product colours may vary slightly from images.</p>
        <p>Product images are for representation purposes.</p>
      </div>
    </StoreLayout>
  );
}